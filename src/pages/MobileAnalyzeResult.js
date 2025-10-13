import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Sparkles } from 'lucide-react';
import Navigation from '../features/navigation/navigation';
import Footer from '../features/footer/footer';
import { ANALYZE_ENDPOINTS } from '../api/endPointRoute';
import MobileAnalysisReport from '../features/analyze/components/mobile/MobileAnalysisReport';
import { normalizeAnalysisResult } from '../features/analyze/utils/normalizeResult';
import { buildStoredFailure, buildStoredReport, parseStoredFailure, parseStoredReport } from '../utils/reportStorage';

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
      className={`inline-flex items-center text-[11px] font-semibold tracking-[0.04em] transition-opacity duration-300 ease-in-out ${
        visible ? 'opacity-100' : 'opacity-0'
      } whitespace-nowrap`}
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
        const storedReportRaw = sessionStorage.getItem(`sse:report:${jid}`);
        const { result: storedResult, fileMeta: storedMeta } = parseStoredReport(storedReportRaw, fileMeta);
        const effectiveMeta = storedMeta || fileMeta;
        if (storedResult) {
          const normalized = normalizeAnalysisResult(storedResult);
          setReports((prev) => ({
            ...prev,
            [jid]: {
              ...(prev[jid] || {}),
              result: normalized,
              fileMeta: effectiveMeta,
            },
          }));
        } else {
          const storedFailedRaw = sessionStorage.getItem(`sse:failed:${jid}`);
          const { reason: storedReason, fileMeta: failedMeta } = parseStoredFailure(storedFailedRaw, effectiveMeta);
          if (storedReason) {
            setReports((prev) => ({
              ...prev,
              [jid]: {
                ...(prev[jid] || {}),
                error: storedReason,
                fileMeta: failedMeta || effectiveMeta,
              },
            }));
          }
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
            sessionStorage.setItem(`sse:report:${jid}`, JSON.stringify(buildStoredReport(payload, fileMeta)));
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
            sessionStorage.setItem(`sse:failed:${jid}`, JSON.stringify(buildStoredFailure(reason, fileMeta)));
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
  const summary = useMemo(() => {
    const total = analysisStates.length;
    const success = analysisStates.filter((item) => Boolean(item.result)).length;
    const failed = analysisStates.filter(
      (item) => !item.result && Boolean(item.error)
    ).length;
    const pending = Math.max(0, total - success - failed);
    return { total, success, failed, pending };
  }, [analysisStates]);
  const titleText = hasPending
    ? t('mobileAnalyze.processing.title', '분석 중입니다…')
    : t('mobileAnalyze.processing.doneTitle', '분석이 완료됐어요');
  const subtitleText = hasPending
    ? t(
        'mobileAnalyze.processing.subtitle',
        '평균 30초 내에 결과가 준비돼요. 페이지를 닫지 말고 잠시만 기다려 주세요.'
      )
    : t(
        'mobileAnalyze.processing.doneSubtitle',
        '요약 리포트를 아래에서 바로 확인해 주세요.'
      );
  const isCompletedView = !hasPending && summary.total > 0;

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <Navigation variant="dark" />
      <main className="relative flex-1">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(56,189,248,0.18),transparent_60%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_0%,rgba(129,140,248,0.12),transparent_60%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto flex w-full max-w-[460px] flex-col gap-8 px-5 pb-24 pt-24">
          <header
            className={`relative overflow-hidden rounded-[32px] border border-white/10 px-6 shadow-[0_32px_70px_-42px_rgba(15,23,42,0.92)] backdrop-blur-xl ${
              isCompletedView ? 'bg-slate-900/60 py-8' : 'bg-slate-900/70 py-7'
            }`}
          >
            {isCompletedView ? (
              <>
                <div
                  className="pointer-events-none absolute -left-20 -top-24 h-44 w-44 rounded-full bg-emerald-500/18 blur-3xl"
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute -right-16 bottom-[-28px] h-52 w-52 rounded-full bg-teal-500/16 blur-3xl"
                  aria-hidden="true"
                />
              </>
            ) : (
              <>
                <div
                  className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-sky-500/24 blur-3xl"
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute -right-12 bottom-[-24px] h-48 w-48 rounded-full bg-indigo-500/18 blur-3xl"
                  aria-hidden="true"
                />
              </>
            )}
            <div className="relative flex flex-col items-center text-center">
              {isCompletedView ? (
                <div className="flex w-full flex-col items-center gap-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-200">
                      <CheckCircle2 aria-hidden className="h-7 w-7" />
                    </div>
                    <div className="space-y-2">
                      <h1 className="text-[1.55rem] font-semibold leading-snug text-white">{titleText}</h1>
                      <p className="text-sm leading-relaxed text-slate-200/90">{subtitleText}</p>
                    </div>
                  </div>
                  <p className="flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/5 px-4 py-3 text-[11px] font-medium text-emerald-100">
                    <Sparkles aria-hidden className="h-4 w-4" />
                    {t(
                      'mobileAnalyze.processing.doneHint',
                      '모든 파일의 정리가 끝났어요. 아래에서 차분히 결과를 확인해 보세요.'
                    )}
                  </p>
                  <dl className="grid w-full grid-cols-3 gap-2 text-[11px] text-slate-300">
                    <div className="flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-slate-200/90">
                      <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                        {t('mobileAnalyze.processing.stat.pending', '대기')}
                      </dt>
                      <dd className="text-xl font-semibold text-white">{summary.pending}</dd>
                    </div>
                    <div className="flex flex-col items-center gap-1 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-3 text-emerald-100">
                      <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-200/80">
                        {t('mobileAnalyze.processing.stat.completed', '완료')}
                      </dt>
                      <dd className="text-xl font-semibold text-white">{summary.success}</dd>
                    </div>
                    <div className="flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-slate-200/90">
                      <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                        {t('mobileAnalyze.processing.stat.failed', '실패')}
                      </dt>
                      <dd className="text-xl font-semibold text-white">{summary.failed}</dd>
                    </div>
                  </dl>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-7">
                  <div className="space-y-3">
                    <h1 className="text-[1.65rem] font-semibold leading-snug text-white">
                      {titleText}
                    </h1>
                    <p className="text-sm leading-relaxed text-slate-200/90">{subtitleText}</p>
                    {summary.total > 0 && (
                      <p className="text-[11px] text-slate-400">
                        {hasPending
                          ? t('mobileAnalyze.processing.summary.progressing', '실시간으로 결과가 이어지고 있어요.')
                          : t('mobileAnalyze.processing.summary.completed', '모든 파일에 대한 결과가 정리됐어요.')}
                      </p>
                    )}
                  </div>
                  {summary.total > 0 && (
                    <div className="grid w-full grid-cols-3 gap-3">
                      <div className="flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 shadow-[0_24px_36px_-32px_rgba(15,23,42,0.9)]">
                        <span className="text-2xl font-semibold text-white">{summary.pending}</span>
                        <span className="text-[11px] text-slate-400">
                          {t('mobileAnalyze.processing.stat.pending', '대기')}
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 shadow-[0_24px_36px_-32px_rgba(15,23,42,0.9)]">
                        <span className="text-2xl font-semibold text-white">{summary.success}</span>
                        <span className="text-[11px] text-slate-400">
                          {t('mobileAnalyze.processing.stat.completed', '완료')}
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 shadow-[0_24px_36px_-32px_rgba(15,23,42,0.9)]">
                        <span className="text-2xl font-semibold text-white">{summary.failed}</span>
                        <span className="text-[11px] text-slate-400">
                          {t('mobileAnalyze.processing.stat.failed', '실패')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </header>

          <div className="flex flex-col gap-6">
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
                        className="relative overflow-hidden rounded-[28px] border border-rose-500/40 bg-slate-950/75 px-5 py-6 text-sm text-rose-100 shadow-[0_34px_64px_-38px_rgba(127,29,29,0.45)] backdrop-blur-lg"
                      >
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />
                        <div className="pointer-events-none absolute -right-24 top-[-30%] h-44 w-44 rounded-full bg-rose-500/18 blur-3xl" />
                        <div className="relative flex flex-col gap-5">
                          <div className="flex items-center justify-between gap-3">
                            <span className="inline-flex items-center rounded-full bg-rose-500/15 px-3 py-1 text-[11px] font-medium text-rose-100">
                              {t('mobileAnalyze.processing.failedBadge', '처리 오류')}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-mono text-rose-50/90">
                              #{shortId}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm leading-relaxed text-rose-100/85">
                              {entry.error || t('mobileAnalyze.processing.failed', '분석에 실패했어요.')}
                            </p>
                          </div>
                          <dl className="grid grid-cols-[minmax(4.5rem,auto),1fr] gap-x-4 gap-y-2 text-[11px] text-rose-100/75">
                            {fileName && (
                              <>
                                <dt className="text-rose-200/70">
                                  {t('mobileAnalyze.processing.fileLabel', '파일')}
                                </dt>
                                <dd className="truncate text-rose-100">{fileName}</dd>
                              </>
                            )}
                            {modelKey && (
                              <>
                                <dt className="text-rose-200/70">
                                  {t('mobileAnalyze.processing.modelLabel', '모델')}
                                </dt>
                                <dd className="text-rose-100">{modelKey}</dd>
                              </>
                            )}
                          </dl>
                          <p className="text-[11px] text-rose-200/70">
                            {t('mobileAnalyze.processing.failedHint', '다시 시도하거나 PC 버전에서 분석을 진행해 주세요.')}
                          </p>
                        </div>
                      </motion.section>
                    ) : entry.result ? (
                      <motion.div
                        key="result"
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                        className="rounded-[34px] border border-white/5 bg-slate-900/40 p-[1px] shadow-[0_32px_60px_-36px_rgba(15,23,42,0.9)] backdrop-blur"
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
                        className="relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/70 px-5 py-6 shadow-[0_34px_60px_-38px_rgba(15,23,42,0.85)] backdrop-blur-xl"
                      >
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-500/40 to-transparent" />
                        <div className="pointer-events-none absolute right-[-30%] top-[-35%] h-56 w-56 rounded-full bg-sky-500/18 blur-3xl" />
                        <div className="relative flex flex-col gap-5">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center rounded-full bg-sky-500/15 px-3 py-1 text-[11px] font-medium text-sky-100">
                                {t('mobileAnalyze.processing.badgePending', 'Processing')}
                              </span>
                              <LoadingMent stage={entry.stage} />
                            </div>
                            <span className="inline-flex items-center rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-mono text-slate-300">
                              #{shortId}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <h2 className="text-lg font-semibold text-white">
                              {fileName || t('mobileAnalyze.processing.unknownFile', '이름 없는 파일')}
                            </h2>
                            <p className="text-sm text-slate-300">
                              {resolveStageLabel(entry.stage, t)}
                            </p>
                          </div>
                          {modelKey && (
                            <div className="text-[11px] text-slate-400">
                              <span className="text-slate-500">{t('mobileAnalyze.processing.modelLabel', '모델')} · </span>
                              <span className="text-sky-200">{modelKey}</span>
                            </div>
                          )}
                          {percentValue != null && (
                            <div className="space-y-2 text-[11px] text-slate-400">
                              <div className="flex items-center justify-between">
                                <span>{t('mobileAnalyze.processing.progressLabel', '진행률')}</span>
                                <span className="font-semibold text-slate-100">
                                  {Math.round(percentValue)}%
                                </span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-white/5">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 transition-[width] duration-500 ease-out shadow-[0_0_18px_rgba(59,130,246,0.55)]"
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
            <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-center text-[11px] text-slate-300 shadow-[0_24px_40px_-40px_rgba(15,23,42,0.9)]">
              {t(
                'mobileAnalyze.processing.doneFooter',
                '상세 차트가 필요하다면 데스크톱 결과 페이지에서 이어서 확인할 수 있어요.'
              )}
            </div>
          )}
        </div>
      </main>
      <Footer transparent inline variant="dark" showLinks={false} />
    </div>
  );
}
