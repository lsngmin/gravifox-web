export function normalizeAnalysisResult(raw = {}) {
  if (!raw || typeof raw !== "object") {
    return {};
  }

  const result = { ...raw };

  const hasProbFake = typeof result.prob_fake === "number";
  const hasPAi = typeof result.pAi === "number";
  const hasPReal = typeof result.pReal === "number";

  const resolvedThreshold = typeof result.threshold === "number" ? result.threshold : 0.5;
  if (typeof result.threshold !== "number") {
    result.threshold = resolvedThreshold;
  }

  if (!hasProbFake && hasPAi) {
    result.prob_fake = result.pAi;
  }
  if (!hasPAi && hasProbFake) {
    result.pAi = result.prob_fake;
  }
  if (!hasPReal && typeof result.pAi === "number") {
    result.pReal = clamp01(1 - result.pAi);
  }
  if (!result.pAi && typeof result.pReal === "number") {
    result.pAi = clamp01(1 - result.pReal);
  }

  if (!Array.isArray(result.probabilities) || result.probabilities.length === 0) {
    if (typeof result.pReal === "number" && typeof result.pAi === "number") {
      result.probabilities = [result.pReal, result.pAi];
    } else {
      result.probabilities = Array.isArray(result.probabilities) ? result.probabilities : [];
    }
  }

  if (!Array.isArray(result.classNames) || result.classNames.length === 0) {
    if (Array.isArray(result.probabilities) && result.probabilities.length === 2) {
      result.classNames = ["REAL", "FAKE"];
    } else if (Array.isArray(result.probabilities)) {
      result.classNames = result.probabilities.map((_, idx) => `CLASS_${idx + 1}`);
    } else {
      result.classNames = ["REAL", "FAKE"];
    }
  }

  if (!result.label) {
    const score = typeof result.prob_fake === "number" ? result.prob_fake : typeof result.pAi === "number" ? result.pAi : null;
    if (typeof score === "number") {
      result.label = score >= result.threshold ? "FAKE" : "REAL";
    }
  }

  if (!Array.isArray(result.probs_timeline) || result.probs_timeline.length === 0) {
    if (typeof result.pAi === "number") {
      result.probs_timeline = [result.pAi];
    } else {
      result.probs_timeline = Array.isArray(result.probs_timeline) ? result.probs_timeline : [];
    }
  }

  const inferenceMeta = (result && typeof result.inference === "object" && result.inference) || {};
  const heatmap =
    (result && typeof result.heatmap === "object" && result.heatmap) ||
    (typeof inferenceMeta.heatmap === "object" && inferenceMeta.heatmap) ||
    null;
  if (heatmap) {
    result.heatmap = heatmap;
    if (!inferenceMeta.heatmap) {
      result.inference = { ...inferenceMeta, heatmap };
    }
  }

  if (typeof result.heatmap_score !== "number") {
    const derived = deriveHeatmapScore(heatmap);
    if (typeof derived === "number" && Number.isFinite(derived)) {
      result.heatmap_score = clamp01(derived);
    }
  } else {
    result.heatmap_score = clamp01(result.heatmap_score);
  }

  return result;
}

function clamp01(value) {
  if (typeof value !== "number") return value;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function deriveHeatmapScore(heatmap) {
  if (!heatmap || typeof heatmap !== "object") return null;
  const cells = Array.isArray(heatmap.cells) ? heatmap.cells : null;
  if (!cells || cells.length === 0) return null;

  let best = null;
  cells.forEach((cell) => {
    if (!cell || typeof cell !== "object") return;
    const aiCandidates = [cell.ai_max, cell.ai_mean];
    aiCandidates.forEach((candidate) => {
      if (typeof candidate === "number" && Number.isFinite(candidate)) {
        if (best == null || candidate > best) {
          best = candidate;
        }
      }
    });
  });

  if (best == null) return null;
  if (best < 0) return 0;
  if (best > 1) return 1;
  return best;
}

export default normalizeAnalysisResult;
