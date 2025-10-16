import React, { useMemo } from 'react';

const clamp01 = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
};

function resolveBBox(cell) {
  if (!cell || typeof cell !== 'object') return null;
  if (Array.isArray(cell.scales) && cell.scales.length > 0) {
    const best =
      cell.scales.find(
        (item) =>
          item &&
          typeof item === 'object' &&
          typeof cell.best_scale_index === 'number' &&
          item.scale_index === cell.best_scale_index
      ) || cell.scales[0];
    if (best && best.bbox) {
      return best.bbox;
    }
  }
  if (cell.bbox) {
    return cell.bbox;
  }
  return null;
}

function formatPercent(value, fraction = 0) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-';
  return `${(value * 100).toFixed(fraction)}%`;
}

export default function MobileHeatmapPreview({ imageSrc, mediaName, heatmap, highlightTop = true }) {
  const cells = Array.isArray(heatmap?.cells) ? heatmap.cells : [];
  const hasData = Boolean(imageSrc) && cells.length > 0;

  const sortedCells = useMemo(() => {
    if (!hasData) return [];
    return [...cells].sort((a, b) => {
      const aScore = clamp01(typeof a?.ai_max === 'number' ? a.ai_max : a?.ai_mean);
      const bScore = clamp01(typeof b?.ai_max === 'number' ? b.ai_max : b?.ai_mean);
      return bScore - aScore;
    });
  }, [cells, hasData]);

  if (!hasData) return null;

  const topCell = highlightTop ? sortedCells[0] : null;

  return (
    <section className="rounded-[24px] border border-slate-800/60 bg-slate-900/75 p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
          히트맵 미리보기
        </h3>
        {topCell && (
          <span className="inline-flex items-center rounded-full border border-rose-400/40 bg-rose-500/20 px-3 py-1 text-[11px] font-medium text-rose-100">
            최고 점수 {formatPercent(topCell.ai_max ?? topCell.ai_mean ?? 0)}
          </span>
        )}
      </div>
      <div className="mt-4 overflow-hidden rounded-[22px] border border-slate-800/70 bg-slate-950/70">
        <div className="relative">
          <img
            src={imageSrc}
            alt={mediaName ? `${mediaName} 히트맵 프리뷰` : '분석 히트맵 미리보기'}
            className="block h-auto w-full object-contain"
            loading="lazy"
          />
          <div className="absolute inset-0">
            {sortedCells.map((cell, index) => {
              const bbox = resolveBBox(cell);
              if (!bbox) return null;
              const aiScore = clamp01(
                typeof cell.ai_max === 'number' ? cell.ai_max : cell.ai_mean
              );
              const alpha = 0.18 + aiScore * 0.6;
              const borderColor = alpha > 0.4 ? 'rgba(244,63,94,0.85)' : 'rgba(244,63,94,0.55)';
              const isTop = topCell && cell === topCell;
              const left = `${clamp01(bbox.x1) * 100}%`;
              const top = `${clamp01(bbox.y1) * 100}%`;
              const width = `${Math.max(0, clamp01(bbox.x2) - clamp01(bbox.x1)) * 100}%`;
              const height = `${Math.max(0, clamp01(bbox.y2) - clamp01(bbox.y1)) * 100}%`;

              return (
                <div
                  key={`${cell.row}-${cell.col}-${index}`}
                  className={`absolute rounded-md transition duration-200 ${isTop ? 'ring-2 ring-rose-300/80' : ''}`}
                  style={{
                    left,
                    top,
                    width,
                    height,
                    background: `rgba(244,63,94,${alpha.toFixed(3)})`,
                    boxShadow: isTop
                      ? '0 0 18px rgba(244, 63, 94, 0.35)'
                      : '0 0 12px rgba(244, 63, 94, 0.28)',
                    border: `1px solid ${borderColor}`,
                  }}
                >
                  <div className="absolute bottom-1 right-1 rounded bg-slate-900/70 px-1.5 py-0.5 text-[10px] font-semibold text-rose-100 shadow-sm">
                    {formatPercent(aiScore, aiScore >= 0.1 ? 0 : 1)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
        색이 진하게 표시된 영역일수록 AI 생성 확률이 높게 계산된 위치예요. 가장 높은 셀은 별도로 강조돼요.
      </p>
    </section>
  );
}

