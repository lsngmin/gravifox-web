import React, { Fragment, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import usePreviewUrl from '../../../../utils/usePreviewUrl';
import MobileHeatmapPreview from './MobileHeatmapPreview';
import { useThemeMode } from '../../../../app/hooks/useThemeMode';

const METRIC_DEFS = [
  { key: 'prob_std', label: '확률 표준편차', formatter: formatDecimal },
  { key: 'high_conf_ratio', label: '고확신 구간 비율', formatter: formatPercent },
  { key: 'heatmap_score', label: '히트맵 지표', formatter: formatPercent },
  { key: 'latency_sec', label: '총 처리 시간', formatter: formatSeconds },
  { key: 'sample_fps', label: '샘플 FPS', formatter: formatNumber },
  { key: 'clip_len', label: '클립 길이', formatter: formatNumber },
  { key: 'clip_stride', label: '클립 간격', formatter: formatNumber },
  { key: 'aligned_cnt', label: '얼굴 정렬 성공', formatter: formatNumber },
  { key: 'infer_cnt', label: '추론 클립 수', formatter: formatNumber },
  { key: 'frames_total', label: '처리한 프레임 수', formatter: formatNumber },
  { key: 'stability', label: '안정성 지표', formatter: formatDecimal },
  { key: 'spectral', label: '스펙트럴 지표', formatter: formatSpectral },
];

function formatPercent(value, fraction = 1) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-';
  return `${(value * 100).toFixed(fraction)}%`;
}

function formatDecimal(value, fraction = 3) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-';
  if (Math.abs(value) >= 100) return value.toFixed(0);
  if (Math.abs(value) >= 10) return value.toFixed(1);
  return value.toFixed(fraction);
}

function formatNumber(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-';
  if (Number.isInteger(value)) return value.toLocaleString();
  if (Math.abs(value) >= 100) return value.toFixed(0);
  if (Math.abs(value) >= 10) return value.toFixed(1);
  return value.toFixed(2);
}

function formatSeconds(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-';
  if (value < 60) return `${value.toFixed(value < 10 ? 2 : 1)}초`;
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return seconds > 1 ? `${minutes}분 ${seconds.toFixed(0)}초` : `${minutes}분`;
}

