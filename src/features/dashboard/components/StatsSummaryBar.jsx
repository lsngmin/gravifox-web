import React, { useEffect, useMemo } from "react";

function readLocalReports() {
  try {
    const items = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (!key || !key.startsWith("sse:report:")) continue;
      const jobId = key.replace("sse:report:", "");
      try {
        const raw = sessionStorage.getItem(key);
        const data = raw ? JSON.parse(raw) : null;
        let meta = null;
        try { const m = sessionStorage.getItem(`sse:meta:${jobId}`); meta = m ? JSON.parse(m) : null; } catch {}
        if (data && jobId) items.push({ jobId, data, meta });
      } catch {}
    }
    return items;
  } catch { return []; }
}

const toLabel = (d) => {
  const L = d?.label;
  if (L) return String(L).toUpperCase();
  if (typeof d?.prob_fake === 'number' && typeof d?.threshold === 'number') return d.prob_fake >= d.threshold ? 'FAKE' : 'REAL';
  return 'UNKNOWN';
}

function formatRelative(ts) {
  if (!ts) return '-';
  const diff = Date.now() - Number(ts);
  if (diff < 60_000) return '방금 전';
  const m = Math.floor(diff / 60_000);
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}일 전`;
  const date = new Date(ts);
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

export default function StatsSummaryBar() {
  // Inject premium styles once
  useEffect(() => {
    const id = 'stats-summary-premium-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      @keyframes stat-flow {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      .stat-card {
        position: relative;
        overflow: hidden;
        border-radius: 0.75rem; /* xl */
        border: 1px solid var(--tone-ring, rgba(226,232,240,1));
        background: linear-gradient(135deg, var(--tone-bg-1, #ffffff), var(--tone-bg-2, #f8fafc));
        box-shadow:
          0 12px 24px -18px rgba(15,23,42,0.12),
          0 4px 10px -6px rgba(15,23,42,0.08),
          inset 0 1px 0 0 rgba(255,255,255,0.5);
        backdrop-filter: blur(4px);
      }
      /* Flowing gradient sheen */
      .stat-card::before {
        content: "";
        position: absolute;
        inset: -1px;
        background: linear-gradient(90deg,
          transparent 0%,
          rgba(255,255,255,0.25) 35%,
          rgba(255,255,255,0.55) 50%,
          rgba(255,255,255,0.25) 65%,
          transparent 100%);
        background-size: 200% 100%;
        animation: stat-flow 4.2s linear infinite;
        pointer-events: none;
        opacity: 0.25;
      }
      /* Soft inner glow */
      .stat-card::after {
        content: "";
        position: absolute;
        inset: 0;
        background: radial-gradient(120% 120% at 10% 0%, var(--tone-glow, rgba(99,102,241,0.08)) 0%, transparent 40%);
        pointer-events: none;
      }
      .stat-card__row {
        position: relative;
        display: flex; align-items: center; justify-content: space-between;
        padding: 0.75rem 1rem; /* px-4 py-3 */
      }
      .stat-card__label { font-size: 0.75rem; font-weight: 700; color: var(--tone-text, #334155); letter-spacing: -0.01em; }
      .stat-card__value { font-size: 1rem; font-weight: 800; color: var(--tone-val, #0f172a); }
      .stat-card__dot {
        width: 8px; height: 8px; border-radius: 9999px; margin-right: 8px; flex: none;
        box-shadow: 0 0 0 2px rgba(255,255,255,0.9), 0 0 12px -2px var(--tone-accent, #6366f1);
        background: var(--tone-accent, #6366f1);
      }
      /* Tone variables */
      .tone-emerald { --tone-bg-1:#ffffff; --tone-bg-2:#ecfdf5; --tone-ring:rgba(16,185,129,0.25); --tone-accent:#10b981; --tone-text:#065f46; --tone-val:#064e3b; --tone-glow:rgba(16,185,129,0.12); }
      .tone-rose    { --tone-bg-1:#ffffff; --tone-bg-2:#fff1f2; --tone-ring:rgba(244,63,94,0.28); --tone-accent:#f43f5e; --tone-text:#7f1d1d; --tone-val:#7f1d1d; --tone-glow:rgba(244,63,94,0.12); }
      .tone-amber   { --tone-bg-1:#ffffff; --tone-bg-2:#fffbeb; --tone-ring:rgba(245,158,11,0.30); --tone-accent:#f59e0b; --tone-text:#92400e; --tone-val:#78350f; --tone-glow:rgba(245,158,11,0.12); }
      .tone-indigo  { --tone-bg-1:#ffffff; --tone-bg-2:#eef2ff; --tone-ring:rgba(99,102,241,0.35); --tone-accent:#6366f1; --tone-text:#3730a3; --tone-val:#312e81; --tone-glow:rgba(99,102,241,0.12); }
    `;
    document.head.appendChild(style);
  }, []);
  const { total, real, fake, unknown, favsCount, lastSeenAt } = useMemo(() => {
    const arr = readLocalReports();
    let real=0, fake=0, unknown=0;
    arr.forEach(it => {
      const L = toLabel(it.data);
      if (L === 'REAL') real++; else if (L === 'FAKE') fake++; else unknown++;
    });
    let favsCount = 0;
    try {
      const raw = localStorage.getItem('dashboard:favorites');
      favsCount = Array.isArray(JSON.parse(raw || '[]')) ? JSON.parse(raw || '[]').length : 0;
    } catch {}
    let lastSeenAt = null;
    try {
      const seen = JSON.parse(localStorage.getItem('dashboard:seen') || '{}') || {};
      lastSeenAt = Object.values(seen).map(Number).sort((a,b)=>b-a)[0] || null;
    } catch {}
    return { total: arr.length, real, fake, unknown, favsCount, lastSeenAt };
  }, []);

  const Item = ({ label, value, toneClass }) => (
    <div className={`stat-card ${toneClass || ''}`}>
      <div className="stat-card__row">
        <div className="flex items-center min-w-0">
          <span className="stat-card__dot" aria-hidden />
          <span className="stat-card__label truncate">{label}</span>
        </div>
        <span className="stat-card__value">{value}</span>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
      <Item label="총 분석" value={total} toneClass="tone-indigo" />
      <Item label="REAL" value={real} toneClass="tone-emerald" />
      <Item label="FAKE" value={fake} toneClass="tone-rose" />
      <Item label="UNKNOWN" value={unknown} toneClass="tone-amber" />
      <Item label="즐겨찾기" value={favsCount} toneClass="tone-indigo" />
      <div className="col-span-2 sm:col-span-3 md:col-span-5">
        <div className="mt-1 text-[11px] text-slate-500">최근 분석: {formatRelative(lastSeenAt)}</div>
      </div>
    </div>
  );
}
