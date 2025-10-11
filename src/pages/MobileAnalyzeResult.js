import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import Navigation from '../features/navigation/navigation';
import Footer from '../features/footer/footer';
import { ANALYZE_ENDPOINTS } from '../api/endPointRoute';
import MobileAnalysisReport from '../features/analyze/components/mobile/MobileAnalysisReport';
import { normalizeAnalysisResult } from '../features/analyze/utils/normalizeResult';

const IS_TEST_ENV = String(process.env.NODE_ENV || '').toLowerCase() === 'test';
const TEST_TIMEOUT_MS = 10_000;

const LOADING_MENTS = {
  ANY: [
    '분석을 준비하고 있어요…',
    '증거를 정리하고 있어요…',
    '신뢰도를 계산하고 있어요…',
    '잠시만 기다려 주세요…',
  ],
  ALIGN: ['얼굴을 포착하고 있어요…', '프레임을 정렬하는 중이에요…'],
  INFER: ['이상 징후를 감지하고 있어요…', 'AI 이미지 진위 여부를 확인 중이에요…'],
  POST: ['결과를 정리하고 있어요…', '리포트를 구성하고 있어요…'],
};

function pickMent(stage) {
  const pool = [
    ...(LOADING_MENTS[stage?.toUpperCase?.()] || []),
    ...LOADING_MENTS.ANY,
  ];
  const i = Math.floor(Math.random() * pool.length);
  return pool[i] || '분석 중이에요…';
}

function LoadingMent({ stage }) {
  const [text, setText] = useState(() => pickMent(stage));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!document.getElementById('mobile-loading-ment-anims')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'mobile-loading-ment-anims';
      styleEl.textContent = `@keyframes mobile-lm-shimmer {0%{background-position:200% 0}100%{background-position:-200% 0}}`;
      document.head.appendChild(styleEl);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      const t = setTimeout(() => {
        setText(pickMent(stage));
        setVisible(true);
      }, 300);
      return () => clearTimeout(t);
    }, 3600);
    return () => clearInterval(timer);
  }, [stage]);

  const shimmerStyle = {
    backgroundImage: 'linear-gradient(90deg, #94a3b8 0%, #64748b 50%, #94a3b8 100%)',
    backgroundSize: '200% 100%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: 'mobile-lm-shimmer 3s linear infinite',
  };

  return (
    <span
      className={`inline-block text-xs font-medium leading-5 transition-opacity duration-300 ease-in-out ${
        visible ? 'opacity-100' : 'opacity-0'
      } truncate whitespace-nowrap max-w-full`}
      style={shimmerStyle}
    >
      {text}
    </span>
  );
}

function resolveStageLabel(stage, t) {
  const key = typeof stage === 'string' ? stage.toUpperCase() : '';
  switch (key) {
    case 'ALIGN':
      return t('mobileAnalyze.processing.stage.align', '프레임 정렬 중');
    case 'INFER':
      return t('mobileAnalyze.processing.stage.infer', '패턴 분석 중');
    case 'POST':
      return t('mobileAnalyze.processing.stage.post', '리포트 정리 중');
    default:
      return t('mobileAnalyze.processing.stage.any', 'AI 흔적을 분석하는 중이에요');
  }
}

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
    const timeouts = [];
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
          const normalized = normalizeAnalysisResult(savedResult);
          setReports((prev) => ({
            ...prev,
            [jid]: {
              ...(prev[jid] || {}),
              result: normalized,
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
      let timeoutId = null;
      if (IS_TEST_ENV) {
        timeoutId = setTimeout(() => {
          setReports((prev) => {
            const current = prev[jid] || {};
            if (current.result || current.error) return prev;
            return {
              ...prev,
              [jid]: {
                ...current,
                error: t('mobileAnalyze.processing.timeout', '응답이 지연되고 있어요. 다시 시도해 주세요.'),
                fileMeta,
                timedOut: true,
              },
            };
          });
          try {
            es.close();
          } catch {}
          try {
            sessionStorage.removeItem(`sse:${jid}`);
            sessionStorage.removeItem(`sse:meta:${jid}`);
          } catch {}
        }, TEST_TIMEOUT_MS);
        timeouts.push(timeoutId);
      }
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
          const payload = normalizeAnalysisResult(data?.result || data);
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
        if (timeoutId) clearTimeout(timeoutId);
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
        if (timeoutId) clearTimeout(timeoutId);
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
      timeouts.forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    };
  }, [jobIds, t]);

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
          <header className="space-y-3">
            <div>
              <h1 className="text-[1.65rem] font-semibold leading-tight">
                {hasPending
                  ? t('mobileAnalyze.processing.title', '분석 중입니다…')
                  : t('mobileAnalyze.processing.doneTitle', '분석이 완료됐어요')}
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
                        className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-rose-100">{t('mobileAnalyze.processing.failed', '분석에 실패했어요.')}</p>
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
                        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                        className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl ring-1 ring-white/5 shadow-[0_24px_60px_-28px_rgba(2,6,23,0.6)]"
                      >
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-500/40 to-transparent" />
                        <div className="flex flex-col gap-5">
                          <div className="flex flex-col gap-2">
                            <p className="text-sm font-semibold text-slate-100">
                              {t('mobileAnalyze.processing.statusLabel', 'AI 흔적을 분석하는 중이에요')}
                            </p>
                            {fileName && (
                              <p className="truncate text-xs text-slate-400">파일: {fileName}</p>
                            )}
                            {modelKey && (
                              <span className="inline-flex items-center gap-1 self-start rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] uppercase tracking-[0.08em] text-sky-200">
                                {modelKey}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-slate-500">
                              ID&nbsp;<span className="font-mono text-slate-300">{shortId}</span>
                            </span>
                            <div className="ml-3 flex h-5 w-full max-w-[9rem] items-center justify-end overflow-hidden">
                              <LoadingMent stage={entry.stage} />
                            </div>
                          </div>

                          {percentValue != null && (
                            <div className="flex flex-col gap-2 text-[11px] text-slate-400">
                              <div className="flex items-center justify-between text-slate-400">
                                <span>{t('mobileAnalyze.processing.progressLabel', '진행률')}</span>
                                <span className="font-semibold text-slate-200">{Math.round(percentValue)}%</span>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-white/5">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 transition-all duration-500 shadow-[0_0_14px_0_rgba(56,189,248,0.35)]"
                                  style={{ width: `${progressWidth}%` }}
                                />
                              </div>
                            </div>
                          )}

                          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-3 text-[11px] text-slate-400">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">{t('mobileAnalyze.processing.currentStage', '현재 단계')}</span>
                              <span className="font-medium text-slate-200">{resolveStageLabel(entry.stage, t)}</span>
                            </div>
                          </div>
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