function formatFileSize(bytes) {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes < 0) return '-';
  if (bytes === 0) return '0B';
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unitIndex = -1;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  if (unitIndex === -1) return `${value}B`;
  const precision = value >= 100 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toFixed(precision)}${units[unitIndex]}`;
}

function formatSpectral(value) {
  if (value && typeof value === 'object') {
    if (typeof value.outlier_ratio === 'number') {
      return formatPercent(value.outlier_ratio);
    }
    if (typeof value.energy === 'number') {
      return formatDecimal(value.energy);
    }
    return '-';
  }
  return formatDecimal(value);
}

function formatDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return date.toLocaleString('ko-KR', options);
}

function resolveLabel(data) {
  const raw = data?.label || data?.decision;
  if (!raw && typeof data?.prob_fake === 'number' && typeof data?.threshold === 'number') {
    return data.prob_fake >= data.threshold ? 'FAKE' : 'REAL';
  }
  if (!raw) return 'UNKNOWN';
  return String(raw).toUpperCase();
}

function getLabelTone(label) {
  if (label === 'REAL') {
    return {
      badge: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-300/60 dark:bg-emerald-500/20 dark:text-emerald-100',
      dot: 'bg-emerald-500 dark:bg-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.35)]',
      headingAccent: 'text-emerald-200',
    };
  }
  if (label === 'FAKE') {
    return {
      badge: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/60 dark:bg-[rgba(80,7,36,0.6)] dark:text-rose-100',
      dot: 'bg-rose-500 dark:bg-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.28)]',
      headingAccent: 'text-rose-100',
    };
  }
  return {
    badge: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-300/60 dark:bg-amber-500/22 dark:text-amber-100',
    dot: 'bg-amber-500 dark:bg-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.35)]',
    headingAccent: 'text-amber-200',
  };
}

function verdictCopy(label, probFake, threshold) {
  if (typeof probFake !== 'number' || typeof threshold !== 'number') {
    if (label === 'FAKE') return 'AI 생성 가능성이 기준치를 넘어섰어요.';
    if (label === 'REAL') return '기준치보다 낮아서 실제 촬영 가능성이 커요.';
    return '세부 데이터를 확인할 수 없었어요.';
  }
  const nearBoundary = Math.abs(probFake - threshold) <= 0.05;
  if (probFake >= threshold) {
    return nearBoundary
      ? '기준치 바로 위에 있어요. 조금만 조건이 달라도 결과가 바뀔 수 있어요.'
      : '기준치를 충분히 넘어 AI 생성일 확률이 높아요.';
  }
  return nearBoundary
    ? '기준치보다 조금 낮아요. 상황에 따라 결과가 달라질 수 있어요.'
    : '기준치보다 낮게 나와 실제 촬영 가능성이 커요.';
}

function cautionCopy(data) {
  const ratio = typeof data?.high_conf_ratio === 'number' ? data.high_conf_ratio : null;
  const spectralOutlier = typeof data?.spectral?.outlier_ratio === 'number' ? data.spectral.outlier_ratio : null;
  if (ratio != null && ratio >= 0.2) {
    return '고확신 구간이 자주 나타났어요. 의심되는 구간 중심으로 다시 확인해 보세요.';
  }
  if (spectralOutlier != null && spectralOutlier >= 0.5) {
    return '영상 내 파형 이상치가 높게 측정됐어요. 합성 흔적일 가능성에 주의하세요.';
  }
  if (ratio != null && ratio <= 0.05) {
    return '고확신 구간이 거의 없어 비교적 안정적인 결과예요.';
  }
  if (spectralOutlier != null && spectralOutlier <= 0.2) {
    return '주파수 기반 지표가 낮아 급격한 튐이 드물었어요.';
  }
  return null;
}

/**
 * MobileReportDrawer
 * - Full-screen, portal-based overlay optimised for the mobile analyze result page.
 * - Matches the sizing/feel of the mobile navigation panel.
 */
export default function MobileReportDrawer({ open, onClose = () => {}, data, mediaMeta, jobId }) {
  const { t } = useTranslation('common');
  const { themeMode } = useThemeMode();
  const isDark = themeMode === 'dark';
  // Lock body scroll and close on ESC while open
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  const label = useMemo(() => resolveLabel(data), [data]);
  const tone = useMemo(() => getLabelTone(label), [label]);
  const probFake = typeof data?.prob_fake === 'number' ? data.prob_fake : typeof data?.pAi === 'number' ? data.pAi : null;
  const probReal = typeof data?.pReal === 'number' ? data.pReal : (typeof probFake === 'number' ? 1 - probFake : null);
  const threshold = typeof data?.threshold === 'number' ? data.threshold : null;
  const probDisplay = probFake != null ? formatPercent(probFake) : '—';
  const realDisplay = probReal != null ? formatPercent(probReal) : null;
  const thresholdDisplay = threshold != null ? formatPercent(threshold) : null;
  const verdict = useMemo(() => verdictCopy(label, probFake, threshold), [label, probFake, threshold]);
  const caution = useMemo(() => cautionCopy(data), [data]);
  const metrics = useMemo(() => {
    if (!data) return [];
    return METRIC_DEFS.flatMap((def) => {
      let source = data[def.key];
      if (def.key === 'spectral') {
        source = data?.spectral;
      }
      if (source == null) return [];
      const value = def.formatter(source);
      if (value == null || value === '-') return [];
      return [{ key: def.key, label: def.label, value }];
    });
  }, [data]);
  const spectralDetails = useMemo(() => {
    if (!data?.spectral || typeof data.spectral !== 'object') return null;
    const entries = [];
    if (typeof data.spectral.outlier_ratio === 'number') {
      entries.push({ key: 'outlier_ratio', label: '이상치 비율', value: formatPercent(data.spectral.outlier_ratio) });
    }
    if (typeof data.spectral.energy === 'number') {
      entries.push({ key: 'energy', label: '에너지 지표', value: formatDecimal(data.spectral.energy) });
    }
    if (typeof data.spectral.mean === 'number') {
      entries.push({ key: 'mean', label: '평균 값', value: formatDecimal(data.spectral.mean) });
    }
    return entries.length > 0 ? entries : null;
  }, [data]);
  const storedAt = mediaMeta?.storedAt || mediaMeta?.stored_at || data?.storedAt;
  const formattedStoredAt = storedAt ? formatDate(storedAt) : null;
  const previewSrc = usePreviewUrl(mediaMeta);
  const heatmapData =
    (data && typeof data.heatmap === 'object' && data.heatmap) ||
    (data && typeof data.inference === 'object' && data.inference && data.inference.heatmap) ||
    null;
  const showHeatmapPreview =
    Boolean(previewSrc) &&
    heatmapData &&
    Array.isArray(heatmapData.cells) &&
    heatmapData.cells.length > 0;

  if (typeof document === 'undefined') return null;

  return createPortal(
    <Transition show={open} as={Fragment} appear>
      <div className="fixed inset-0 z-[120] flex items-center justify-center px-5 py-8 sm:px-6">
        <Transition.Child
          as={Fragment}
          enter="transition-opacity duration-300 ease-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-200 ease-in"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm dark:bg-slate-950/60"
            onClick={onClose}
            aria-hidden="true"
          />
        </Transition.Child>
        <Transition.Child
          as={Fragment}
          enter="transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]"
          enterFrom="opacity-0 translate-y-6 scale-[0.98]"
          enterTo="opacity-100 translate-y-0 scale-100"
          leave="transition-transform duration-250 ease-[cubic-bezier(0.4,0,0.2,1)]"
          leaveFrom="opacity-100 translate-y-0 scale-100"
          leaveTo="opacity-0 translate-y-4 scale-[0.98]"
        >
          <div className="relative z-[121] flex h-[90vh] w-full max-w-[460px] flex-col overflow-hidden rounded-[32px] border bg-white text-slate-900 shadow-xl border-slate-200 dark:border-slate-700/60 dark:bg-slate-950/95 dark:text-slate-100 dark:shadow-[0_36px_68px_-28px_rgba(8,11,24,0.78)]">
            <header className="flex items-center justify-between gap-3 border-b px-5 py-4 border-slate-200 dark:border-slate-800/60">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{t('mobileAnalyze.report.detailTitle', 'Detail Report')}</p>
                <h2 className="mt-1 truncate text-lg font-semibold text-slate-900 dark:text-white">
                  {mediaMeta?.name || '미디어 분석 리포트'}
                </h2>
                {jobId && (
                  <span className="mt-2 inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium tracking-wide border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-slate-300">
                    Job · {jobId}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border text-slate-600 transition hover:bg-slate-100 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300 border-slate-200 bg-white dark:border-slate-700/60 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800/80 dark:hover:text-white"
                aria-label="리포트 닫기"
              >
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-5">
              {data ? (
                <div className="flex flex-col gap-5 pb-4">
                  <section
                    className={`relative overflow-hidden rounded-[28px] border p-[1px] shadow-sm ${
                      isDark
                        ? 'border-slate-800/70 bg-slate-950/92 shadow-[0_24px_50px_-32px_rgba(0,0,0,0.75)]'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div
                      className={`absolute inset-0 rounded-[28px] ${
                        isDark
                          ? 'bg-[radial-gradient(circle_at_20%_15%,rgba(129,140,248,0.12),transparent_60%),radial-gradient(circle_at_82%_20%,rgba(56,189,248,0.1),transparent_65%)]'
                          : 'hidden'
                      }`}
                      aria-hidden="true"
                    />
                    <div
                      className={`relative rounded-[27px] border p-5 sm:p-6 backdrop-blur ${
                        isDark ? 'border-slate-800 bg-slate-950/95' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] ${tone.badge}`}>
                          <span className={`h-2.5 w-2.5 rounded-full ${tone.dot}`} />
                          {label}
                        </span>
                        <span className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                          isDark
                            ? 'border-indigo-200/25 bg-indigo-950/70 text-indigo-100'
                            : 'border-slate-200 bg-slate-50 text-slate-700'
                        }`}>
                          {t('mobileAnalyze.report.metrics.generationProbability', '생성 확률')}
                          <span className="text-slate-900 dark:text-white">{probDisplay}</span>
                        </span>
                        {realDisplay && (
                          <span className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                            isDark
                              ? 'border-slate-700/50 bg-slate-950/80 text-slate-100'
                              : 'border-slate-200 bg-slate-50 text-slate-700'
                          }`}>
                            {t('mobileAnalyze.report.metrics.realProbability', '실제 확률')}
                            <span className="text-slate-900 dark:text-slate-100">{realDisplay}</span>
                          </span>
                        )}
                      </div>
                      <div className="mt-5 space-y-3">
                        <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{t('mobileAnalyze.report.metrics.suspicionScore', '의심 점수')}</p>
                            <p className={`mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-50 ${tone.headingAccent}`}>
                              {probDisplay}
                            </p>
                          </div>
                          {thresholdDisplay && (
                            <div>
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{t('mobileAnalyze.report.metrics.threshold', '기준선')}</p>
                              <p className="mt-2 text-lg font-semibold text-slate-800 dark:text-slate-100">{thresholdDisplay}</p>
                            </div>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200/95">{verdict}</p>
                        {caution && (
                          <p className="text-xs leading-6 text-slate-600 dark:text-slate-400">
                            {caution}
                          </p>
                        )}
                      </div>
                    </div>
                  </section>

                  {metrics.length > 0 && (
                    <section className="rounded-[26px] border border-slate-800/60 bg-slate-900/85 p-5 shadow-[0_22px_44px_-34px_rgba(0,0,0,0.65)]">
                      <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">핵심 지표</h3>
                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {metrics.map((item) => (
                          <div
                            key={item.key}
                            className="rounded-[22px] border border-slate-800/70 bg-slate-950/80 p-4 shadow-[0_18px_32px_-28px_rgba(0,0,0,0.75)]"
                          >
                            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                              {item.label}
                            </p>
                            <p className="mt-2 text-lg font-semibold text-slate-50">
                              {item.value}
                            </p>
                          </div>
                        ))}
                      </div>
                      {spectralDetails && (
                        <div className="mt-4 rounded-2xl border border-indigo-200/20 bg-indigo-950/40 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-100/90">
                            스펙트럴 세부 지표
                          </p>
                          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {spectralDetails.map((entry) => (
                              <div key={entry.key} className="rounded-xl bg-slate-950/75 px-4 py-3 text-sm text-slate-100">
                                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{entry.label}</div>
                                <div className="mt-1 text-base font-semibold text-indigo-100">{entry.value}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </section>
                  )}

                  {showHeatmapPreview && (
                    <MobileHeatmapPreview
                      imageSrc={previewSrc}
                      mediaName={mediaMeta?.name}
                      heatmap={heatmapData}
                    />
                  )}

                  <section className="rounded-[26px] border p-5 border-slate-200 bg-white dark:border-slate-800/60 dark:bg-slate-950/70">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-600 dark:text-slate-400">{t('mobileAnalyze.report.fileInfo', '파일 정보')}</h3>
                    <dl className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-700 dark:text-slate-200 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{t('mobileAnalyze.report.file.name', '파일명')}</dt>
                        <dd className="mt-1 break-words text-slate-900 dark:text-slate-50">{mediaMeta?.name || '이름 없음'}</dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{t('mobileAnalyze.report.file.size', '파일 크기')}</dt>
                        <dd className="mt-1 text-slate-900 dark:text-slate-50">{formatFileSize(mediaMeta?.size)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{t('mobileAnalyze.report.file.type', '형식')}</dt>
                        <dd className="mt-1 text-slate-900 dark:text-slate-50">{mediaMeta?.type || '알 수 없음'}</dd>
                      </div>
                      {formattedStoredAt && (
                        <div>
                          <dt className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{t('mobileAnalyze.report.file.storedAt', '저장 시각')}</dt>
                          <dd className="mt-1 text-slate-900 dark:text-slate-50">{formattedStoredAt}</dd>
                        </div>
                      )}
                      {jobId && (
                        <div>
                          <dt className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{t('mobileAnalyze.report.file.jobId', 'Job ID')}</dt>
                          <dd className="mt-1 break-all text-slate-900 dark:text-slate-50">{jobId}</dd>
                        </div>
                      )}
                    </dl>
                  </section>

                  <section className="rounded-[24px] border px-5 py-4 text-xs leading-6 border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100">
                    {t('mobileAnalyze.report.desktopHint', '데스크톱 대시보드에서 세부 그래프와 다운로드 기능을 이용할 수 있어요. 중요한 판단이 필요하다면 동일 파일을 다시 업로드해 이중 확인해 주세요.')}
                  </section>
                </div>
              ) : (
                <div className="rounded-2xl border p-6 text-sm border-slate-200 bg-white text-slate-700 dark:border-slate-700/40 dark:bg-slate-900/70 dark:text-slate-200">
                  {t('mobileAnalyze.report.loadFailed', '리포트를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.')}
                </div>
              )}
            </div>
          </div>
        </Transition.Child>
      </div>
    </Transition>,
    document.body
  );
}
