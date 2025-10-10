import React, { useMemo, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, ChevronDown } from 'lucide-react';

const LABEL_TONE = {
  REAL: {
    bg: 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200',
    icon: <CheckCircle2 size={18} />,
    title: 'REAL',
  },
  FAKE: {
    bg: 'bg-rose-500/15 border-rose-400/40 text-rose-200',
    icon: <AlertTriangle size={18} />,
    title: 'FAKE',
  },
  UNKNOWN: {
    bg: 'bg-amber-500/15 border-amber-400/40 text-amber-200',
    icon: <Info size={18} />,
    title: 'UNKNOWN',
  },
};

const toPercent = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-';
  return `${(value * 100).toFixed(1)}%`;
};

function VerdictBadge({ label = 'UNKNOWN', title }) {
  const toneKey = (label || 'UNKNOWN').toUpperCase();
  const tone = LABEL_TONE[toneKey] || LABEL_TONE.UNKNOWN;
  return (
    <div className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${tone.bg}`}>
      <span className="inline-flex h-5 w-5 items-center justify-center text-white">{tone.icon}</span>
      <span className="tracking-[0.14em]">{title || tone.title}</span>
    </div>
  );
}

function MetricRow({ label, value, hint }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-2xl border border-slate-800/70 bg-slate-900/60 p-3">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-200">{label}</span>
      <span className="text-sm font-semibold text-slate-100">{value}</span>
      {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

export default function MobileAnalysisReport({ jobId, report, t }) {
  const data = report?.result || {};
  const label = (data.label || 'UNKNOWN').toUpperCase();
  const [collapsed, setCollapsed] = useState(false);
  const tone = LABEL_TONE[label] || LABEL_TONE.UNKNOWN;
  const verdictTitle = t
    ? t(`mobileAnalyze.report.badge.${label.toLowerCase()}`, tone.title)
    : tone.title;

  const probFake = typeof data.prob_fake === 'number' ? data.prob_fake : null;
  const probStd = typeof data.prob_std === 'number' ? data.prob_std : null;
  const threshold = typeof data.threshold === 'number' ? data.threshold : null;
  const highConf = typeof data.high_conf_ratio === 'number' ? data.high_conf_ratio : null;
  const aggName = data?.agg?.name;
  const aggScore = typeof data?.agg?.score === 'number' ? data.agg.score : null;
  const latency = typeof data.latency_sec === 'number' ? data.latency_sec : null;
  const runtimeBackend = data?.runtime?.backend;
  const runtimeDevice = data?.runtime?.device;
  const quantiles = data?.quantiles && typeof data.quantiles === 'object' ? data.quantiles : null;
  const probsTimeline = Array.isArray(data?.probs_timeline) ? data.probs_timeline : [];
  const exemplars = Array.isArray(data?.exemplars) ? data.exemplars : [];
  const segments = Array.isArray(data?.segments) ? data.segments : [];
  const probabilities = Array.isArray(data?.probabilities) ? data.probabilities : [];

  const scoreDelta =
    probFake != null && threshold != null ? probFake - threshold : null;

  const quantileEntries = useMemo(() => {
    if (!quantiles) return [];
    const order = ['p50', 'p75', 'p90', 'p95', 'max'];
    return order
      .map((key) =>
        typeof quantiles[key] === 'number'
          ? { key: key.toUpperCase(), value: quantiles[key] }
          : null
      )
      .filter(Boolean);
  }, [quantiles]);

  const probabilityChips = useMemo(() => {
    if (!probabilities.length) return [];
    return probabilities
      .map((value, index) => ({ index, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, Math.min(3, probabilities.length));
  }, [probabilities]);

  const timelineSummary = useMemo(() => {
    if (!probsTimeline.length) return null;
    if (probsTimeline.length <= 1) {
      return t?.('mobileAnalyze.report.timeline.single', '단일 이미지 분석이라 타임라인은 하나의 점수만 있어요.');
    }
    const min = Math.min(...probsTimeline);
    const max = Math.max(...probsTimeline);
    return t?.('mobileAnalyze.report.timeline.multi', {
      min: min.toFixed(3),
      max: max.toFixed(3),
      count: probsTimeline.length,
    }) || `Scores between ${min.toFixed(3)} and ${max.toFixed(3)} across ${probsTimeline.length} samples.`;
  }, [probsTimeline, t]);

  const timelineTrend = useMemo(() => {
    if (!probsTimeline.length || typeof threshold !== 'number' || probsTimeline.length <= 1) {
      return null;
    }
    const above = probsTimeline.filter((value) => value >= threshold).length;
    const ratio = probsTimeline.length ? above / probsTimeline.length : 0;
    const percent = toPercent(ratio);
    return t?.('mobileAnalyze.report.timeline.trend', { ratio: percent }) || `Above-threshold coverage: ${percent}.`;
  }, [probsTimeline, threshold, t]);

  const segmentHighlight = useMemo(() => {
    if (!segments.length) return null;
    const first = segments[0];
    const start = typeof first.start === 'number' ? first.start.toFixed(2) : '0.00';
    const end = typeof first.end === 'number' ? first.end.toFixed(2) : '0.00';
    return t?.('mobileAnalyze.report.exemplars.thresholdHit', { start, end }) ||
      `A region crossed the threshold (start ${start}, end ${end}).`;
  }, [segments, t]);

  const heroImage = useMemo(() => {
    const samples = data?.faces?.samples;
    if (!Array.isArray(samples) || samples.length === 0) return null;
    const first = samples.find((item) => item?.image_jpg_base64);
    return first?.image_jpg_base64 ? `data:image/jpeg;base64,${first.image_jpg_base64}` : null;
  }, [data]);

  const summaryLines = useMemo(() => {
    const lines = [];
    if (typeof data.prob_fake === 'number' && typeof data.threshold === 'number') {
      const delta = data.prob_fake - data.threshold;
      const verdictWord =
        delta >= 0
          ? t?.('mobileAnalyze.report.summary.highRisk', '합성 의심 신호가 기준보다 높아요.')
          : t?.('mobileAnalyze.report.summary.lowRisk', '합성 의심 신호가 기준보다 낮아요.');
      lines.push(verdictWord);
    }
    if (!lines.length) {
      lines.push(t?.('mobileAnalyze.report.summary.default', '세부 항목을 함께 확인해 주세요.'));
    }
    return lines.slice(0, 3);
  }, [data, t]);

  return (
    <section className="rounded-[32px] border border-indigo-500/25 bg-[linear-gradient(160deg,rgba(15,23,42,0.92),rgba(27,33,58,0.82))] p-5 shadow-[0_28px_60px_-32px_rgba(79,70,229,0.6)]">
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-expanded={!collapsed}
          className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-800/60 bg-slate-900/40 px-4 py-3 text-left transition hover:border-indigo-400/50 hover:bg-indigo-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/40"
        >
          <VerdictBadge label={label} title={verdictTitle} />
          <span className="text-[11px] text-slate-400 tracking-[0.18em] uppercase">
            ID&nbsp;
            <span className="font-mono text-slate-200">{jobId.slice(-6)}</span>
          </span>
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`}
            aria-hidden="true"
          />
        </button>

        {!collapsed && (
          <div className="flex flex-col gap-4">
            {heroImage && (
              <div className="overflow-hidden rounded-[26px] border border-slate-800/70">
                <img src={heroImage} alt="analysis sample" className="h-48 w-full object-cover" />
              </div>
            )}

            <div className="space-y-2 text-xs text-slate-200">
              {summaryLines.map((line, idx) => (
                <p key={idx} className="leading-relaxed">
                  {line}
                </p>
              ))}
            </div>

            <div className="space-y-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-200">
                {t?.('mobileAnalyze.report.metrics.title', '판정 근거')}
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <MetricRow
                  label={t?.('mobileAnalyze.report.metrics.probFake', '의심 확률')}
                  value={probFake != null ? toPercent(probFake) : '—'}
                  hint={t?.('mobileAnalyze.report.metrics.probFakeHint', '모델이 합성으로 판단한 확률이에요.')}
                />
                <MetricRow
                  label={t?.('mobileAnalyze.report.metrics.threshold', '임계값')}
                  value={threshold != null ? threshold.toFixed(3) : '—'}
                  hint={t?.('mobileAnalyze.report.metrics.thresholdHint', '이 값 이상이면 합성으로 간주해요.')}
                />
                <MetricRow
                  label={t?.('mobileAnalyze.report.metrics.delta', '임계 대비 차이')}
                  value={scoreDelta != null ? (scoreDelta >= 0 ? `+${scoreDelta.toFixed(4)}` : scoreDelta.toFixed(4)) : '—'}
                  hint={t?.('mobileAnalyze.report.metrics.deltaHint', '양수면 임계값을 넘겼다는 의미예요.')}
                />
                <MetricRow
                  label={t?.('mobileAnalyze.report.metrics.probStd', '점수 표준편차')}
                  value={probStd != null ? probStd.toFixed(4) : '—'}
                  hint={t?.('mobileAnalyze.report.metrics.probStdHint', '검사 영역 간 점수 변동을 보여줘요.')}
                />
                <MetricRow
                  label={t?.('mobileAnalyze.report.metrics.highConf', '고확신 비율')}
                  value={highConf != null ? toPercent(highConf) : '—'}
                  hint={t?.('mobileAnalyze.report.metrics.highConfHint', '고확신 구간이 차지하는 비중이에요.')}
                />
                <MetricRow
                  label={t?.('mobileAnalyze.report.metrics.agg', '집계 방식')}
                  value={
                    aggName
                      ? `${aggName.toUpperCase()}${aggScore != null ? ` • ${aggScore.toFixed(4)}` : ''}`
                      : t?.('mobileAnalyze.report.metrics.notAvailable', '제공되지 않음')
                  }
                  hint={t?.('mobileAnalyze.report.metrics.aggHint', '최종 판정을 만들 때 사용된 방식이에요.')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-200">
                {t?.('mobileAnalyze.report.quantiles.title', '점수 분포')}
              </h3>
              <p className="text-[11px] text-slate-400">
                {t?.('mobileAnalyze.report.quantiles.subtitle', '확률 분포를 분위수로 요약했어요.')}
              </p>
              {quantileEntries.length ? (
                <div className="flex flex-wrap gap-2">
                  {quantileEntries.map((item) => (
                    <span
                      key={item.key}
                      className="inline-flex items-center gap-1 rounded-full border border-indigo-400/40 bg-indigo-500/10 px-3 py-1 text-[11px] text-indigo-100"
                    >
                      <span className="font-semibold">{item.key}</span>
                      <span>{item.value.toFixed(4)}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500">
                  {t?.('mobileAnalyze.report.quantiles.empty', '분포를 계산할 데이터가 충분하지 않아요.')}
                </p>
              )}
            </div>

            {probsTimeline.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-200">
                  {t?.('mobileAnalyze.report.timeline.title', '타임라인 요약')}
                </h3>
                <div className="rounded-[24px] border border-slate-800/70 bg-slate-900/60 px-4 py-3 text-[11px] text-slate-200">
                  {timelineSummary && <p>{timelineSummary}</p>}
                  {timelineTrend && <p className="mt-1 text-indigo-200/80">{timelineTrend}</p>}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-200">
                {t?.('mobileAnalyze.report.exemplars.title', '하이라이트')}
              </h3>
              {exemplars.length ? (
                <ul className="space-y-1 text-[11px] text-slate-300">
                  {exemplars.map((item, idx) => (
                    <li key={`${item.idx}-${idx}`} className="rounded-full border border-slate-800/70 bg-slate-900/60 px-3 py-1.5">
                      #{item.idx + 1} • {toPercent(item.prob)} 
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-slate-500">
                  {t?.('mobileAnalyze.report.exemplars.none', '강조할 샘플이 없어요.')}
                </p>
              )}
              {segmentHighlight && (
                <p className="text-[11px] text-rose-200/80">{segmentHighlight}</p>
              )}
            </div>

            {probabilityChips.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-200">
                  {t?.('mobileAnalyze.report.classes.title', '클래스 확률')}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {t?.('mobileAnalyze.report.classes.caption', '확률이 높은 순으로 정렬했어요.')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {probabilityChips.map((item) => (
                    <span
                      key={item.index}
                      className="inline-flex items-center gap-1 rounded-full border border-indigo-400/35 bg-indigo-500/10 px-3 py-1 text-[11px] text-indigo-100"
                    >
                      <span className="font-semibold">#{item.index}</span>
                      <span>{toPercent(item.value)}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-200">
                {t?.('mobileAnalyze.report.runtime.title', '추론 환경')}
              </h3>
              <p className="text-[11px] text-slate-500">
                {t?.('mobileAnalyze.report.runtime.subtitle', '분석이 실행된 환경 정보예요.')}
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <MetricRow
                  label={t?.('mobileAnalyze.report.metrics.latency', '추론 지연')}
                  value={latency != null ? `${latency.toFixed(2)}s` : '—'}
                  hint={t?.('mobileAnalyze.report.metrics.latencyHint', '이미지를 처리하는 데 걸린 시간이에요.')}
                />
                <MetricRow
                  label={t?.('mobileAnalyze.report.metrics.backend', '백엔드')}
                  value={runtimeBackend || '—'}
                  hint={t?.('mobileAnalyze.report.metrics.runtimeBackend', '모델이 실행된 백엔드 엔진이에요.')}
                />
                <MetricRow
                  label={t?.('mobileAnalyze.report.metrics.device', '디바이스')}
                  value={runtimeDevice || '—'}
                  hint={t?.('mobileAnalyze.report.metrics.runtimeDevice', '분석이 수행된 하드웨어를 나타내요.')}
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              {t?.('mobileAnalyze.report.notice.imageOnly', '이번 업로드는 이미지이므로 영상 전용 지표는 숨겼습니다.')}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
