import React, { useMemo } from 'react';
import { CheckCircle2, AlertTriangle, Info, Activity } from 'lucide-react';

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
  const verdictTitle = t?.('mobileAnalyze.report.verdict', '분석 결과') || '분석 결과';

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
      const verdictWord = delta >= 0 ? t?.('mobileAnalyze.report.summary.highRisk', '합성 의심 신호가 기준보다 높아요.') : t?.('mobileAnalyze.report.summary.lowRisk', '합성 의심 신호가 기준보다 낮아요.');
      lines.push(verdictWord);
    }
    if (typeof data.high_conf_ratio === 'number') {
      if (data.high_conf_ratio >= 0.3) {
        lines.push(t?.('mobileAnalyze.report.summary.highConf', '여러 구간에서 고확신 의심 패턴이 감지됐어요.'));
      } else if (data.high_conf_ratio <= 0.05) {
        lines.push(t?.('mobileAnalyze.report.summary.lowConf', '고확신 의심 패턴은 거의 나타나지 않았어요.'));
      }
    }
    if (!lines.length) {
      lines.push(t?.('mobileAnalyze.report.summary.default', '세부 항목을 함께 확인해 주세요.'));
    }
    return lines.slice(0, 3);
  }, [data, t]);

  return (
    <section className="rounded-[32px] border border-indigo-500/25 bg-[linear-gradient(160deg,rgba(15,23,42,0.92),rgba(27,33,58,0.82))] p-5 shadow-[0_28px_60px_-32px_rgba(79,70,229,0.6)]">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <VerdictBadge label={label} title={verdictTitle} />
          <span className="text-[11px] text-slate-500 tracking-[0.2em] uppercase">
            ID&nbsp;
            <span className="font-mono text-slate-300">{jobId.slice(-6)}</span>
          </span>
        </div>

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

        <div className="grid grid-cols-1 gap-3">
          <MetricRow
            label={t?.('mobileAnalyze.report.metrics.prob', '의심 확률')}
            value={toPercent(data.prob_fake)}
            hint={t?.('mobileAnalyze.report.metrics.probHint', '확률이 높을수록 합성 의심이 짙습니다.')}
          />
          <MetricRow
            label={t?.('mobileAnalyze.report.metrics.threshold', '판정 기준선')}
            value={toPercent(data.threshold)}
            hint={t?.('mobileAnalyze.report.metrics.thresholdHint', '이 값 이상이면 합성으로 판정합니다.')}
          />
          <MetricRow
            label={t?.('mobileAnalyze.report.metrics.highConf', '고확신 구간 비중')}
            value={toPercent(data.high_conf_ratio)}
            hint={t?.('mobileAnalyze.report.metrics.highConfHint', '고확신 구간이 많을수록 위험도가 높습니다.')}
          />
        </div>

        <div className="rounded-[26px] border border-slate-800/60 bg-slate-900/60 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Activity size={16} className="text-indigo-300" />
            {t?.('mobileAnalyze.report.timeline.title', '추론 타임라인')}
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            {t?.('mobileAnalyze.report.timeline.hint', '세부 프레임별 확률은 데스크톱 버전 리포트에서 확인할 수 있어요.')}
          </p>
          <div className="mt-3 h-1.5 w-full rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-sky-400 to-indigo-300"
              style={{ width: `${Math.min(95, Math.max(8, (data.high_conf_ratio || 0) * 100 + 10))}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
