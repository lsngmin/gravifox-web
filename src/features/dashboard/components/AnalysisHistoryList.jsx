import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowPathIcon, StarIcon } from "@heroicons/react/24/outline";
import AnalysisReport from "../../analyze/components/report/AnalysisReport";
import { ANALYZE_ENDPOINTS, FASTAPI_ENDPOINTS } from "../../../api/endPointRoute";
import axios from "../../../api/http";
import ensureUploadToken from "../../analyze/api/uploadTokenClient";
import { Transition } from '@headlessui/react';
import { buildStoredFailure, buildStoredReport, parseStoredReport } from "../../../utils/reportStorage";

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
          try {
            const m = sessionStorage.getItem(`sse:meta:${jobId}`);
            meta = m ? JSON.parse(m) : null;
          } catch {}
        }
        if (stored.result && jobId) {
          items.push({ jobId, data: stored.result, meta, storedAt: stored.storedAt || null });
        }
      } catch {}
    }
    // stable order
    return items.sort((a, b) => (a.jobId > b.jobId ? -1 : 1));
  } catch {
    return [];
  }
}

function formatFileSize(bytes) {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes < 0) return '-';
  if (bytes === 0) return '0B';
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unitIndex = -1;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  if (unitIndex === -1) return `${value}B`;
  const precision = value >= 100 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toFixed(precision)}${units[unitIndex]}`;
}

export default function AnalysisHistoryList() {
  const [local, setLocal] = useState(() => readLocalReports());
  const [search, setSearch] = useState("");
  const [labelTab, setLabelTab] = useState("ALL"); // ALL | REAL | FAKE | UNKNOWN
  const [favOnly, setFavOnly] = useState(false);
  const [favs, setFavs] = useState(() => {
    try {
      const raw = localStorage.getItem('dashboard:favorites');
      const a = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(a) ? a : []);
    } catch { return new Set(); }
  });
  const [sortKey, setSortKey] = useState('NEWEST'); // NEWEST | OLDEST | LABEL | NAME_ASC | NAME_DESC | SIZE_ASC | SIZE_DESC
  const [openReports, setOpenReports] = useState(() => new Set());
  const [openRe, setOpenRe] = useState(() => new Set());

  useEffect(() => {
    setLocal(readLocalReports());
  }, []);

  const items = useMemo(() => {
    if (local.length > 0) return local;
    // skeleton placeholder items (not connected yet)
    return [
      { jobId: "EXAMPLE-001", data: { label: "REAL", prob_fake: 0.12, threshold: 0.50 }, meta: { name: 'example1.jpg', type: 'image/jpeg', size: 123456 } },
      { jobId: "EXAMPLE-002", data: { label: "FAKE", prob_fake: 0.86, threshold: 0.50 }, meta: { name: 'example2.mp4', type: 'video/mp4', size: 5242880 } },
    ];
  }, [local]);

  const computeLabel = (d) => {
    const L = d?.label;
    if (L) return String(L).toUpperCase();
    if (typeof d?.prob_fake === 'number' && typeof d?.threshold === 'number') {
      return d.prob_fake >= d.threshold ? 'FAKE' : 'REAL';
    }
    return 'UNKNOWN';
  };

  const saveFavs = (nextSet) => {
    setFavs(nextSet);
    try { localStorage.setItem('dashboard:favorites', JSON.stringify(Array.from(nextSet))); } catch {}
  };

  const toggleFav = (jobId) => {
    const next = new Set(favs);
    if (next.has(jobId)) next.delete(jobId); else next.add(jobId);
    saveFavs(next);
  };

  const copyJobId = async (jid) => {
    try { await navigator.clipboard.writeText(jid); } catch {}
  };

  // seen map (first-seen timestamps) for sorting
  const getSeenMap = () => {
    try { return JSON.parse(localStorage.getItem('dashboard:seen') || '{}') || {}; } catch { return {}; }
  };
  const setSeenMap = (m) => {
    try { localStorage.setItem('dashboard:seen', JSON.stringify(m)); } catch {}
  };

  const filtered = useMemo(() => {
    const q = (search || '').trim().toLowerCase();
    const seen = getSeenMap();
    const list = items.filter(({ jobId, data, meta }) => {
      const L = computeLabel(data);
      if (labelTab !== 'ALL' && L !== labelTab) return false;
      if (favOnly && !favs.has(jobId)) return false;
      if (q) {
        const name = (meta?.name || '').toLowerCase();
        if (!name.includes(q)) return false;
      }
      return true;
    }).map((it) => {
      const L = computeLabel(it.data);
      const name = it.meta?.name || '';
      let seenAt = seen[it.jobId];
      if (!seenAt) {
        seenAt = Date.now();
        seen[it.jobId] = seenAt;
        setSeenMap(seen);
      }
      return { ...it, _label: L, _name: name, _seenAt: seenAt };
    });
    const labelOrder = { FAKE: 0, REAL: 1, UNKNOWN: 2 };
    list.sort((a, b) => {
      if (sortKey === 'NEWEST') return b._seenAt - a._seenAt;
      if (sortKey === 'OLDEST') return a._seenAt - b._seenAt;
      if (sortKey === 'LABEL') return (labelOrder[a._label] ?? 9) - (labelOrder[b._label] ?? 9) || a._name.localeCompare(b._name);
      if (sortKey === 'NAME_ASC') return a._name.localeCompare(b._name);
      if (sortKey === 'NAME_DESC') return b._name.localeCompare(a._name);
      if (sortKey === 'SIZE_ASC') return (a.meta?.size || 0) - (b.meta?.size || 0);
      if (sortKey === 'SIZE_DESC') return (b.meta?.size || 0) - (a.meta?.size || 0);
      return 0;
    });
    return list;
  }, [items, search, labelTab, favOnly, favs, sortKey]);

  const averageProb = useMemo(() => {
    if (!filtered.length) return null;
    let sum = 0;
    let count = 0;
    filtered.forEach(({ data }) => {
      const prob = typeof data?.prob_fake === 'number' ? data.prob_fake : NaN;
      if (Number.isFinite(prob)) {
        sum += prob;
        count += 1;
      }
    });
    if (!count) return null;
    return (sum / count) * 100;
  }, [filtered]);

  return (
    <div className="mt-4 space-y-3">
      {averageProb !== null && (
        <div className="space-y-1.5">
          <p className="text-sm text-slate-500 sm:text-base">
            사용자님이 업로드한 이미지의 평균 생성 확률은 {averageProb.toFixed(1)}%예요.
          </p>
        </div>
      )}
      {items.length > 0 && (
        <div className="rounded-xl border border-indigo-500/35 bg-slate-900/75 px-4 py-3 text-xs text-indigo-100 shadow-lg shadow-indigo-900/35 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-semibold text-indigo-100">최근 분석 데이터를 불러오는 중이에요</p>
              <p className="text-xs leading-relaxed text-indigo-200/85">
                결과가 보이지 않는다면 오른쪽 새로고침을 눌러주세요.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLocal(readLocalReports())}
              className="inline-flex h-12 w-12 flex-none items-center justify-center rounded-full border border-indigo-400/40 bg-indigo-500/25 text-indigo-100 transition hover:bg-indigo-500/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
              aria-label="최근 분석 새로고침"
            >
              <ArrowPathIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
      {/* Filters */}
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setFavOnly((prev) => !prev)}
          className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[13px] font-semibold transition ${
            favOnly ? 'border-indigo-500 bg-indigo-600 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <StarIcon className="h-4 w-4" aria-hidden="true" />
          즐겨찾기만
        </button>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
          {['ALL','REAL','FAKE','UNKNOWN'].map(L => (
            <button
              key={L}
              onClick={() => setLabelTab(L)}
              className={`rounded-md px-3 py-1.5 text-[13px] font-semibold ${labelTab===L ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-50'}`}
            >{L}</button>
          ))}
        </div>
          <div className="hidden items-center gap-1 text-xs text-slate-500 sm:flex">
            <span className="text-slate-400">정렬</span>
            <select
              className="rounded border border-slate-200 bg-white px-1.5 py-1 text-xs font-medium text-slate-700"
              value={sortKey}
              onChange={(e)=>setSortKey(e.target.value)}
            >
              <option value="NEWEST">최신순</option>
              <option value="OLDEST">오래된순</option>
              <option value="LABEL">레이블</option>
              <option value="NAME_ASC">파일명 A→Z</option>
              <option value="NAME_DESC">파일명 Z→A</option>
              <option value="SIZE_ASC">파일 크기 ↑</option>
              <option value="SIZE_DESC">파일 크기 ↓</option>
            </select>
          </div>
        </div>
      </div>

      {items.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          분석 기록이 없어요. Analyze에서 파일을 업로드해 보세요.
        </div>
      )}

      {filtered.map(({ jobId, data, meta }) => {
        const label = computeLabel(data);
        const probValue = typeof data?.prob_fake === 'number' ? (data.prob_fake * 100).toFixed(1) : null;
        const prob = probValue !== null ? `${probValue}%` : '-';
        const labelText = String(label).toUpperCase();
        const labelTone = labelText === 'FAKE'
          ? { wrapper: 'border-rose-400/55 bg-rose-500/20 text-rose-100', dot: 'bg-rose-300' }
          : labelText === 'REAL'
            ? { wrapper: 'border-emerald-400/55 bg-emerald-500/20 text-emerald-100', dot: 'bg-emerald-300' }
            : { wrapper: 'border-amber-400/55 bg-amber-500/20 text-amber-100', dot: 'bg-amber-300' };
        const previewUrl = typeof meta?.previewDataUrl === 'string' ? meta.previewDataUrl : null;
        const mediaKind = typeof meta?.type === 'string' ? meta.type.split('/')[0] : null;
        const previewFallbackText = mediaKind === 'video' ? 'VIDEO' : mediaKind === 'audio' ? 'AUDIO' : mediaKind === 'image' ? 'IMAGE' : 'MEDIA';
        return (
          <div key={jobId} className="relative overflow-hidden rounded-2xl border border-slate-700/40 bg-slate-950/70 p-5 shadow-lg shadow-slate-900/40">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-slate-900/60" aria-hidden="true" />
            <div className="relative space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-400/50 bg-indigo-500/20 px-3 py-1 text-[12px] font-semibold text-indigo-100">
                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-200/90" />
                    생성 확률
                    <span className="text-white">{prob}</span>
                  </span>
                  <span className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.18em] ${labelTone.wrapper}`}>
                    <span className={`h-2.5 w-2.5 rounded-full ${labelTone.dot}`} />
                    {labelText}
                  </span>
                </div>
                <p className="truncate text-xs font-medium text-slate-300 sm:text-sm">{meta?.name || '파일명 없음'}</p>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-slate-700/35 bg-slate-900/80">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={meta?.name ? `${meta.name} 미리보기` : '업로드 미디어 미리보기'}
                    className="h-52 w-full object-cover sm:h-64"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-52 w-full items-center justify-center bg-slate-900/70 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 sm:h-64">
                    {previewFallbackText}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleFav(jobId)}
                    title={favs.has(jobId) ? '즐겨찾기 해제' : '즐겨찾기'}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-amber-400/30 bg-amber-500/10 text-amber-300 transition hover:bg-amber-500/20"
                  >
                    {favs.has(jobId) ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
                        <path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.787 1.402 8.168L12 18.896l-7.336 3.87 1.402-8.168L.132 9.211l8.2-1.193L12 .587z"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-[18px] w-[18px]">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const next = new Set(openReports);
                      if (next.has(jobId)) next.delete(jobId); else next.add(jobId);
                      setOpenReports(next);
                    }}
                    className="inline-flex items-center rounded-lg bg-indigo-500/80 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500"
                  >
                    {openReports.has(jobId) ? '리포트 닫기' : '리포트 보기'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const next = new Set(openRe);
                      if (next.has(jobId)) next.delete(jobId); else next.add(jobId);
                      setOpenRe(next);
                    }}
                    className="inline-flex items-center rounded-lg border border-indigo-400/40 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-200 transition hover:bg-indigo-500/20"
                  >
                    {openRe.has(jobId) ? '재분석 닫기' : '재분석'}
                  </button>
                </div>
              </div>
            </div>
            <Transition
              show={openReports.has(jobId)}
              enter="transition-all duration-300 ease-out"
              enterFrom="opacity-0 -translate-y-1 scale-[0.99]"
              enterTo="opacity-100 translate-y-0 scale-100"
              leave="transition-all duration-200 ease-in"
              leaveFrom="opacity-100 translate-y-0 scale-100"
              leaveTo="opacity-0 -translate-y-1 scale-[0.99]"
            >
              <div className="mt-3">
                <AnalysisReport data={data} mediaMeta={meta} />
              </div>
            </Transition>
            <Transition
              show={openRe.has(jobId)}
              enter="transition-all duration-300 ease-out"
              enterFrom="opacity-0 -translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition-all duration-200 ease-in"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 -translate-y-1"
            >
              <div className="mt-3 rounded-2xl border border-slate-800/60 bg-slate-950/70 p-3">
                <ReAnalyzePane onFinish={() => setLocal(readLocalReports())} />
              </div>
            </Transition>
          </div>
        );
      })}

    </div>
  );
}

function ReAnalyzePane({ onFinish }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [stage, setStage] = useState(null);
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);
  const [meta, setMeta] = useState(null);
  const esRef = useRef(null);

  useEffect(() => () => { try { esRef.current && esRef.current.close(); } catch {} }, []);

  const onStart = async () => {
    if (!file || submitting) return;
    setSubmitting(true);
    setError(null);
    setResult(null);
    setStage('UPLOAD');
    setProgress(null);
    try {
      // 1) upload
      let uploadId;
      let uploadToken;
      try {
        const tokenPayload = await ensureUploadToken(file);
        uploadId = tokenPayload?.uploadId;
        uploadToken = tokenPayload?.uploadToken;
        if (!uploadId || !uploadToken) throw new Error('업로드 토큰을 발급받지 못했어요.');
      } catch (issueErr) {
        const detail = issueErr?.response?.data;
        const status = issueErr?.response?.status;
        if (status === 401 || status === 403) {
          const err = new Error(detail?.message || detail?.error || '업로드 토큰 발급이 거부됐어요.');
          err.status = status;
          throw err;
        }
        throw new Error(detail?.message || detail?.error || issueErr?.message || '업로드 토큰을 발급받지 못했어요.');
      }

      const form = new FormData();
      form.append('file', file, file.name || 'media');
      form.append('uploadId', uploadId);
      const up = await fetch(FASTAPI_ENDPOINTS.UPLOAD, {
        method: 'POST',
        headers: { 'Upload-Token': uploadToken },
        body: form,
      });
      if (!up.ok) throw new Error('업로드에 실패했어요.');
      const upJson = await up.json();
      const resolvedUploadId = upJson?.uploadId || uploadId;
      if (!resolvedUploadId) throw new Error('uploadId를 확인하지 못했어요.');

      // 2) analyze create
      setStage('CREATE');
      let anJson;
      try {
        const anResp = await axios.post(ANALYZE_ENDPOINTS.CREATE, { uploadId: resolvedUploadId });
        anJson = anResp?.data;
      } catch (createErr) {
        const resp = createErr?.response;
        const detail = resp?.data;
        const status = resp?.status;
        const message = detail?.message || detail?.error || resp?.statusText || createErr?.message || '분석 생성에 실패했어요.';
        if (status === 401 || status === 403) {
          const err = new Error(message);
          err.status = status;
          throw err;
        }
        throw new Error(message);
      }
      const { jobId, sseToken } = anJson || {};
      if (!jobId || !sseToken) throw new Error('jobId 또는 sseToken이 없어요.');
      const fileMeta = { name: file.name, size: file.size, type: file.type, uploadId: resolvedUploadId };
      setMeta(fileMeta);
      try {
        sessionStorage.setItem(`sse:${jobId}`, sseToken);
        sessionStorage.setItem(`sse:meta:${jobId}`, JSON.stringify(fileMeta));
      } catch {}

      // 3) sse
      setStage('RUNNING');
      const url = `${ANALYZE_ENDPOINTS.SSE(jobId)}?token=${encodeURIComponent(sseToken)}`;
      const es = new EventSource(url);
      esRef.current = es;
      es.addEventListener('progress', (e) => {
        try { const d = JSON.parse(e.data || '{}'); setStage(d.stage || 'RUNNING'); setProgress(d.progress ?? null); } catch {}
      });
      es.addEventListener('result', (e) => {
        try {
          const d = JSON.parse(e.data || '{}');
          const payload = (d.result || d);
          setResult(payload);
          try { sessionStorage.setItem(`sse:report:${jobId}`, JSON.stringify(buildStoredReport(payload, fileMeta))); } catch {}
        } catch {}
        try { es.close(); } catch {}
        setSubmitting(false);
        if (typeof onFinish === 'function') onFinish();
      });
      es.addEventListener('failed', (e) => {
        try {
          const d = JSON.parse(e.data || '{}');
          const reason = (d?.reason || '분석에 실패했어요.');
          setError(reason);
          try { sessionStorage.setItem(`sse:failed:${jobId}`, JSON.stringify(buildStoredFailure(reason, fileMeta))); } catch {}
        } catch { setError('분석에 실패했어요.'); }
        try { es.close(); } catch {}
        setSubmitting(false);
      });
    } catch (err) {
      setError(err?.message || '분석 시작 중 오류가 발생했어요.');
      setSubmitting(false);
    }
  };

  return (
    <div>
      {!result && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input type="file" onChange={(e)=> setFile(e.target.files?.[0] || null)} className="text-xs" />
          <button
            type="button"
            disabled={!file || submitting}
            onClick={onStart}
            className={`inline-flex items-center rounded-md px-3 py-1.5 text-xs font-semibold text-white ${submitting ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {submitting ? '분석 중…' : '재분석 시작'}
          </button>
          {stage && (
            <span className="text-[11px] text-slate-600">상태: {stage}{progress!=null ? ` (${Math.round(progress*100)}%)` : ''}</span>
          )}
        </div>
      )}
      {error && (
        <div className="mt-2 rounded-md border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700">{error}</div>
      )}
      {result && (
        <div className="mt-3">
          <AnalysisReport data={result} mediaMeta={meta} />
        </div>
      )}
    </div>
  );
}
