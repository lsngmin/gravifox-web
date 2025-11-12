import React, { useMemo, useState } from 'react';

const clamp01 = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
};

function resolvePrimaryScaleEntry(cell) {
  if (!cell || typeof cell !== 'object') return null;
  const entries = Array.isArray(cell.scales) ? cell.scales : [];
  if (entries.length === 0) return null;
  if (typeof cell.best_scale_index === 'number') {
    const best = entries.find(
      (item) =>
        item &&
        typeof item === 'object' &&
        typeof item.scale_index === 'number' &&
        item.scale_index === cell.best_scale_index
    );
    if (best) return best;
  }
  return entries[0];
}

function formatPercent(value, fraction = 0) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-';
  return `${(value * 100).toFixed(fraction)}%`;
}

export default function MobileHeatmapPreview({ imageSrc, mediaName, heatmap, highlightTop = true }) {
  const cells = useMemo(() => (Array.isArray(heatmap?.cells) ? heatmap.cells : []), [heatmap?.cells]);
  const hasData = Boolean(imageSrc) && cells.length > 0;
  const availableScales = useMemo(() => {
    if (!hasData) return [];
    const set = new Set();
    cells.forEach((cell) => {
      if (!cell || typeof cell !== 'object') return;
      const entries = Array.isArray(cell.scales) ? cell.scales : [];
      entries.forEach((entry) => {
        const numericScale = Number(entry?.scale);
        if (Number.isFinite(numericScale)) {
          set.add(numericScale);
        }
      });
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [cells, hasData]);
  const [mode, setMode] = useState('combined');
  const activeScale = mode === 'combined' ? null : Number(mode);

  const overlays = useMemo(() => {
    if (!hasData) return [];
    const entries = [];
    cells.forEach((cell) => {
      if (!cell || typeof cell !== 'object') return;
      let bboxInfo = null;
      let score = null;
      let scaleLabel = null;
      if (mode === 'combined' || !Number.isFinite(activeScale)) {
        const bestEntry = resolvePrimaryScaleEntry(cell);
        if (!bestEntry || !bestEntry.bbox) return;
        bboxInfo = bestEntry.bbox;
        const ai =
          typeof cell.ai_max === 'number'
            ? cell.ai_max
            : typeof bestEntry?.scores?.ai === 'number'
            ? bestEntry.scores.ai
            : cell.ai_mean;
        score = clamp01(ai);
        scaleLabel = bestEntry?.scale ?? null;
      } else {
        const target = Array.isArray(cell.scales)
          ? cell.scales.find(
              (entry) =>
                entry &&
                typeof entry === 'object' &&
                Number.isFinite(entry.scale) &&
                Number(entry.scale) === activeScale
            )
          : null;
        if (!target || !target.bbox) return;
        bboxInfo = target.bbox;
        const ai =
          typeof target?.scores?.ai === 'number'
            ? target.scores.ai
            : typeof cell.ai_mean === 'number'
            ? cell.ai_mean
            : null;
        if (ai == null) return;
        score = clamp01(ai);
        scaleLabel = target.scale;
      }

      if (!bboxInfo) return;
      const width = clamp01(bboxInfo.x2) - clamp01(bboxInfo.x1);
      const height = clamp01(bboxInfo.y2) - clamp01(bboxInfo.y1);
      if (width <= 0 || height <= 0) return;
      entries.push({
        key: `${cell.row}-${cell.col}-${mode}`,
        bbox: bboxInfo,
        score,
        row: cell.row,
        col: cell.col,
        scale: scaleLabel,
      });
    });
    entries.sort((a, b) => b.score - a.score);
    return entries;
  }, [cells, hasData, mode, activeScale]);

  if (!hasData || overlays.length === 0) return null;

  const topOverlay = highlightTop ? overlays[0] : null;

  return (
    <section className="rounded-[24px] border border-slate-800/60 bg-slate-900/75 p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
          히트맵 미리보기
        </h3>
        {topOverlay && (
          <span className="inline-flex items-center rounded-full border border-rose-400/40 bg-rose-500/20 px-3 py-1 text-[11px] font-medium text-rose-100">
            최고 점수 {formatPercent(topOverlay.score)}{' '}
            {topOverlay.scale ? `(스케일 ${topOverlay.scale})` : ''}
          </span>
        )}
      </div>
      {availableScales.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode('combined')}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${
              mode === 'combined'
                ? 'border border-rose-400/50 bg-rose-500/25 text-rose-100'
                : 'border border-slate-700/60 bg-slate-900/70 text-slate-300 hover:border-rose-400/40 hover:text-rose-100'
            }`}
          >
            종합
          </button>
          {availableScales.map((scale) => (
            <button
              key={scale}
              type="button"
              onClick={() => setMode(String(scale))}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${
                mode === String(scale)
                  ? 'border border-rose-400/50 bg-rose-500/25 text-rose-100'
                  : 'border border-slate-700/60 bg-slate-900/70 text-slate-300 hover:border-rose-400/40 hover:text-rose-100'
              }`}
            >
              스케일 {Number.isInteger(scale) ? scale : scale.toFixed(1)}
            </button>
          ))}
        </div>
      )}
      <div className="mt-4 overflow-hidden rounded-[22px] border border-slate-800/70 bg-slate-950/70">
        <div className="relative">
          <img
            src={imageSrc}
            alt={mediaName ? `${mediaName} 히트맵 프리뷰` : '분석 히트맵 미리보기'}
            className="block h-auto w-full object-contain"
            loading="lazy"
          />
          <div className="absolute inset-0">
            {overlays.map((overlay) => {
              const bbox = overlay.bbox;
              if (!bbox) return null;
              const aiScore = overlay.score;
              const alpha = 0.18 + aiScore * 0.6;
              const borderColor = alpha > 0.4 ? 'rgba(244,63,94,0.85)' : 'rgba(244,63,94,0.55)';
              const isTop = topOverlay && overlay === topOverlay;
              const left = `${clamp01(bbox.x1) * 100}%`;
              const top = `${clamp01(bbox.y1) * 100}%`;
              const width = `${Math.max(0, clamp01(bbox.x2) - clamp01(bbox.x1)) * 100}%`;
              const height = `${Math.max(0, clamp01(bbox.y2) - clamp01(bbox.y1)) * 100}%`;

              return (
                <div
                  key={overlay.key}
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
        색이 진할수록 해당 스케일에서 AI 생성 확률이 높아져요. 버튼을 눌러 스케일별 결과를 비교해 보세요.
      </p>
    </section>
  );
}
