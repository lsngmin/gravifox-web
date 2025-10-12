import React, { forwardRef, useMemo, useEffect, useState } from "react";
import InfoHover from "./InfoHover";
import Sparkline from "./Sparkline";
import AutoNarrative from "./AutoNarrative";

const toPct = (v) => `${(v * 100).toFixed(1)}%`;

const badgeTone = (label) => {
  if (!label) return 'is-unknown';
  const L = String(label).toUpperCase();
  if (L === 'REAL') return 'is-real';
  if (L === 'FAKE') return 'is-fake';
  return 'is-unknown';
};

const infoText = {
  prob_fake: "조작일 가능성을 나타낸 값이에요. 임계값과 비교해 FAKE/REAL을 결정하며, 값이 높을수록 조작 의심이 커요.",
  prob_std: "타임라인 분포의 흩어짐을 의미해요. 값이 낮으면 구간별 편차가 작아 예측이 일정하고, 값이 높으면 일부 구간에서 확률이 크게 출령였음을 뜻해요.",
  high_conf_ratio: "순간적인 조작 의심확률이 고확신 임계값을 넘는 프레임과 클립이 얼마나 차지하는지 나타내는 지표에요. 높을수록 강한 의심 구간이 넓게 분포해요.",
  threshold: "모델 판정의 기준선이에요. 프레임과 클립 의심확률을 집계한 평균값과 임계값을 비교해 최종 판정을 결정해요.",
  latency_sec: "분석 요청부터 결과 생성까지 걸린 총 처리 시간(초).",
  sample_fps: "영상의 전체 FPS가 아니라, 분석에 사용하기 위해 간격을 두고 뽑은 초당 프레임 수이에요.",
  clip_len: "추론에 실제로 투입된 단위를 뜻해요.",
  clip_stride: "클립 간 간격(프레임 단위).",
  aligned_cnt: "얼굴 정렬(alignment)에 성공한 클립 수.",
  infer_cnt: "추론(inference)을 수행한 클립 수.",
  frames_total: "원본 미디어에서 읽은 전체 프레임 수를 의미해요. 이미지의 경우 프레임 수는 항상 1이에요.",
  probs_timeline: "분석 과정에서 추출한 각 프레임의 조작 의심확률을 시간축에 따라 배열한 시계열입니다.",
  stability: "얼굴 정렬/자세 변화 측정치. 값이 클수록 화면 흔들림·자세 변화가 큽니다.",
  spectral: "주파수 기반 지표. 합성 특유의 고주파/위상 특성 등을 포착합니다.",
};

// simple hook to keep a shared autoscale flag per page load
function useAutoScale() {
  const [auto, setAuto] = useState(() => false);
  // expose setter on window for quick debug toggle if needed
  useEffect(() => {
    if (typeof window !== 'undefined') window.__reportAutoScale = setAuto;
  }, []);
  return auto;
}

