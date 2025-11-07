import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import Header from '../app/layout/Header';
import Footer from '../app/layout/Footer/Footer';
import { ANALYZE_ENDPOINTS } from '../api/endPointRoute';
import MobileAnalysisReport from '../features/analyze/components/mobile/MobileAnalysisReport';
import { normalizeAnalysisResult } from '../features/analyze/utils/normalizeResult';
import { buildStoredFailure, buildStoredReport, parseStoredFailure, parseStoredReport } from '../utils/reportStorage';
import { useAnalyzeFlow } from '../features/analyze/contexts/AnalyzeFlowContext';
import { useThemeMode } from '../app/hooks/useThemeMode';

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
  const { isTestMode, ensureTestReports } = useAnalyzeFlow();
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
    if (isTestMode) {
      ensureTestReports(jobIds);
    }
    const sources = [];
    const timeouts = [];
    jobIds.forEach((jid) => {
      const token = isTestMode ? null : sessionStorage.getItem(`sse:${jid}`);
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
  }, [ensureTestReports, isTestMode, jobIds, t]);

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
  const dashboardLine1 = t(
    'mobileAnalyze.processing.doneFooter.line1',
    '결과는 일주일 동안 자동으로 대시보드에 저장돼요.'
  );
  const dashboardLine2 = t(
    'mobileAnalyze.processing.doneFooter.line2',
    '언제든지 다시 확인해 보세요.'
  );
  const { themeMode } = useThemeMode();
  const isDark = themeMode === 'dark';
  const statCardClass = `flex flex-col items-center gap-1 rounded-2xl px-4 py-4 ${
    isDark
      ? 'border border-white/10 bg-black/30 shadow-[0_24px_36px_-32px_rgba(15,23,42,0.9)]'
      : 'border border-slate-200 bg-white shadow-sm'
  }`;
  const statValueClass = `text-2xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`;
  const statLabelClass = `text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`;
  const tipContainerClass = `rounded-[24px] border px-5 py-4 text-left text-[11px] ${
    isDark
      ? 'border-emerald-300/10 bg-emerald-500/5 text-emerald-100 shadow-[0_18px_42px_-36px_rgba(16,185,129,0.55)]'
      : 'border-emerald-100 bg-emerald-50 text-emerald-900 shadow-[0_10px_24px_-20px_rgba(16,185,129,0.35)]'
  }`;
  const tipTitleClass = `font-semibold uppercase tracking-[0.22em] ${
    isDark ? 'text-emerald-200/80' : 'text-emerald-600'
  }`;
  const tipBodyClass = `mt-1 leading-relaxed ${isDark ? 'text-emerald-100/90' : 'text-emerald-900/80'}`;
  const resultWrapperClass = `rounded-[32px] p-[1px] transition-all duration-300 ${
    isDark
      ? 'bg-slate-950/55 shadow-[0_32px_60px_-38px_rgba(15,23,42,0.9)] backdrop-blur ring-1 ring-transparent'
      : 'border border-slate-200 bg-white shadow-[0_18px_38px_-30px_rgba(15,23,42,0.2)]'
  }`;
  const errorContainerClass = `relative overflow-hidden rounded-[26px] px-5 py-6 text-sm ${
    isDark
      ? 'bg-slate-950/75 text-rose-100 shadow-[0_34px_64px_-38px_rgba(127,29,29,0.45)] backdrop-blur-lg ring-1 ring-rose-400/40 ring-inset'
      : 'border border-rose-200 bg-rose-50 text-rose-900 shadow-sm'
  }`;
  const errorBadgeClass = `inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium ${
    isDark ? 'bg-rose-500/15 text-rose-100' : 'bg-rose-100 text-rose-700'
  }`;
  const errorTextClass = isDark ? 'text-sm leading-relaxed text-rose-100/85' : 'text-sm leading-relaxed text-rose-900';
  const errorMetaLabelClass = isDark ? 'text-rose-200/70' : 'text-rose-600';
  const errorMetaValueClass = isDark ? 'text-rose-100' : 'text-rose-900';
  const pendingContainerClass = `relative overflow-hidden rounded-[26px] px-5 py-6 ${
    isDark
      ? 'bg-slate-900/70 text-white shadow-[0_34px_60px_-38px_rgba(15,23,42,0.85)] backdrop-blur-xl ring-1 ring-sky-300/25 ring-inset'
      : 'border border-slate-200 bg-white text-slate-900 shadow-sm'
  }`;
  const pendingBadgeClass = `inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium ${
    isDark ? 'bg-sky-500/15 text-sky-100' : 'bg-sky-100 text-sky-700'
  }`;
  const pendingTitleClass = `text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`;
  const pendingSubtitleClass = `text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`;
  const pendingModelLabelClass = `text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`;
  const pendingModelValueClass = isDark ? 'text-sky-200' : 'text-slate-800';
  const pendingProgressValueClass = `font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`;
  const pendingProgressTrackClass = isDark ? 'bg-white/5' : 'bg-slate-200';
  const dashboardCardClass = `rounded-3xl border px-5 py-4 text-center text-[11px] ${
    isDark
      ? 'border-white/10 bg-white/5 text-slate-300 shadow-[0_24px_40px_-40px_rgba(15,23,42,0.9)]'
      : 'border-slate-200 bg-slate-50 text-slate-700 shadow-sm'
  }`;

  return (
    <div className={`${isDark ? 'dark bg-slate-950 text-slate-100' : 'bg-white text-slate-900'} flex min-h-screen flex-col`}>
      <Header />
      <main className="relative flex-1">
        <div className="pointer-events-none absolute inset-0 hidden dark:block bg-[radial-gradient(circle_at_15%_10%,rgba(56,189,248,0.18),transparent_60%)]" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 hidden dark:block bg-[radial-gradient(circle_at_85%_0%,rgba(129,140,248,0.12),transparent_60%)]" aria-hidden="true" />
        <div className="relative mx-auto flex w-full max-w-[460px] flex-col gap-4 px-5 pb-4 pt-16">
          <header
            className={`relative overflow-hidden rounded-[28px] px-6 shadow-sm backdrop-blur-xl ring-1 ${
              isCompletedView ? 'bg-white/90 ring-slate-200 py-5 dark:bg-slate-950/60 dark:ring-transparent' : 'bg-white/95 ring-slate-200 py-7 dark:bg-slate-950/70 dark:ring-transparent'
            }`}
          >
            {isCompletedView ? (
              <>
                <div className="pointer-events-none absolute inset-0 hidden rounded-[28px] bg-gradient-to-br from-emerald-400/10 via-teal-300/8 to-transparent dark:block" aria-hidden="true" />
                <div className="pointer-events-none absolute inset-0 hidden rounded-[28px] bg-[radial-gradient(circle_at_18%_20%,rgba(59,130,246,0.24),transparent_55%)] dark:block" aria-hidden="true" />
                <div className="pointer-events-none absolute inset-0 hidden rounded-[28px] bg-[conic-gradient(from_120deg_at_80%_15%,rgba(16,185,129,0.28)_0deg,transparent_120deg)] dark:block" aria-hidden="true" />
              </>
            ) : (
              <>
                <div className="pointer-events-none absolute -left-16 -top-16 hidden h-40 w-40 rounded-full bg-sky-500/24 blur-3xl dark:block" aria-hidden="true" />
                <div className="pointer-events-none absolute -right-12 bottom-[-24px] hidden h-48 w-48 rounded-full bg-indigo-500/18 blur-3xl dark:block" aria-hidden="true" />
              </>
            )}
            <div className="relative flex flex-col items-center text-center">
              {isCompletedView ? (
                <div className="flex w-full flex-col items-center gap-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm dark:border-emerald-400/45 dark:bg-emerald-500/10 dark:text-emerald-100 dark:shadow-[0_18px_42px_-30px_rgba(16,185,129,0.85)]"
                    aria-label={titleText}
                  >
                    <CheckCircle2 aria-hidden className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <h1 className="text-[1.35rem] font-semibold leading-tight text-slate-900 dark:text-white">{titleText}</h1>
                    <p className="text-[11px] leading-snug text-slate-600 dark:text-slate-300">{subtitleText}</p>
                  </div>
                

                </div>
              ) : (
                <div className="flex flex-col items-center gap-7">
                  <div className="space-y-3">
                    <h1 className={`text-[1.65rem] font-semibold leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {titleText}
                    </h1>
                    <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-200/90' : 'text-slate-600'}`}>{subtitleText}</p>
                    {summary.total > 0 && (
                      <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {hasPending
                          ? t('mobileAnalyze.processing.summary.progressing', '실시간으로 결과가 이어지고 있어요.')
                          : t('mobileAnalyze.processing.summary.completed', '모든 파일에 대한 결과가 정리됐어요.')}
                      </p>
                    )}
                  </div>
                  {summary.total > 0 && (
                    <div className="grid w-full grid-cols-3 gap-3">
                      <div className={statCardClass}>
                        <span className={statValueClass}>{summary.pending}</span>
                        <span className={statLabelClass}>
                          {t('mobileAnalyze.processing.stat.pending', '대기')}
                        </span>
                      </div>
                      <div className={statCardClass}>
                        <span className={statValueClass}>{summary.success}</span>
                        <span className={statLabelClass}>
                          {t('mobileAnalyze.processing.stat.completed', '완료')}
                        </span>
                      </div>
                      <div className={statCardClass}>
                        <span className={statValueClass}>{summary.failed}</span>
                        <span className={statLabelClass}>
                          {t('mobileAnalyze.processing.stat.failed', '실패')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </header>

          {isCompletedView && (
            <section className={tipContainerClass}>
              <p className={tipTitleClass}>
                {t('mobileAnalyze.processing.tip.title', 'TIP')}
              </p>
              <p className={tipBodyClass}>
                {t(
                  'mobileAnalyze.processing.tip.body',
                  '생성 확률은 AI가 합성을 얼마나 의심하는지를 보여줘요. 0%에 가까우면 실제 촬영 사진에 가깝고, 100%에 가까울수록 AI 생성 가능성이 높다는 뜻이에요.'
                )}
              </p>
            </section>
          )}

          <div className="flex flex-col gap-3">
            {analysisStates.map((entry) => {
              const rawProgress = typeof entry.progress === 'number' ? entry.progress : null;
              const percentValue =
                rawProgress == null ? null : Math.max(0, rawProgress > 1 ? Math.min(rawProgress, 100) : rawProgress * 100);
              const progressWidth = percentValue == null ? null : Math.min(100, Math.max(12, percentValue));
              const fileName = entry.fileMeta?.name || '';
              const modelKey = entry.fileMeta?.modelKey || '';
              const modelName = entry.fileMeta?.modelName || entry.result?.model?.name || '';
              const modelVersion = entry.fileMeta?.modelVersion || entry.result?.model?.version || '';
              let primaryModelLabel = modelName || modelKey || '';
              if (!primaryModelLabel && modelVersion) {
                primaryModelLabel = modelVersion;
              }
              const versionLabel = modelVersion && modelVersion !== primaryModelLabel ? modelVersion : '';
              const keySuffix = modelName && modelKey ? modelKey : '';
              const hasModelLabel = Boolean(primaryModelLabel);
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
                        className={errorContainerClass}
                      >
                        <div className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-500/40 to-transparent ${isDark ? '' : 'hidden'}`} />
                        <div className={`pointer-events-none absolute -right-24 top-[-30%] h-44 w-44 rounded-full bg-rose-500/18 blur-3xl ${isDark ? '' : 'hidden'}`} />
                        <div className="relative flex flex-col gap-5">
                          <div className="flex items-center justify-between gap-3">
                            <span className={errorBadgeClass}>
                              {t('mobileAnalyze.processing.failedBadge', '처리 오류')}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <p className={errorTextClass}>
                              {entry.error || t('mobileAnalyze.processing.failed', '분석에 실패했어요.')}
                            </p>
                          </div>
                          <dl className="grid grid-cols-[minmax(4.5rem,auto),1fr] gap-x-4 gap-y-2 text-[11px]">
                            {fileName && (
                              <>
                                <dt className={errorMetaLabelClass}>
                                  {t('mobileAnalyze.processing.fileLabel', '파일')}
                                </dt>
                                <dd className={`truncate ${errorMetaValueClass}`}>{fileName}</dd>
                              </>
                            )}
                            {hasModelLabel && (
                              <>
                                <dt className={errorMetaLabelClass}>
                                  {t('mobileAnalyze.processing.modelLabel', '모델')}
                                </dt>
                                <dd className={errorMetaValueClass}>
                                  <span>{primaryModelLabel}</span>
                                  {versionLabel && (
                                    <span className={isDark ? 'ml-2 text-rose-200/75' : 'ml-2 text-rose-600/80'}>{versionLabel}</span>
                                  )}
                                  {keySuffix && (
                                    <span className={isDark ? 'ml-2 text-rose-200/60' : 'ml-2 text-rose-500/70'}>({keySuffix})</span>
                                  )}
                                </dd>
                              </>
                            )}
                          </dl>
                          <p className={`text-[11px] ${isDark ? 'text-rose-200/70' : 'text-rose-600/80'}`}>
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
                        transition={{
                          duration: 0.4,
                          ease: [0.4, 0, 0.2, 1],
                          layout: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] },
                        }}
                        className={resultWrapperClass}
                      >
                        <MobileAnalysisReport
                          report={entry}
                          t={t}
                        />
                      </motion.div>
                    ) : (
                      <motion.section
                        key="pending"
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                        className={pendingContainerClass}
                      >
                        <div className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-500/40 to-transparent ${isDark ? '' : 'hidden'}`} />
                        <div className={`pointer-events-none absolute right-[-30%] top-[-35%] h-56 w-56 rounded-full bg-sky-500/18 blur-3xl ${isDark ? '' : 'hidden'}`} />
                        <div className="relative flex flex-col gap-5">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className={pendingBadgeClass}>
                                {t('mobileAnalyze.processing.badgePending', 'Processing')}
                              </span>
                              <LoadingMent stage={entry.stage} />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h2 className={pendingTitleClass}>
                              {fileName || t('mobileAnalyze.processing.unknownFile', '이름 없는 파일')}
                            </h2>
                            <p className={pendingSubtitleClass}>
                              {resolveStageLabel(entry.stage, t)}
                            </p>
                          </div>
                          {hasModelLabel && (
                            <div className={pendingModelLabelClass}>
                              <span className="text-slate-500">{t('mobileAnalyze.processing.modelLabel', '모델')} · </span>
                              <span className={`ml-1 ${pendingModelValueClass}`}>
                                {primaryModelLabel}
                                {versionLabel && (
                                  <span className={`ml-2 ${isDark ? 'text-sky-200/80' : 'text-slate-600/80'}`}>{versionLabel}</span>
                                )}
                                {keySuffix && (
                                  <span className={`ml-2 ${isDark ? 'text-sky-200/60' : 'text-slate-500/70'}`}>({keySuffix})</span>
                                )}
                              </span>
                            </div>
                          )}
                          {percentValue != null && (
                            <div className={`space-y-2 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              <div className="flex items-center justify-between">
                                <span>{t('mobileAnalyze.processing.progressLabel', '진행률')}</span>
                                <span className={pendingProgressValueClass}>
                                  {Math.round(percentValue)}%
                                </span>
                              </div>
                              <div className={`h-2 w-full rounded-full ${pendingProgressTrackClass}`}>
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
            <div className={dashboardCardClass}>
              <p>
                {dashboardLine1}
                <br />
                {dashboardLine2}
              </p>
              <a
                href="/dashboard"
                className="mt-2 inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] border-sky-200 bg-sky-50 text-sky-700 shadow-sm transition hover:bg-sky-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/60 dark:border-sky-200/25 dark:bg-sky-400/10 dark:text-sky-50 dark:shadow-[0_16px_26px_-20px_rgba(56,189,248,0.35)] dark:hover:bg-sky-400/18"
              >
                {t('mobileAnalyze.processing.doneFooter.link', '대시보드로 이동하기')}
              </a>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
