import React, { useEffect, useMemo, useRef, useState } from "react";
import AnalysisReport from "../../analyze/components/report/AnalysisReport";
import { ANALYZE_ENDPOINTS, FASTAPI_ENDPOINTS } from "../../../api/endPointRoute";
import axios from "../../../api/http";
import ensureUploadToken from "../../analyze/api/uploadTokenClient";
import { Transition } from '@headlessui/react';

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
        // try to attach file meta
        let meta = null;
        try {
          const m = sessionStorage.getItem(`sse:meta:${jobId}`);
          meta = m ? JSON.parse(m) : null;
        } catch {}
        if (data && jobId) {
          items.push({ jobId, data, meta });
        }
      } catch {}
    }
    // stable order
    return items.sort((a, b) => (a.jobId > b.jobId ? -1 : 1));
  } catch {
    return [];
  }
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
  const [selected, setSelected] = useState(() => new Set());
  const [notes, setNotes] = useState(() => {
    try {
      const raw = localStorage.getItem('dashboard:notes');
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });
  const [openMemo, setOpenMemo] = useState(null); // jobId | null
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

  const clearLocalReports = () => {
    try {
      const toRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('sse:report:')) toRemove.push(key);
      }
      toRemove.forEach(k => { try { sessionStorage.removeItem(k); } catch {} });
    } catch {}
    setLocal(readLocalReports());
  };

  const exportLocalReports = () => {
    try {
      const payload = { exportedAt: new Date().toISOString(), items: local };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'analyze-history.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {}
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

  const saveNotes = (next) => {
    setNotes(next);
    try { localStorage.setItem('dashboard:notes', JSON.stringify(next)); } catch {}
  };
  const addTag = (jobId, text) => {
    const tag = (text || '').trim();
    if (!tag) return;
    const next = { ...notes };
    const cur = next[jobId] || { tags: [], memo: '' };
    if (!cur.tags.includes(tag)) cur.tags.push(tag);
    next[jobId] = cur;
    saveNotes(next);
  };
  const removeTag = (jobId, idx) => {
    const next = { ...notes };
    const cur = next[jobId] || { tags: [], memo: '' };
    cur.tags = (cur.tags || []).filter((_, i) => i !== idx);
    next[jobId] = cur;
    saveNotes(next);
  };
  const updateMemo = (jobId, text) => {
    const next = { ...notes };
    const cur = next[jobId] || { tags: [], memo: '' };
    cur.memo = text;
    next[jobId] = cur;
    saveNotes(next);
  };

  const toggleSelect = (jid) => {
    const next = new Set(selected);
    if (next.has(jid)) next.delete(jid); else next.add(jid);
    setSelected(next);
  };
  const selectAll = (checked) => {
    if (checked) {
      setSelected(new Set(filtered.map(it => it.jobId)));
    } else {
      setSelected(new Set());
    }
  };
  const exportSelected = () => {
    const setSel = new Set(selected);
    const pick = items.filter(it => setSel.has(it.jobId));
    try {
      const payload = { exportedAt: new Date().toISOString(), items: pick };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'analyze-selected.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {}
  };
  const deleteSelected = () => {
    const setSel = new Set(selected);
    try {
      const seen = getSeenMap();
      filtered.forEach(it => {
        if (!setSel.has(it.jobId)) return;
        try { sessionStorage.removeItem(`sse:report:${it.jobId}`); } catch {}
        try { sessionStorage.removeItem(`sse:meta:${it.jobId}`); } catch {}
        try { delete seen[it.jobId]; } catch {}
        try { favs.delete(it.jobId); } catch {}
        try { delete notes[it.jobId]; } catch {}
      });
      setSeenMap(seen);
      saveFavs(new Set(favs));
      saveNotes({ ...notes });
    } catch {}
    setSelected(new Set());
    setLocal(readLocalReports());
  };

  // Compare view state
  const [compareOpen, setCompareOpen] = useState(false);
  const comparePair = useMemo(() => {
    if (selected.size !== 2) return null;
    const ids = Array.from(selected);
    const map = new Map(items.map(it => [it.jobId, it]));
    const a = map.get(ids[0]);
    const b = map.get(ids[1]);
    if (!a || !b) return null;
    return { a, b };
  }, [selected, items]);

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-slate-800">최근 분석</h3>
          {filtered.length > 0 && (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
              총 {filtered.length}
            </span>
          )}
        </div>
        {items.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="text-xs font-semibold text-slate-600 hover:text-slate-800"
              onClick={() => setLocal(readLocalReports())}
            >
              새로고침
            </button>
            <div className="hidden sm:flex items-center gap-1 text-xs">
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
            <button
              type="button"
              className="text-xs font-semibold text-slate-600 hover:text-slate-800"
              onClick={exportLocalReports}
            >
              내보내기
            </button>
            <button
              type="button"
              className="text-xs font-semibold text-rose-600 hover:text-rose-700"
              onClick={clearLocalReports}
            >
              기록 지우기
            </button>
          </div>
        )}
      </div>
      {/* Selection + bulk actions */}
      {filtered.length > 0 && (
        <div className="flex items-center gap-3 text-xs text-slate-700">
          <label className="inline-flex items-center gap-1">
            <input type="checkbox" className="rounded border-slate-300" onChange={(e)=>selectAll(e.target.checked)} checked={selected.size>0 && selected.size===filtered.length} />
            전체 선택
          </label>
          {selected.size > 0 && (
            <>
              <span className="text-slate-400">|</span>
              <span>선택 {selected.size}개</span>
              <button onClick={exportSelected} className="ml-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs font-semibold hover:bg-slate-50">선택 내보내기</button>
              <button onClick={deleteSelected} className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100">선택 삭제</button>
              {selected.size === 2 && (
                <button onClick={()=>setCompareOpen(true)} className="rounded border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100">비교 보기</button>
              )}
            </>
          )}
        </div>
      )}
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
          {['ALL','REAL','FAKE','UNKNOWN'].map(L => (
            <button
              key={L}
              onClick={() => setLabelTab(L)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md ${labelTab===L ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
            >{L}</button>
          ))}
        </div>
        <label className="ml-1 inline-flex items-center gap-1 text-xs font-medium text-slate-700">
          <input type="checkbox" className="rounded border-slate-300" checked={favOnly} onChange={e=>setFavOnly(e.target.checked)} />
          즐겨찾기만
        </label>
        <div className="ml-auto flex items-center">
          <input
            type="text"
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            placeholder="파일명으로 검색"
            className="w-52 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
      </div>

      {items.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          분석 기록이 없어요. Analyze에서 파일을 업로드해 보세요.
        </div>
      )}

      {filtered.map(({ jobId, data, meta }) => {
        const label = computeLabel(data);
        const prob = typeof data?.prob_fake === 'number' ? `${(data.prob_fake * 100).toFixed(1)}%` : '-';
        const thr = typeof data?.threshold === 'number' ? data.threshold.toFixed(2) : '-';
        const tone = String(label).toUpperCase() === 'FAKE'
          ? 'text-rose-700 bg-rose-50 border-rose-200'
          : String(label).toUpperCase() === 'REAL'
            ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
            : 'text-amber-700 bg-amber-50 border-amber-200';
        const note = notes[jobId] || { tags: [], memo: '' };

        return (
          <div key={jobId} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                {meta?.name && (
                  <p className="text-sm font-semibold text-slate-900 truncate">파일: {meta.name}</p>
                )}
                <p className="mt-0.5 text-xs text-slate-600 truncate">Job ID: {jobId}</p>
                <p className="mt-0.5 text-xs text-slate-600">확률 {prob} • 임계값 {thr}</p>
                {/* tags */}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {(note.tags || []).map((t, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                      {t}
                      <button className="text-slate-400 hover:text-slate-600" onClick={()=>removeTag(jobId, idx)}>×</button>
                    </span>
                  ))}
                  <TagInput onAdd={(val)=>addTag(jobId, val)} />
                </div>
                {/* memo */}
                <div className="mt-2">
                  <button onClick={()=> setOpenMemo(openMemo===jobId ? null : jobId)} className="text-[10px] font-medium text-indigo-600 hover:underline">
                    {openMemo===jobId ? '메모 닫기' : '메모 추가/보기'}
                  </button>
                  {openMemo===jobId && (
                    <textarea
                      className="mt-1 w-full rounded-md border border-slate-200 bg-white p-2 text-xs text-slate-700"
                      rows={3}
                      value={note.memo || ''}
                      onChange={(e)=>updateMemo(jobId, e.target.value)}
                      placeholder="메모를 입력하세요"
                    />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" className="rounded border-slate-300" checked={selected.has(jobId)} onChange={()=>toggleSelect(jobId)} />
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${tone}`}>
                  {String(label).toUpperCase()}
                </span>
                <button
                  type="button"
                  onClick={() => toggleFav(jobId)}
                  title={favs.has(jobId) ? '즐겨찾기 해제' : '즐겨찾기'}
                  className="p-1 rounded hover:bg-slate-100"
                >
                  {favs.has(jobId) ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#f59e0b" className="w-5 h-5">
                      <path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.787 1.402 8.168L12 18.896l-7.336 3.87 1.402-8.168L.132 9.211l8.2-1.193L12 .587z"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.8" className="w-5 h-5">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z" />
                    </svg>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => copyJobId(jobId)}
                  className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  ID 복사
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = new Set(openReports);
                    if (next.has(jobId)) next.delete(jobId); else next.add(jobId);
                    setOpenReports(next);
                  }}
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
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
                  className="inline-flex items-center rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                >
                  {openRe.has(jobId) ? '재분석 닫기' : '재분석'}
                </button>
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
              <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                <ReAnalyzePane onFinish={() => setLocal(readLocalReports())} />
              </div>
            </Transition>
          </div>
        );
      })}

      {/* Compare view */}
      {compareOpen && comparePair && (
        <CompareView
          a={comparePair.a}
          b={comparePair.b}
          onClose={()=>setCompareOpen(false)}
          computeLabel={computeLabel}
        />
      )}
    </div>
  );
}

// Small tag input component (inline)
function TagInput({ onAdd }) {
  const [v, setV] = useState('');
  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const t = v.trim();
      if (t) onAdd(t);
      setV('');
    }
  };
  return (
    <input
      type="text"
      value={v}
      onChange={(e)=>setV(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder="태그 추가 (Enter)"
      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
      style={{ minWidth: 140 }}
    />
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
          try { sessionStorage.setItem(`sse:report:${jobId}`, JSON.stringify(payload)); } catch {}
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
          try { sessionStorage.setItem(`sse:failed:${jobId}`, reason); } catch {}
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

function CompareView({ a, b, onClose, computeLabel }) {
  const prettyBytes = (n) => {
    if (typeof n !== 'number') return '-';
    const u = ['B','KB','MB','GB','TB']; let i=0, v=n;
    while (v>=1024 && i<u.length-1) { v/=1024; i++; }
    const digits = v>=100 ? 0 : v>=10 ? 1 : 2;
    return `${v.toFixed(digits)} ${u[i]}`;
  };
  const la = computeLabel(a.data), lb = computeLabel(b.data);
  const tone = (L) => L==='FAKE' ? 'text-rose-700 bg-rose-50 border-rose-200' : L==='REAL' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200';
  const prob = (d)=> typeof d?.prob_fake === 'number' ? `${(d.prob_fake*100).toFixed(1)}%` : '-';
  const thr = (d)=> typeof d?.threshold === 'number' ? d.threshold.toFixed(2) : '-';
  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-900">비교 보기</h4>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">닫기</button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {[a,b].map((it, idx) => {
          const L = idx===0 ? la : lb;
          return (
            <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{it.meta?.name || '파일명 없음'}</p>
                  <p className="mt-0.5 text-xs text-slate-600 truncate">Job ID: {it.jobId}</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${tone(L)}`}>{L}</span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                <div>
                  <dt className="text-slate-500">확률</dt>
                  <dd className="font-semibold text-slate-900">{prob(it.data)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">임계값</dt>
                  <dd className="font-semibold text-slate-900">{thr(it.data)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">파일 크기</dt>
                  <dd className="font-semibold text-slate-900">{prettyBytes(it.meta?.size)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">타입</dt>
                  <dd className="font-semibold text-slate-900">{it.meta?.type || '-'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">표준편차</dt>
                  <dd className="font-semibold text-slate-900">{typeof it.data?.prob_std === 'number' ? it.data.prob_std.toFixed(3) : '-'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">고확신 비율</dt>
                  <dd className="font-semibold text-slate-900">{typeof it.data?.high_conf_ratio === 'number' ? `${(it.data.high_conf_ratio*100).toFixed(1)}%` : '-'}</dd>
                </div>
              </dl>
            </div>
          );
        })}
      </div>
    </div>
  );
}
