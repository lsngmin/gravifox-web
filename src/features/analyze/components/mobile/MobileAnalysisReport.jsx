import React, { useMemo } from 'react';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

const VERDICT_THEME = {
  REAL: {
    gradient: 'from-emerald-500/20 via-teal-500/12 to-emerald-500/6',
    badgeBg: 'bg-emerald-500/18 text-emerald-100',
    ringColor: 'rgba(16,185,129,0.88)',
    Icon: CheckCircle2,
    headline: 'REAL',
    accentText: 'text-emerald-200',
  },
  FAKE: {
    gradient: 'from-rose-500/26 via-rose-500/12 to-rose-500/6',
    badgeBg: 'bg-rose-500/18 text-rose-100',
    ringColor: 'rgba(244,63,94,0.9)',
    Icon: AlertTriangle,
    headline: 'FAKE',
    accentText: 'text-rose-200',
  },
  UNKNOWN: {
    gradient: 'from-amber-500/24 via-amber-500/12 to-amber-500/6',
    badgeBg: 'bg-amber-500/18 text-amber-100',
    ringColor: 'rgba(245,158,11,0.88)',
    Icon: Info,
    headline: 'UNKNOWN',
    accentText: 'text-amber-200',
  },
};

const toPercent = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  return `${(value * 100).toFixed(1)}%`;
};

function MetricCard({ label, value, hint, tone }) {
  if (value == null || value === '') return null;
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-white/8 bg-black/30 px-4 py-3 text-left shadow-[0_24px_44px_-38px_rgba(15,23,42,0.9)]">
      <span className="text-[10px] uppercase tracking-[0.22em] text-slate-400">{label}</span>
      <span className={`text-base font-semibold text-slate-100 ${tone || ''}`}>{value}</span>
      {hint && <span className="text-[11px] leading-snug text-slate-400">{hint}</span>}
    </div>
  );
}

function InfoCard({ label, value }) {
  if (value == null || value === '') return null;
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-left shadow-[0_18px_36px_-30px_rgba(15,23,42,0.85)]">
      <span className="text-[10px] uppercase tracking-[0.22em] text-slate-400">{label}</span>
      <span className="text-sm font-medium text-slate-100">{value}</span>
    </div>
  );
}

function ScoreDial({ value, label, theme }) {
  if (value == null || Number.isNaN(value)) return null;
  const percent = Math.max(0, Math.min(100, Math.round(value * 100)));
  const ringStyle = {
    backgroundImage: `conic-gradient(${theme.ringColor} ${percent}%, rgba(148,163,184,0.18) ${percent}% 100%)`,
  };
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex h-[96px] w-[96px] items-center justify-center rounded-full p-[2px]" style={ringStyle}>
        <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-slate-950/90 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.12)]">
          <span className="text-2xl font-semibold text-white">
            {percent}
            <span className="text-lg">%</span>
          </span>
          <span className="text-[10px] uppercase tracking-[0.24em] text-slate-400">{label}</span>
        </div>
      </div>
    </div>
  );
}