function TimelineHeaderExtras({ tStats }) {
  const [auto, setAuto] = useState(false);
  // share with Sparkline via window setter
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.__reportAutoScale === 'function') {
      window.__reportAutoScale(auto);
    }
  }, [auto]);

  const handleToggle = () => {
    const next = !auto;
    // fade out → toggle autoscale → fade in
    if (typeof window !== 'undefined' && typeof window.__reportFade === 'function') {
      try { window.__reportFade(true); } catch {}
      setTimeout(() => {
        setAuto(next);
        try { if (typeof window.__reportAutoScale === 'function') window.__reportAutoScale(next); } catch {}
        setTimeout(() => { try { window.__reportFade(false); } catch {} }, 220);
      }, 180);
    } else {
      setAuto(next);
    }
  };

  return (
    <div className="flex items-center gap-4 text-xs text-slate-600">
      {tStats && (
        <div className="hidden sm:flex gap-4">
          <div>평균 <span className="font-semibold text-slate-900">{tStats ? tStats.avg.toFixed(3) : '-'}</span></div>
          <div>최소 <span className="font-semibold text-slate-900">{tStats ? tStats.min.toFixed(3) : '-'}</span></div>
          <div>최대 <span className="font-semibold text-slate-900">{tStats ? tStats.max.toFixed(3) : '-'}</span></div>
        </div>
      )}
      <button
        type="button"
        onClick={handleToggle}
        className={`inline-flex items-center rounded-full border px-2 py-1 font-medium transition-colors ${auto ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
        title="타임라인 축 자동 스케일"
      >
        오토스케일 {auto ? '켜짐' : '꺼짐'}
      </button>
    </div>
  );
}

const AnalysisReport = forwardRef(function AnalysisReport({ data, mediaMeta }, ref) {
  // inject appear animation keyframes once
  useEffect(() => {
    const id = 'analysis-report-anims';
    const styleEl = document.getElementById(id) || (() => {
      const el = document.createElement('style');
      el.id = id;
      document.head.appendChild(el);
      return el;
    })();
    styleEl.textContent = `
      @keyframes report-reveal {
        0% {
          opacity: 0;
          transform: translateY(14px) scale(0.98);
          filter: blur(3px);
          box-shadow: 0 0 0 0 rgba(0,0,0,0);
        }
        60% {
          opacity: 1;
          transform: translateY(0) scale(1.01);
          filter: blur(0.3px);
          box-shadow: 0 12px 24px -6px var(--brand-strong), 0 6px 12px -8px var(--brand-mid);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
          box-shadow: 0 10px 18px -8px var(--brand-mid), 0 4px 10px -8px var(--brand-mid);
        }
      }
      .report-appear {
        animation: report-reveal 1200ms cubic-bezier(0.16, 1, 0.3, 1) both;
        will-change: opacity, transform, filter, box-shadow;
      }
      .report-glow {
        box-shadow: 0 10px 18px -8px var(--brand-mid), 0 4px 10px -8px var(--brand-mid);
      }
      @keyframes brand-shimmer {
        0% { background-position: 200% 0 }
        100% { background-position: -200% 0 }
      }
      .brand-shimmer-text {
        background-image: linear-gradient(90deg, var(--brand) 0%, var(--brand-light) 50%, var(--brand) 100%);
        background-size: 200% 100%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: brand-shimmer 2600ms linear infinite;
      }

      /* Premium result badge */
      .result-badge {
        --badge-bg: rgba(226,232,240,0.6); /* fallback if variant missing */
        --badge-fg: #0f172a;
        --badge-ring: rgba(15,23,42,0.10);
        --badge-glow: rgba(15,23,42,0.12);
        --badge-dot: currentColor;
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.375rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.875rem;
        font-weight: 600;
        line-height: 1;
        color: var(--badge-fg);
        background: var(--badge-bg);
        box-shadow:
          0 10px 24px -18px var(--badge-glow),
          0 2px 8px -6px var(--badge-glow),
          inset 0 0 0 1px var(--badge-ring);
      }
      .result-badge::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 1px; /* ring thickness */
        background: linear-gradient(90deg, rgba(255,255,255,0.65), rgba(255,255,255,0));
        opacity: 0.35;
        -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
      }
      .result-badge__dot {
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 9999px;
        background: var(--badge-dot);
        box-shadow: 0 0 0 2px var(--badge-bg), 0 0 10px -2px var(--badge-glow);
      }
      .result-badge__text { letter-spacing: -0.01em; }

      /* Tone: REAL (emerald) */
      .result-badge.is-real {
        --badge-bg: rgba(16,185,129,0.12);
        --badge-fg: #065F46;
        --badge-ring: rgba(16,185,129,0.38);
        --badge-glow: rgba(16,185,129,0.30);
        --badge-dot: #10B981;
      }
      /* Tone: FAKE (rose) */
      .result-badge.is-fake {
        --badge-bg: rgba(244,63,94,0.10);
        --badge-fg: #7F1D1D;
        --badge-ring: rgba(244,63,94,0.40);
        --badge-glow: rgba(244,63,94,0.30);
        --badge-dot: #F43F5E;
      }
      /* Tone: UNKNOWN (amber) */
      .result-badge.is-unknown {
        --badge-bg: rgba(245,158,11,0.12);
        --badge-fg: #92400E;
        --badge-ring: rgba(245,158,11,0.38);
        --badge-glow: rgba(245,158,11,0.28);
        --badge-dot: #F59E0B;
      }
    `;
  }, []);
  const prettyBytes = (n) => {
    if (typeof n !== 'number') return '-';
    const u = ['B','KB','MB','GB','TB']; let i=0, v=n;
    while (v>=1024 && i<u.length-1) { v/=1024; i++; }
    const digits = v>=100 ? 0 : v>=10 ? 1 : 2;
    return `${v.toFixed(digits)} ${u[i]}`;
  };
  // expose fade control for crossfade on autoscale
  const [fade, setFade] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') window.__reportFade = setFade;
  }, []);
  const {
    clips,
    prob_fake,
    prob_std,
    high_conf_ratio,
    threshold,
    label,
    latency_sec,
    sample_fps,
    frames_total,
    probs_timeline = [],
    stability = {},
    spectral = {},
    faces = {},
  } = data || {};

  const samples = Array.isArray(faces?.samples) ? faces.samples : [];

  const computedLabel = useMemo(() => {
    if (label) return label;
    if (typeof prob_fake === "number" && typeof threshold === "number") {
      return prob_fake >= threshold ? "FAKE" : "REAL";
    }
    return "UNKNOWN";
  }, [label, prob_fake, threshold]);

  const tStats = useMemo(() => {
    if (!probs_timeline?.length) return null;
    const min = Math.min(...probs_timeline);
    const max = Math.max(...probs_timeline);
    const avg = probs_timeline.reduce((a, b) => a + b, 0) / probs_timeline.length;
    const aboveThr = typeof threshold === "number" ? probs_timeline.filter(v => v >= threshold).length : 0;
    const aboveRatio = probs_timeline.length ? aboveThr / probs_timeline.length : 0;
    return { min, max, avg, aboveRatio };
  }, [probs_timeline, threshold]);

  return (
    <div ref={ref} className="mx-auto w-full max-w-5xl">
      <div className="report-appear report-glow rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">미디어 분석 리포트</h2>
          </div>
          <div className={`result-badge ${badgeTone(computedLabel)}`} role="status" aria-live="polite">
            <span className="result-badge__dot" aria-hidden />
            <span className="result-badge__text">결과: {computedLabel}</span>
          </div>
        </div>
        {/* Narrative container placed below the badge/title row */}
        <div className="mt-3">
          <AutoNarrative data={data} variant="detailed" maxLines={5} />
        </div>

        {mediaMeta && (
          <div className="mt-4 rounded-xl border border-slate-200 p-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              {mediaMeta?.previewDataUrl && (
                <div className="w-full max-w-[220px] overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  <img
                    src={mediaMeta.previewDataUrl}
                    alt={mediaMeta?.name ? `${mediaMeta.name} 미리보기` : '업로드한 미디어 미리보기'}
                    className="block h-full w-full object-contain bg-white"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-slate-500">파일명</p>
                  <p className="truncate text-sm font-medium text-slate-800">{mediaMeta?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">타입</p>
                  <p className="text-sm font-medium text-slate-800">{mediaMeta?.type || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">크기</p>
                  <p className="text-sm font-medium text-slate-800">{prettyBytes(mediaMeta?.size)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="col-span-1 rounded-xl border border-slate-200 p-4">
            <div className="text-sm font-medium text-slate-700">
              핵심 지표
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-slate-600">의심 확률
                  <InfoHover text={infoText.prob_fake} className="ml-1" />
                </dt>
                <dd className="font-semibold text-slate-900">{typeof prob_fake === "number" ? toPct(prob_fake) : "-"}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-600">표준편차
                  <InfoHover text={infoText.prob_std} className="ml-1" />
                </dt>
                <dd className="font-semibold text-slate-900">{typeof prob_std === "number" ? prob_std.toFixed(3) : "-"}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-600">임계값
                  <InfoHover text={infoText.threshold} className="ml-1" />
                </dt>
                <dd className="font-semibold text-slate-900">{typeof threshold === "number" ? threshold.toFixed(2) : "-"}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-600">고확신 구간 비율
                  <InfoHover text={infoText.high_conf_ratio} className="ml-1" />
                </dt>
                <dd className="font-semibold text-slate-900">{typeof high_conf_ratio === "number" ? toPct(high_conf_ratio) : "-"}</dd>
              </div>
            </dl>

            <div className="mt-4 text-sm font-medium text-slate-700">처리 요약</div>
            <dl className="mt-2 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-slate-600">클립 수<InfoHover text={infoText.clip_len} className="ml-1" /></dt>
                <dd className="font-semibold text-slate-900">{clips ?? "-"}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-600">총 프레임<InfoHover text={infoText.frames_total} className="ml-1" /></dt>
                <dd className="font-semibold text-slate-900">{frames_total ?? "-"}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-600">샘플링 FPS<InfoHover text={infoText.sample_fps} className="ml-1" /></dt>
                <dd className="font-semibold text-slate-900">{sample_fps ?? "-"}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-600">분석 지연<InfoHover text={infoText.latency_sec} className="ml-1" /></dt>
                <dd className="font-semibold text-slate-900">{typeof latency_sec === "number" ? `${latency_sec.toFixed(2)}s` : "-"}</dd>
              </div>
            </dl>
          </div>

          <div className="col-span-1 rounded-xl border border-slate-200 p-4 md:col-span-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-slate-700">
                타임라인
                <InfoHover text={infoText.probs_timeline} className="ml-1" />
              </div>
              <TimelineHeaderExtras tStats={tStats} />
            </div>
            <div className={`mt-3 rounded-lg border border-slate-100 bg-slate-50 p-3 transition-opacity duration-300 ease-in-out ${fade ? 'opacity-0' : 'opacity-100'}`} id="timeline-graph">
              <Sparkline data={probs_timeline} threshold={threshold} autoScale={useAutoScale()} pad={0.03} />
            </div>
            {tStats && typeof threshold === "number" && (
              <p className="mt-2 text-xs text-slate-600">
                임계값 초과 구간 비율: <span className="font-semibold text-slate-900">{toPct(tStats.aboveRatio)}</span>
              </p>
            )}
          </div>
        </div>

        {samples.length > 0 && (
          <div className="mt-6 rounded-xl border border-slate-200 p-4">
            <div className="mb-2 text-sm font-medium text-slate-700">샘플 얼굴 (상위 확률)</div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {samples.map((s, i) => (
                <div key={`${s.idx}-${i}`} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <img
                    src={`data:image/jpeg;base64,${s.image_jpg_base64}`}
                    alt={`face sample #${s.idx}`}
                    className="block h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-sm font-medium text-slate-700">
              안정성 지표
              <InfoHover text={infoText.stability} className="ml-1" />
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-slate-600">얼굴 정렬 흔들림 (RMS)</dt>
                <dd className="font-semibold text-slate-900">{stability?.lm_jitter_rms?.toFixed ? stability.lm_jitter_rms.toFixed(3) : "-"}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-600">자세 변화(평균) Y / P / R</dt>
                <dd className="font-semibold text-slate-900">
                  {stability?.pose_delta_mean ? `${stability.pose_delta_mean.yaw.toFixed(1)}° / ${stability.pose_delta_mean.pitch.toFixed(1)}° / ${stability.pose_delta_mean.roll.toFixed(1)}°` : "-"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-600">자세 변화 이상치 비율</dt>
                <dd className="font-semibold text-slate-900">{stability?.pose_delta_outlier_ratio?.toFixed ? toPct(stability.pose_delta_outlier_ratio) : "-"}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-sm font-medium text-slate-700">
              스펙트럼 지표
              <InfoHover text={infoText.spectral} className="ml-1" />
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-slate-600">고주파 비율(평균)</dt>
                <dd className="font-semibold text-slate-900">{spectral?.highfreq_ratio_mean?.toFixed ? spectral.highfreq_ratio_mean.toFixed(3) : "-"}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-600">이상치 비율</dt>
                <dd className="font-semibold text-slate-900">{spectral?.outlier_ratio?.toFixed ? toPct(spectral.outlier_ratio) : "-"}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-600">r0 비율</dt>
                <dd className="font-semibold text-slate-900">{spectral?.r0_ratio?.toFixed ? spectral.r0_ratio.toFixed(3) : "-"}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* 고급 지표 토글 (우측 텍스트 링크, 내용 비움) */}
        <div className="mt-4">
          <div className="flex justify-end">
            <span
              role="button"
              tabIndex={0}
              onClick={() => setShowAdvanced(v => !v)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowAdvanced(v => !v); }}
              className="cursor-pointer pr-1.5 text-xs font-medium brand-shimmer-text transition-opacity hover:opacity-90"
              title="고급 지표를 펼칩니다"
            >
              {showAdvanced ? '고급 지표 닫기' : '고급 지표 보기'}
            </span>
          </div>
          {showAdvanced && (
            <div className="mt-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600" />
          )}
        </div>

        <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/30 p-4 text-sm text-slate-700">
          분석 결과는 제공된 임계값을 기준으로 해석됩니다. 촬영 환경(조명, 흔들림, 해상도)과
          얼굴 정렬 품질이 낮을 경우 결과의 신뢰도가 떨어질 수 있습니다.
        </div>
      </div>
    </div>
  );
});

export default AnalysisReport;
