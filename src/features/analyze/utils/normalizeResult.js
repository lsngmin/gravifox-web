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

  return result;
}

function clamp01(value) {
  if (typeof value !== "number") return value;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

export default normalizeAnalysisResult;