export default function MobileAnalysisReport({ jobId, report, t }) {
  const data = report?.result || {};
  const rawLabel = data.label || data.decision || 'UNKNOWN';
  const label = typeof rawLabel === 'string' ? rawLabel.toUpperCase() : 'UNKNOWN';
  const theme = VERDICT_THEME[label] || VERDICT_THEME.UNKNOWN;
  const Icon = theme.Icon;
  const verdictTitle =
    t?.(`mobileAnalyze.report.badge.${label.toLowerCase()}`, theme.headline) || theme.headline;

  const fileName = report?.fileMeta?.name || '';
  const modelKey = report?.fileMeta?.modelKey || '';
  const filePreview = typeof report?.fileMeta?.previewDataUrl === 'string' ? report.fileMeta.previewDataUrl : null;
  const shortId = jobId.slice(-6);

  const probFake =
    typeof data.prob_fake === 'number'
      ? data.prob_fake
      : typeof data.pAi === 'number'
      ? data.pAi
      : null;
  const probReal =
    typeof data.prob_real === 'number'
      ? data.prob_real
      : typeof data.pReal === 'number'
      ? data.pReal
      : null;
  const confidence = typeof data.confidence === 'number' ? data.confidence : null;
  const threshold = typeof data.threshold === 'number' ? data.threshold : null;
  const latency = typeof data.latency_sec === 'number' ? data.latency_sec : null;
  const runtimeBackend = data?.runtime?.backend;
  const runtimeDevice = data?.runtime?.device;

  const scoreDelta =
    probFake != null && threshold != null ? probFake - threshold : null;

  const decisionText = useMemo(() => {
    if (label === 'REAL') {
      return t?.('mobileAnalyze.report.summary.realTitle', '합성 징후가 거의 발견되지 않았어요.');
    }
    if (label === 'FAKE') {
      return t?.('mobileAnalyze.report.summary.fakeTitle', '합성 의심 신호가 강하게 포착됐어요.');
    }
    return t?.('mobileAnalyze.report.summary.unknownTitle', '추가 확인이 필요합니다.');
  }, [label, t]);

  const summaryLines = useMemo(() => {
    const lines = [];
    if (probFake != null && threshold != null) {
      const delta = probFake - threshold;
      const verdictWord =
        delta >= 0
          ? t?.('mobileAnalyze.report.summary.highRisk', '의심 점수가 기준선을 넘었어요.')
          : t?.('mobileAnalyze.report.summary.lowRisk', '의심 점수가 기준선 아래에 위치해요.');
      lines.push(verdictWord);
    }
    if (confidence != null) {
      lines.push(
        t?.('mobileAnalyze.report.summary.confidence', {
          defaultValue: '전체 분석 신뢰도는 {{value}} 수준이에요.',
          value: toPercent(confidence) || '-',
        })
      );
    }
    if (!lines.length) {
      lines.push(t?.('mobileAnalyze.report.summary.default', '세부 항목을 함께 확인해 주세요.'));
    }
    return lines.filter(Boolean).slice(0, 3);
  }, [probFake, threshold, confidence, t]);

  const metrics = useMemo(() => {
    const items = [];
    const aiPercent = toPercent(probFake);
    const realPercent = toPercent(probReal);
    if (aiPercent) {
      items.push({
        key: 'ai',
        label: t?.('mobileAnalyze.report.metrics.probFake', 'AI 가능성'),
        value: aiPercent,
        tone: 'text-rose-200',
      });
    }
    if (realPercent) {
      items.push({
        key: 'real',
        label: t?.('mobileAnalyze.report.metrics.probReal', 'Real 가능성'),
        value: realPercent,
        tone: 'text-emerald-200',
      });
    }
    if (threshold != null) {
      items.push({
        key: 'threshold',
        label: t?.('mobileAnalyze.report.metrics.threshold', '판정 기준'),
        value: threshold.toFixed(3),
      });
    }
    if (scoreDelta != null) {
      items.push({
        key: 'delta',
        label: t?.('mobileAnalyze.report.metrics.delta', '기준 대비'),
        value: `${scoreDelta >= 0 ? '+' : ''}${scoreDelta.toFixed(3)}`,
        hint:
          scoreDelta >= 0
            ? t?.('mobileAnalyze.report.metrics.deltaHint.high', '기준보다 높아 의심 신호가 커요.')
            : t?.('mobileAnalyze.report.metrics.deltaHint.low', '기준보다 낮아 비교적 안전해요.'),
      });
    }
    return items.slice(0, 4);
  }, [probFake, probReal, threshold, scoreDelta, t]);

  const infoItems = useMemo(() => {
    const items = [];
    if (modelKey) {
      items.push({
        key: 'model',
        label: t?.('mobileAnalyze.report.modelKey', '모델 키'),
        value: modelKey,
      });
    }
    if (latency != null) {
      items.push({
        key: 'latency',
        label: t?.('mobileAnalyze.report.metrics.latency', '추론 지연'),
        value: `${latency.toFixed(2)}s`,
      });
    }
    if (runtimeBackend) {
      items.push({
        key: 'backend',
        label: t?.('mobileAnalyze.report.metrics.backend', '백엔드'),
        value: runtimeBackend,
      });
    }
    if (runtimeDevice) {
      items.push({
        key: 'device',
        label: t?.('mobileAnalyze.report.metrics.device', '디바이스'),
        value: runtimeDevice,
      });
    }
    return items;
  }, [modelKey, latency, runtimeBackend, runtimeDevice, t]);

  const heroImage = (() => {
    const samples = data?.faces?.samples;
    if (!Array.isArray(samples) || !samples.length) return null;
    const first = samples.find((item) => item?.image_jpg_base64);
    return first?.image_jpg_base64 ? `data:image/jpeg;base64,${first.image_jpg_base64}` : null;
  })();

  const confidenceLabel =
    label === 'FAKE'
      ? t?.('mobileAnalyze.report.metrics.aiConfidence', 'AI 신뢰도')
      : t?.('mobileAnalyze.report.metrics.realConfidence', 'Real 신뢰도');

  const confidenceValue =
    confidence != null
      ? confidence
      : label === 'FAKE'
      ? probFake
      : probReal;

  return (
    <section className={`relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br ${theme.gradient} p-6 text-slate-100 shadow-[0_34px_68px_-36px_rgba(15,23,42,0.85)]`}>
      <div className="pointer-events-none absolute -left-16 top-[-50px] h-48 w-48 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-40px] bottom-[-60px] h-56 w-56 rounded-full bg-white/6 blur-3xl" />
      <div className="relative flex flex-col gap-6">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-mono text-slate-300">#{shortId}</span>
          <span className="truncate text-right text-slate-200/80">
            {fileName || t?.('mobileAnalyze.report.header.untitled', '이름 없는 업로드')}
          </span>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium ${theme.badgeBg}`}>
              <span className="inline-flex h-5 w-5 items-center justify-center text-white">
                <Icon size={16} />
              </span>
              {t?.('mobileAnalyze.report.summary.heading', '분석 결과')}
            </span>
            {modelKey && (
              <span className="inline-flex items-center rounded-full bg-white/12 px-3 py-1 text-[10px] font-medium text-slate-100">
                {modelKey}
              </span>
            )}
          </div>
          <div className="flex items-end justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-[1.6rem] font-semibold leading-tight text-white">
                {verdictTitle}
              </h2>
              {decisionText && (
                <p className="text-sm text-slate-200/90">{decisionText}</p>
              )}
              {summaryLines[0] && (
                <p className="text-[12px] text-slate-300/90">{summaryLines[0]}</p>
              )}
            </div>
            <ScoreDial value={confidenceValue} label={confidenceLabel} theme={theme} />
          </div>
        </div>

        {filePreview && (
          <div className="rounded-3xl border border-white/12 bg-black/25 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-200/80">
              {t?.('mobileAnalyze.report.previewUpload', '업로드 미디어 미리보기')}
            </div>
            <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40">
              <img
                src={filePreview}
                alt={fileName ? `${fileName} 미리보기` : t?.('mobileAnalyze.report.previewUploadAlt', '업로드한 미디어 미리보기')}
                className="h-full w-full object-contain bg-slate-950/50"
                loading="lazy"
              />
            </div>
          </div>
        )}

        {metrics.length > 0 && (
          <div className="grid grid-cols-1 gap-3 min-[430px]:grid-cols-2">
            {metrics.map((metric) => (
              <MetricCard
                key={metric.key}
                label={metric.label}
                value={metric.value}
                hint={metric.hint}
                tone={metric.tone}
              />
            ))}
          </div>
        )}

        {summaryLines.length > 1 && (
          <div className="rounded-3xl border border-white/12 bg-black/30 px-4 py-4 text-[12px] leading-relaxed text-slate-200">
            {summaryLines.slice(1).map((line, idx) => (
              <p key={idx} className={idx === 0 ? '' : 'mt-2'}>
                {line}
              </p>
            ))}
          </div>
        )}

        {heroImage && (
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/45 shadow-[0_30px_54px_-38px_rgba(15,23,42,0.85)]">
            <img
              src={heroImage}
              alt={t?.('mobileAnalyze.report.previewAlt', '분석 샘플')}
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-black/50 px-3 py-1 text-[11px] font-medium text-white/85">
                {t?.('mobileAnalyze.report.preview', '분석 샘플')}
              </span>
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[11px] font-mono text-white/90">
                #{shortId}
              </span>
            </div>
          </div>
        )}

        {infoItems.length > 0 && (
          <div className="grid grid-cols-1 gap-3 min-[430px]:grid-cols-2">
            {infoItems.map((item) => (
              <InfoCard key={item.key} label={item.label} value={item.value} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
