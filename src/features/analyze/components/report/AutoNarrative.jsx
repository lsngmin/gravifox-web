import React, { useMemo, useEffect } from "react";
import Typewriter from "./Typewriter";

// Percentage formatter: 0.3912 -> 39.1%
const toPct = (v, digits = 1) => {
  if (typeof v !== "number" || Number.isNaN(v)) return "-";
  return `${(v * 100).toFixed(digits)}%`;
};

// Safe number to fixed: 0.3912 -> 0.39
const toFixed = (v, digits = 2) => {
  if (typeof v !== "number" || Number.isNaN(v)) return "-";
  return Number(v).toFixed(digits);
};

// Compute verdict string in Korean for beginners
function verdictLine({ label, prob_fake, threshold }) {
  const hasNumbers = typeof prob_fake === "number" && typeof threshold === "number";
  if (!label && !hasNumbers) {
    return "결과를 단정하기 어렵습니다. 입력 정보를 다시 확인해 주세요.";
  }
  const normalized = String(label || '').toUpperCase();
  const labelKnown = normalized === 'FAKE' || normalized === 'REAL';
  const isFake = hasNumbers ? prob_fake >= threshold : (normalized === 'FAKE');
  const koLabel = labelKnown ? (normalized === 'FAKE' ? "가짜" : "진짜") : (isFake ? "가짜" : "진짜");
  const compWord = hasNumbers ? (isFake ? "높아요" : "낮아요") : "";
  if (hasNumbers) {
    return `결과는 ${koLabel}로 판정됐어요. 의심 점수 ${toFixed(prob_fake)}는 기준 ${toFixed(threshold)}보다 ${compWord}.`;
  }
  return `결과는 ${koLabel}로 판정됐어요.`;
}

function timelineLine({ probs_timeline = [], threshold, prob_std }) {
  if (!Array.isArray(probs_timeline) || probs_timeline.length === 0) {
    return "시간대별 점수 정보를 찾지 못했어요.";
  }
  const n = probs_timeline.length;
  const min = Math.min(...probs_timeline);
  const max = Math.max(...probs_timeline);
  const span = max - min;
  // rough stability buckets using span and optional std
  let desc = "비슷하게 유지되어 전반적으로 안정적이에요.";
  if (span > 0.15 || (typeof prob_std === "number" && prob_std > 0.06)) {
    desc = "구간 간 점수 차이가 커, 잠깐 의심이 커진 부분이 있었어요.";
  } else if (span > 0.06 || (typeof prob_std === "number" && prob_std > 0.03)) {
    desc = "일부 구간에서 변동이 있었지만, 전체 흐름은 비슷했어요.";
  }
  return `전체를 ${n}개 구간으로 나눠 확인했어요. 점수는 ${toFixed(min, 3)}~${toFixed(max, 3)} 범위로 ${desc}`;
}

