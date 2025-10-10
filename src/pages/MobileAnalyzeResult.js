import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import Navigation from '../features/navigation/navigation';
import Footer from '../features/footer/footer';
import { ANALYZE_ENDPOINTS } from '../api/endPointRoute';
import MobileAnalysisReport from '../features/analyze/components/mobile/MobileAnalysisReport';

export default function MobileAnalyzeResult() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { lng } = useParams();
  const { search } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const jobIds = useMemo(() => {
    const csv = params.get('jobIds');
    if (!csv) return [];
    return csv.split(',').map((s) => s.trim()).filter(Boolean);
  }, [params]);
  const [reports, setReports] = useState({});

  useEffect(() => {
    if (jobIds.length === 0) {
      const fallback = lng ? `/${lng}/analyze/upload` : '/analyze/upload';
      navigate(fallback, { replace: true });
    }
  }, [jobIds.length, navigate, lng]);

  useEffect(() => {
    if (!jobIds.length) return;
    const sources = [];
    jobIds.forEach((jid) => {
      const token = sessionStorage.getItem(`sse:${jid}`);
      const metaStr = sessionStorage.getItem(`sse:meta:${jid}`);
      let fileMeta = null;
      try {
        fileMeta = metaStr ? JSON.parse(metaStr) : null;
      } catch {
        fileMeta = null;
      }
      setReports((prev) => ({
        ...prev,
        [jid]: {
          ...(prev[jid] || {}),
          fileMeta,
        },
      }));

      if (!token) {
        const savedResult = (() => {
          try {
            return JSON.parse(sessionStorage.getItem(`sse:report:${jid}`) || 'null');
          } catch {
            return null;
          }
        })();
        const savedFailed = sessionStorage.getItem(`sse:failed:${jid}`);
        if (savedResult) {
          setReports((prev) => ({
            ...prev,
            [jid]: {
              ...(prev[jid] || {}),
              result: savedResult,
              fileMeta,
            },
          }));
        } else if (savedFailed) {
          setReports((prev) => ({
            ...prev,
            [jid]: {
              ...(prev[jid] || {}),
              error: savedFailed,
              fileMeta,
            },
          }));
        }
        return;
      }

      const url = `${ANALYZE_ENDPOINTS.SSE(jid)}?token=${encodeURIComponent(token)}`;
      const es = new EventSource(url);
      sources.push(es);
      es.onopen = () => setReports((prev) => ({
        ...prev,
        [jid]: {
          ...(prev[jid] || {}),
          connected: true,
          fileMeta,
        },
      }));
      es.onerror = () => setReports((prev) => ({
        ...prev,
        [jid]: {
          ...(prev[jid] || {}),
          connected: false,
          fileMeta,
        },
      }));

      es.addEventListener('progress', (event) => {
        try {
          const data = JSON.parse(event.data || '{}');
          const stage = typeof data.stage === 'string' ? data.stage.toUpperCase() : null;
          setReports((prev) => ({
            ...prev,
            [jid]: {
              ...(prev[jid] || {}),
              stage,
              progress: data.progress,
              fileMeta,
            },
          }));
        } catch {}
      });

      es.addEventListener('result', (event) => {
        try {
          const data = JSON.parse(event.data || '{}');
          const payload = data?.result || data;
          setReports((prev) => ({
            ...prev,
            [jid]: {
              ...(prev[jid] || {}),
              result: payload,
              fileMeta,
            },
          }));
          try {
            sessionStorage.setItem(`sse:report:${jid}`, JSON.stringify(payload));
          } catch {}
        } catch {}
        es.close();
        try {
          sessionStorage.removeItem(`sse:${jid}`);
          sessionStorage.removeItem(`sse:meta:${jid}`);
        } catch {}
      });

      es.addEventListener('failed', (event) => {
        try {
          const data = JSON.parse(event.data || '{}');
          const reason = data?.reason || t('mobileAnalyze.processing.failed', '분석에 실패했어요.');
          setReports((prev) => ({
            ...prev,
            [jid]: {
              ...(prev[jid] || {}),
              error: reason,
              fileMeta,
            },
          }));
          try {
            sessionStorage.setItem(`sse:failed:${jid}`, reason);
          } catch {}
        } catch {
          setReports((prev) => ({
            ...prev,
            [jid]: {
              ...(prev[jid] || {}),
              error: t('mobileAnalyze.processing.failed', '분석에 실패했어요.'),
              fileMeta,
            },
          }));
        }
        es.close();
        try {
          sessionStorage.removeItem(`sse:${jid}`);
          sessionStorage.removeItem(`sse:meta:${jid}`);
        } catch {}
      });
    });

    return () => {
      sources.forEach((es) => {
        try { es.close(); } catch {}
      });
    };
  }, [jobIds, t]);

  const steps = useMemo(
    () => [
      {
        key: 'upload',
        label: t('mobileAnalyze.processing.steps.upload', '업로드 중'),
      },
      {
        key: 'verify',
        label: t('mobileAnalyze.processing.steps.verify', '메타 검증 중'),
      },
      {
        key: 'analyze',
        label: t('mobileAnalyze.processing.steps.analyze', 'AI 패턴 분석 중'),
      },
    ],
    [t]
  );
  const stageOrder = useMemo(() => ({ ALIGN: 0, INFER: 1, POST: 2 }), []);
  const analysisStates = useMemo(
    () => jobIds.map((jid) => ({ jobId: jid, ...(reports[jid] || {}) })),
    [jobIds, reports]
  );
  const hasPending = analysisStates.some((item) => !item.result && !item.error);
  const hasResults = analysisStates.some((item) => Boolean(item.result));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navigation variant="dark" />
      <main className="flex-1 flex justify-center">
        <div className="flex w-full max-w-sm flex-col gap-6 px-5 pb-14 pt-24">
          <header className="space-y-3 text-center">
            <div>
              <h1 className="text-[1.65rem] font-semibold leading-tight">
                {hasPending
                  ? t('mobileAnalyze.processing.title', '분석 중입니다…')
                  : t('mobileAnalyze.processing.doneTitle', '분석 결과가 준비됐어요')}
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                {hasPending
                  ? t('mobileAnalyze.processing.subtitle', '평균 30초 내에 결과가 준비돼요. 페이지를 닫지 말고 잠시만 기다려 주세요.')
                  : t('mobileAnalyze.processing.doneSubtitle', '요약 리포트를 아래에서 바로 확인해 주세요.')}
              </p>
            </div>
          </header>

          <div className="space-y-5">
            {analysisStates.map((entry) => {
              const stageKey = String(entry.stage || '').toUpperCase();
              const stageIndex = typeof stageOrder[stageKey] === 'number' ? stageOrder[stageKey] : 0;
              const rawProgress = typeof entry.progress === 'number' ? entry.progress : null;
              const percentValue =
                rawProgress == null ? null : Math.max(0, rawProgress > 1 ? Math.min(rawProgress, 100) : rawProgress * 100);
              const progressWidth = percentValue == null ? null : Math.min(100, Math.max(12, percentValue));
              const fileName = entry.fileMeta?.name || '';
              const modelKey = entry.fileMeta?.modelKey || '';
              const shortId = entry.jobId ? entry.jobId.slice(-6) : '—';

              return (
                <motion.div key={entry.jobId} layout>
                  <AnimatePresence mode="wait" initial={false}>
                    {entry.error && !entry.result ? (
                      <motion.section
                        key="error"
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                        className="rounded-[28px] border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100 shadow-[0_24px_52px_-36px_rgba(244,63,94,0.6)]"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold">{t('mobileAnalyze.processing.failed', '분석에 실패했어요.')}</p>
                          <span className="text-[11px] text-rose-200/80 tracking-[0.14em] uppercase">
                            ID&nbsp;<span className="font-mono">{shortId}</span>
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-rose-200/80">{entry.error}</p>
                        <p className="mt-2 text-[11px] text-rose-200/70">
                          {t('mobileAnalyze.processing.failedHint', '다시 시도하거나 PC 버전에서 분석을 진행해 주세요.')}
                        </p>
                      </motion.section>
                    ) : entry.result ? (
                      <motion.div
                        key="result"
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                      >
                        <MobileAnalysisReport jobId={entry.jobId} report={entry} t={t} />
                      </motion.div>
                    ) : (
                      <motion.section
                        key="pending"
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                        className="rounded-[32px] border border-indigo-500/25 bg-[linear-gradient(160deg,rgba(15,23,42,0.92),rgba(27,33,58,0.82))] p-5 shadow-[0_28px_60px_-32px_rgba(79,70,229,0.6)]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="relative inline-flex h-10 w-10 items-center justify-center">
                              <span className="absolute inset-0 rounded-full border-2 border-indigo-500/25" aria-hidden="true" />
                              <span className="absolute inset-0 rounded-full border-2 border-t-transparent border-indigo-400 animate-spin" aria-hidden="true" />
                              <span className="sr-only">
                                {t('mobileAnalyze.processing.statusLabel', 'AI 흔적을 분석하는 중이에요')}
                              </span>
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-100">
                                {t('mobileAnalyze.processing.statusLabel', 'AI 흔적을 분석하는 중이에요')}
                              </p>
                              {fileName && (
                                <p className="mt-0.5 max-w-[12rem] truncate text-xs text-slate-400">{fileName}</p>
                              )}
                              {modelKey && <p className="text-[11px] text-indigo-200/70">{modelKey}</p>}
                            </div>
                          </div>
                          <span className="text-[11px] text-slate-500 tracking-[0.14em] uppercase">
                            ID&nbsp;<span className="font-mono text-slate-300">{shortId}</span>
                          </span>
                        </div>

                        <div className="mt-5 space-y-3">
                          <ul className="space-y-2">
                            {steps.map((item, index) => {
                              const isActive = index === stageIndex;
                              const isDone = index < stageIndex;
                              return (
                                <li
                                  key={item.key}
                                  className={`flex items-center gap-3 rounded-2xl border px-3 py-2 text-sm transition ${
                                    isActive
                                      ? 'border-indigo-400/60 bg-indigo-500/10 text-indigo-200 shadow-[0_12px_32px_-18px_rgba(99,102,241,0.55)]'
                                      : isDone
                                      ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-200'
                                      : 'border-slate-800 bg-slate-900/60 text-slate-400'
                                  }`}
                                >
                                  <span
                                    className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                                      isActive
                                        ? 'bg-indigo-500 text-white'
                                        : isDone
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-slate-800 text-slate-400'
                                    }`}
                                  >
                                    {index + 1}
                                  </span>
                                  <span className="flex-1 text-left">{item.label}</span>
                                  {isActive && (
                                    <span className="flex h-2 w-2 animate-pulse rounded-full bg-indigo-400" aria-hidden="true" />
                                  )}
                                </li>
                              );
                            })}
                          </ul>

                          {percentValue != null && (
                            <div className="flex flex-col gap-1.5 text-[11px] text-slate-400">
                              <div className="flex items-center justify-between text-slate-300">
                                <span>{t('mobileAnalyze.processing.progressLabel', '진행률')}</span>
                                <span className="font-semibold text-indigo-200">{Math.round(percentValue)}%</span>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-slate-800">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-sky-400 to-indigo-300 transition-all duration-500"
                                  style={{ width: `${progressWidth}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.section>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {!hasPending && hasResults && (
            <p className="text-center text-[11px] text-slate-500">
              {t('mobileAnalyze.processing.doneFooter', '상세 차트가 필요하다면 데스크톱 결과 페이지에서 이어서 확인할 수 있어요.')}
            </p>
          )}
        </div>
      </main>
      <Footer transparent inline variant="dark" showLinks={false} />
    </div>
  );
}
