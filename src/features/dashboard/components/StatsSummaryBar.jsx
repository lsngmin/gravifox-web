import React, { useEffect, useMemo } from "react";
import { parseStoredReport } from "../../../utils/reportStorage";

function readLocalReports() {
  try {
    const items = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (!key || !key.startsWith("sse:report:")) continue;
      const jobId = key.replace("sse:report:", "");
      try {
        const raw = sessionStorage.getItem(key);
        const stored = parseStoredReport(raw);
        let meta = stored.fileMeta;
        if (!meta) {
          try { const m = sessionStorage.getItem(`sse:meta:${jobId}`); meta = m ? JSON.parse(m) : null; } catch {}
        }
        if (stored.result && jobId) items.push({ jobId, data: stored.result, meta, storedAt: stored.storedAt || null });
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
        0%   { background-position: 0% 0; opacity: 0.22; }
        50%  { opacity: 0.32; }
        100% { background-position: -200% 0; opacity: 0.22; }
      }
      .stat-card {
        position: relative;
        overflow: hidden;
        border-radius: 0.75rem;
        border: 1px solid var(--tone-ring, rgba(71,85,105,0.45));
        background: linear-gradient(135deg, var(--tone-bg-1, rgba(15,23,42,0.92)), var(--tone-bg-2, rgba(2,6,23,0.88)));
        box-shadow:
          0 20px 48px -24px rgba(2,6,23,0.8),
          inset 0 1px 0 rgba(148,163,184,0.12);
        backdrop-filter: blur(8px);
      }
      .stat-card::before {
        content: "";
        position: absolute;
        inset: -1px;
        background: repeating-linear-gradient(120deg,
          transparent 0%,
          transparent 45%,
          rgba(148,163,184,0.18) 50%,
          rgba(226,232,240,0.32) 55%,
          rgba(148,163,184,0.18) 60%,
          transparent 65%);
        background-size: 200% 100%;
        animation: stat-flow 6s linear infinite;
        pointer-events: none;
      }
      .stat-card::after {
        content: "";
        position: absolute;
        inset: 0;
        background: radial-gradient(120% 120% at 16% 0%, var(--tone-glow, rgba(99,102,241,0.18)) 0%, transparent 55%);
        pointer-events: none;
      }
      .stat-card__row {
        position: relative;
        display: flex; align-items: center; justify-content: space-between;
        padding: 0.85rem 1rem;
      }
      .stat-card__label {
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.02em;
        color: var(--tone-text, rgba(226,232,240,0.7));
      }
      .stat-card__value {
        font-size: 1.4rem;
        font-weight: 800;
        color: var(--tone-val, rgba(248,250,252,0.96));
        font-variant-numeric: tabular-nums;
      }
      .stat-card__dot {
        width: 10px;
        height: 10px;
        border-radius: 9999px;
        margin-right: 10px;
        flex: none;
        box-shadow: 0 0 0 2px rgba(15,23,42,0.65), 0 0 18px -4px var(--tone-accent, #6366f1);
        background: var(--tone-accent, #6366f1);
      }
      .tone-emerald {
        --tone-bg-1: rgba(4,47,46,0.9); --tone-bg-2: rgba(2,24,22,0.95);
        --tone-ring: rgba(16,185,129,0.35); --tone-accent: #34d399;
        --tone-text: rgba(190,242,100,0.82); --tone-val: rgba(224,242,254,0.96);
        --tone-glow: rgba(16,185,129,0.22);
      }
      .tone-rose {
        --tone-bg-1: rgba(76,5,25,0.9); --tone-bg-2: rgba(45,4,19,0.95);
        --tone-ring: rgba(244,63,94,0.35); --tone-accent: #fb7185;
        --tone-text: rgba(251,207,232,0.8); --tone-val: rgba(255,228,230,0.95);
        --tone-glow: rgba(244,63,94,0.22);
      }
      .tone-amber {
        --tone-bg-1: rgba(69,38,10,0.92); --tone-bg-2: rgba(38,20,6,0.95);
        --tone-ring: rgba(245,158,11,0.32); --tone-accent: #fbbf24;
        --tone-text: rgba(254,243,199,0.82); --tone-val: rgba(255,247,237,0.95);
        --tone-glow: rgba(245,158,11,0.22);
      }
      .tone-indigo {
        --tone-bg-1: rgba(30,27,75,0.92); --tone-bg-2: rgba(17,24,39,0.95);
        --tone-ring: rgba(99,102,241,0.4); --tone-accent: #818cf8;
        --tone-text: rgba(199,210,254,0.82); --tone-val: rgba(224,231,255,0.97);
        --tone-glow: rgba(99,102,241,0.24);
      }
    `;
    document.head.appendChild(style);
  }, []);
  const { total, real, fake, unknown, lastSeenAt } = useMemo(() => {
    const arr = readLocalReports();
    let real=0, fake=0, unknown=0;
    arr.forEach(it => {
      const L = toLabel(it.data);
      if (L === 'REAL') real++; else if (L === 'FAKE') fake++; else unknown++;
    });
    let lastSeenAt = null;
    try {
      const seen = JSON.parse(localStorage.getItem('dashboard:seen') || '{}') || {};
      lastSeenAt = Object.values(seen).map(Number).sort((a,b)=>b-a)[0] || null;
    } catch {}
    return { total: arr.length, real, fake, unknown, lastSeenAt };
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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      <Item label="총 분석" value={total} toneClass="tone-indigo" />
      <Item label="REAL" value={real} toneClass="tone-emerald" />
      <Item label="FAKE" value={fake} toneClass="tone-rose" />
      <Item label="UNKNOWN" value={unknown} toneClass="tone-amber" />
      <div className="col-span-2 sm:col-span-3 md:col-span-4">
        <div className="mt-2 text-[12px] text-slate-400">최근 분석: {formatRelative(lastSeenAt)}</div>
      </div>
    </div>
  );
}
