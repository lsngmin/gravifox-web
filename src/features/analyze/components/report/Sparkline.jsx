import React, { useMemo } from "react";

export default function Sparkline({
  data = [],
  width = 320,
  height = 60,
  stroke = "#6366f1",
  fill = "rgba(99, 102, 241, 0.08)",
  min = 0,
  max = 1,
  threshold,
  autoScale = false,
  pad = 0.02,
  showYAxisEnds = true,
  yFormat = (v) => (typeof v === 'number' ? v.toFixed(2) : ''),
}) {
  // compute effective min/max for y-axis
  const [effMin, effMax] = React.useMemo(() => {
    if (!autoScale || !data?.length) return [min, max];
    let localMin = Number.POSITIVE_INFINITY;
    let localMax = Number.NEGATIVE_INFINITY;
    for (const v of data) {
      if (typeof v !== 'number') continue;
      if (v < localMin) localMin = v;
      if (v > localMax) localMax = v;
    }
    if (!isFinite(localMin) || !isFinite(localMax)) return [min, max];
    // handle all values equal
    if (localMax === localMin) {
      const lo = Math.max(0, localMin - 0.05);
      const hi = Math.min(1, localMax + 0.05);
      return [lo, Math.max(hi, lo + 1e-6)];
    }
    const range = localMax - localMin;
    const paddedMin = localMin - range * pad;
    const paddedMax = localMax + range * pad;
    // clamp into [0,1] since our probabilities are 0..1
    return [Math.max(0, paddedMin), Math.min(1, paddedMax)];
  }, [autoScale, data, min, max, pad]);
  const path = useMemo(() => {
    if (!data?.length) return "";
    const n = data.length;
    const xStep = width / (n - 1 || 1);
    const y = (v) => {
      const clamped = Math.max(effMin, Math.min(effMax, v));
      const t = (clamped - effMin) / ((effMax - effMin) || 1);
      return height - t * height;
    };
    let d = "";
    data.forEach((v, i) => {
      const x = i * xStep;
      const yy = y(v);
      d += i === 0 ? `M ${x} ${yy}` : ` L ${x} ${yy}`;
    });
    return d;
  }, [data, width, height, effMin, effMax]);

  const areaPath = useMemo(() => {
    if (!data?.length) return "";
    const n = data.length;
    const xStep = width / (n - 1 || 1);
    const y = (v) => {
      const clamped = Math.max(effMin, Math.min(effMax, v));
      const t = (clamped - effMin) / ((effMax - effMin) || 1);
      return height - t * height;
    };
    let d = "";
    data.forEach((v, i) => {
      const x = i * xStep;
      const yy = y(v);
      d += i === 0 ? `M ${x} ${yy}` : ` L ${x} ${yy}`;
    });
    d += ` L ${width} ${height} L 0 ${height} Z`;
    return d;
  }, [data, width, height, effMin, effMax]);

  const thrY = useMemo(() => {
    if (typeof threshold !== "number") return null;
    if (threshold < effMin || threshold > effMax) return null;
    const t = (threshold - effMin) / ((effMax - effMin) || 1);
    return height - t * height;
  }, [threshold, effMin, effMax, height]);

  return (
    <svg width={width} height={height} className="overflow-visible">
      {areaPath && <path d={areaPath} fill={fill} stroke="none" />}
      {path && <path d={path} fill="none" stroke={stroke} strokeWidth={2} />}
      {thrY !== null && (
        <>
          <line x1={0} x2={width} y1={thrY} y2={thrY} stroke="#e11d48" strokeDasharray="4 4" strokeWidth={1} />
          {/* threshold label on the right */}
          <text x={width + 6} y={Math.max(10, Math.min(height - 2, thrY + 3))} textAnchor="start" fontSize={10} fill="#e11d48">
            {yFormat(threshold)}
          </text>
        </>
      )}
      {showYAxisEnds && (
        <>
          {/* guide lines for ends */}
          <line x1={0} x2={width} y1={0} y2={0} stroke="#cbd5e1" strokeDasharray="3 3" strokeWidth={1} />
          <line x1={0} x2={width} y1={height} y2={height} stroke="#cbd5e1" strokeDasharray="3 3" strokeWidth={1} />
          {/* labels on the right */}
          <text x={width + 6} y={10} textAnchor="start" fontSize={10} fill="#64748b">
            {yFormat(effMax)}
          </text>
          <text x={width + 6} y={height - 2} textAnchor="start" fontSize={10} fill="#64748b">
            {yFormat(effMin)}
          </text>
        </>
      )}
    </svg>
  );
}