function cautionLine({ spectral = {}, high_conf_ratio, threshold, probs_timeline = [], prob_fake, variant }) {
  const out = spectral?.outlier_ratio;
  const nearBoundary = (typeof prob_fake === "number" && typeof threshold === "number")
    ? Math.abs(prob_fake - threshold) <= 0.05
    : false;
  const aboveThr = (typeof threshold === "number" && probs_timeline?.length)
    ? probs_timeline.filter(v => v >= threshold).length / probs_timeline.length
    : 0;

  const highConfMsg = (v) => {
    if (typeof v !== 'number') return null;
    if (v < 0.05) return `고확신 구간 비율은 ${toPct(v)}예요. 의심이 아주 높은 순간이 거의 없어 비교적 안정적으로 볼 수 있어요.`;
    if (v < 0.15) return `고확신 구간 비율은 ${toPct(v)}예요. 의심이 높은 순간이 가끔 있어 결과 해석에 약간 주의가 필요해요.`;
    return `고확신 구간 비율은 ${toPct(v)}예요. 의심이 높은 순간이 자주 보여 결과 해석에 주의가 필요해요.`;
  };

  const outlierMsg = (v) => {
    if (typeof v !== 'number') return null;
    if (v < 0.20) return `이상치 비율은 ${toPct(v)}예요. 값이 낮아 화면이 갑자기 튀는 구간이 드물어 전반적으로 자연스러운 편이에요.`;
    if (v < 0.50) return `이상치 비율은 ${toPct(v)}예요. 중간 수준이라 가끔 부자연스러운 순간이 보일 수 있어요.`;
    return `이상치 비율은 ${toPct(v)}예요. 값이 높아 갑작스러운 튐이 자주 보여 인위적 합성처럼 느껴질 수 있어요.`;
  };

  // In detailed mode, delegate specific metrics to extra lines; only show boundary caution here
  if (variant === 'detailed') {
    if (nearBoundary || aboveThr > 0.1) return "기준선과 가까워 결과가 바뀔 수 있어요. 중요한 용도라면 해석에 주의해 주세요.";
    return null;
  }

  // In simple mode, summarize the most important caution as a single line
  if (typeof out === 'number' && out >= 0.50) return outlierMsg(out);
  if (typeof high_conf_ratio === 'number' && high_conf_ratio >= 0.15) return highConfMsg(high_conf_ratio);
  if (nearBoundary || aboveThr > 0.1) return "기준선과 가까워 결과가 바뀔 수 있어요. 중요한 용도라면 해석에 주의해 주세요.";

  // Otherwise, prefer positive or neutral info
  return highConfMsg(high_conf_ratio) || outlierMsg(out) || "추가 조치는 필요 없어 보이지만, 중요 목적이라면 다시 확인해 주세요.";
}

/**
 * AutoNarrative: Rule-based beginner-friendly explanation generator.
 * Props:
 *  - data: analysis JSON
 *  - variant: 'simple' | 'detailed' (affects max lines)
 *  - maxLines: number of lines to render (default 3)
 */
export default function AutoNarrative({ data, variant = 'simple', maxLines = 3, className = '' }) {
  // Inject soft brand border + ambient glow styles (no animation)
  useEffect(() => {
    const id = 'auto-narrative-softbox';
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('style');
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = `
      .brand-softbox { position: relative; z-index: 0; border-color: var(--brand-light); }
      /* Outer ambient glow confined to the border ring using mask */
      .brand-softbox::after {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 2px; /* ring thickness */
        background:
          radial-gradient(120% 60% at 50% -20%, var(--brand-strong), transparent 70%),
          radial-gradient(60% 120% at -20% 50%, var(--brand-strong), transparent 70%),
          radial-gradient(60% 120% at 120% 50%, var(--brand-strong), transparent 70%),
          radial-gradient(120% 60% at 50% 120%, var(--brand-strong), transparent 70%);
        filter: blur(10px);
        opacity: 0.6;
        -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
      }
      /* Subtle drop shadows for depth */
      .brand-softbox { box-shadow:
        0 14px 28px -20px var(--brand-mid),
        0 8px 22px -18px var(--brand-mid),
        0 0 0 1px rgba(99,102,241,0.08);
      }
    `;
  }, []);
  const {
    label,
    prob_fake,
    threshold,
    probs_timeline,
    prob_std,
    high_conf_ratio,
    spectral,
    aligned_cnt,
    infer_cnt,
  } = data || {};

  const lines = useMemo(() => {
    const intro = "해당 미디어의 분석 결과를 요약해 드릴게요.";
    const l1 = verdictLine({ label, prob_fake, threshold });
    const l2 = timelineLine({ probs_timeline, threshold, prob_std });
    const l3 = cautionLine({ spectral, high_conf_ratio, threshold, probs_timeline, prob_fake, variant });
    const l0 = `${intro} ${l1}`;

    // An optional 4th/5th line for 'detailed' variant
    const extra = [];
    if (variant === 'detailed') {
      // High-confidence ratio: 2-sentence explanation with current status
      if (typeof high_conf_ratio === 'number') {
        if (high_conf_ratio < 0.05) {
          extra.push(`고확신 구간 비율은 ${toPct(high_conf_ratio)}예요. 의심이 아주 높은 순간이 거의 없어 비교적 안정적으로 볼 수 있어요.`);
        } else if (high_conf_ratio < 0.15) {
          extra.push(`고확신 구간 비율은 ${toPct(high_conf_ratio)}예요. 의심이 높은 순간이 가끔 있어 결과 해석에 약간 주의가 필요해요.`);
        } else {
          extra.push(`고확신 구간 비율은 ${toPct(high_conf_ratio)}예요. 의심이 높은 순간이 자주 보여 결과 해석에 주의가 필요해요.`);
        }
      }
      // Outlier ratio: 2-sentence explanation with current status
      if (typeof spectral?.outlier_ratio === 'number') {
        const v = spectral.outlier_ratio;
        if (v < 0.20) {
          extra.push(`이상치 비율은 ${toPct(v)}예요. 값이 낮아 화면이 갑자기 튀는 구간이 드물어 전반적으로 자연스러운 편이에요.`);
        } else if (v < 0.50) {
          extra.push(`이상치 비율은 ${toPct(v)}예요. 중간 수준이라 가끔 부자연스러운 순간이 보일 수 있어요.`);
        } else {
          extra.push(`이상치 비율은 ${toPct(v)}예요. 값이 높아 갑작스러운 튐이 자주 보여 인위적 합성처럼 느껴질 수 있어요.`);
        }
      }
      // High-frequency ratio mean: 2-sentence explanation with current status
      if (typeof spectral?.highfreq_ratio_mean === 'number') {
        const h = spectral.highfreq_ratio_mean;
        if (h < 0.45) {
          extra.push(`고주파 비율 평균은 ${toFixed(h, 3)}예요. 값이 낮아 경계 · 피부결이 과하게 날카롭지 않아 자연스러운 편이에요.`);
        } else if (h < 0.60) {
          extra.push(`고주파 비율 평균은 ${toFixed(h, 3)}예요. 중간 수준이라 약간 날카로운 느낌이 섞일 수 있어요.`);
        } else {
          extra.push(`고주파 비율 평균은 ${toFixed(h, 3)}예요. 값이 높아 경계나 피부결이 지나치게 날카롭거나 거칠게 보여 인위적인 느낌이 커질 수 있어요.`);
        }
      }
      // Beginner hint about scoring
      extra.push("참고: 점수는 0에 가까울수록 진짜, 1에 가까울수록 의심이에요.");

      // Optional: if alignment coverage is low, inform potential reliability impact
      if (typeof aligned_cnt === 'number' && typeof infer_cnt === 'number' && infer_cnt > 0) {
        const coverage = aligned_cnt / infer_cnt;
        if (coverage < 0.6) {
          extra.push("얼굴 정렬에 성공한 구간이 적어 신뢰도가 다소 낮을 수 있어요.");
        }
      }
    }

    const all = [l0, l2, l3, ...extra].filter(Boolean);
    return all.slice(0, Math.max(1, maxLines));
  }, [label, prob_fake, threshold, probs_timeline, prob_std, high_conf_ratio, spectral, aligned_cnt, infer_cnt, variant, maxLines]);

  // Join lines into a single block for a single typewriter animation
  // Add a blank line after the 3rd line for readability (when there are more than 3 lines)
  const block = (() => {
    if (lines.length > 3) {
      const head = lines.slice(0, 3);
      const tail = lines.slice(3);
      return [...head, "", ...tail].join("\n");
    }
    return lines.join("\n");
  })();

  return (
    <div className={className}>
      <div className="brand-softbox rounded-lg border bg-slate-50 p-3">
        <Typewriter
          text={block}
          // 1.5x slower than before (50ms -> 75ms)
          speed={75}
          startDelay={200}
          // Always play; do not persist animation state
          onceKey={null}
          className="text-sm text-slate-700 whitespace-pre-line leading-relaxed"
        />
      </div>
    </div>
  );
}
