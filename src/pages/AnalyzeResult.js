import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navigation from "../features/navigation/navigation";
import Footer from "../features/footer/footer";
import AnalysisReport from "../features/analyze/components/report/AnalysisReport";
import HelpTips from "../features/analyze/components/report/HelpTips";
import { ANALYZE_ENDPOINTS } from "../api/endPointRoute";

// 로딩 멘트(랜덤 회전). 스테이지에 맞춘 후보 포함
const LOADING_MENTS = {
  ANY: [
    "분석을 준비하고 있어요…",
    "증거를 정리하고 있어요…",
    "신뢰도를 계산하고 있어요…",
    "잠시만 기다려 주세요…",
  ],
  ALIGN: [
    "얼굴을 포착하고 있어요…",
    "프레임을 정렬하는 중이에요…",
  ],
  INFER: [
    "이상 징후를 감지하고 있어요…",
    "AI 이미지 진위 여부를 확인 중이에요…",
  ],
  POST: [
    "결과를 정리하고 있어요…",
    "리포트를 구성하고 있어요…",
  ],
};

function pickMent(stage) {
  const pool = [
    ...(LOADING_MENTS[stage?.toUpperCase?.()] || []),
    ...LOADING_MENTS.ANY,
  ];
  const i = Math.floor(Math.random() * pool.length);
  return pool[i] || "분석 중이에요…";
}

function LoadingMent({ stage }) {
  const [text, setText] = useState(() => pickMent(stage));
  const [visible, setVisible] = useState(true);

  // inject shimmer keyframes once
  useEffect(() => {
    if (!document.getElementById('loading-ment-anims')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'loading-ment-anims';
      styleEl.textContent = `@keyframes lm-shimmer {0%{background-position:200% 0}100%{background-position:-200% 0}}`;
      document.head.appendChild(styleEl);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      // 부드러운 전환: 짧은 페이드아웃 후 즉시 페이드인(교체)
      setVisible(false);
      const t = setTimeout(() => {
        setText(pickMent(stage));
        setVisible(true);
      }, 300);
      return () => clearTimeout(t);
    }, 3600);
    return () => clearInterval(timer);
  }, [stage]);

  // shimmer text style (gray tone)
  const shimmerStyle = {
    backgroundImage: 'linear-gradient(90deg, #9ca3af 0%, #6b7280 50%, #9ca3af 100%)',
    backgroundSize: '200% 100%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: 'lm-shimmer 3s linear infinite',
  };

  return (
    <span
      className={`inline-block text-xs font-medium leading-5 transition-opacity duration-300 ease-in-out ${visible ? 'opacity-100' : 'opacity-0'} truncate whitespace-nowrap max-w-full`}
      style={shimmerStyle}
    >
      {text}
    </span>
  );
}

export default function AnalyzeResult() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const jobIdsCsv = params.get("jobIds");
  const legacyJobId = params.get("jobId");
  const legacyToken = params.get("token");

  const jobIds = useMemo(() => {
    if (jobIdsCsv) return jobIdsCsv.split(',').map(s => s.trim()).filter(Boolean);
    if (legacyJobId) return [legacyJobId];
    return [];
  }, [jobIdsCsv, legacyJobId]);

  const [reports, setReports] = useState({}); // jobId -> { stage, progress, result, error, connected, fileMeta }
  const reportRef = useRef(null);

  const onPrint = () => window.print();

  const summary = useMemo(() => {
    const total = jobIds.length;
    let done = 0, failed = 0;
    jobIds.forEach((jid) => {
      const r = reports[jid];
      if (!r) return;
      if (r.result) done += 1; else if (r.error) failed += 1;
    });
    const running = Math.max(total - done - failed, 0);
    const pct = total > 0 ? Math.round(((done + failed) / total) * 100) : 0;
    return { total, done, failed, running, pct };
  }, [jobIds, reports]);

  useEffect(() => {
    // 마이그레이션: legacy token이 쿼리에 있으면 sessionStorage로 옮기고 URL 정리
    if (legacyJobId && legacyToken) {
      try { sessionStorage.setItem(`sse:${legacyJobId}`, legacyToken); } catch {}
      const sp = new URLSearchParams(search);
      sp.delete('token');
      sp.delete('jobId');
      sp.set('jobIds', legacyJobId);
      window.history.replaceState(null, '', `${window.location.pathname}?${sp.toString()}`);
    }
    if (!jobIds.length) return;

    const sources = [];
    jobIds.forEach((jid) => {
      const token = sessionStorage.getItem(`sse:${jid}`);
      const metaStr = sessionStorage.getItem(`sse:meta:${jid}`);
      const fileMeta = (() => { try { return metaStr ? JSON.parse(metaStr) : null; } catch { return null; } })();

      if (!token) {
        // 토큰이 없어도, 저장된 결과/실패 정보가 있으면 복원해서 표시
        const savedResult = (() => { try { return JSON.parse(sessionStorage.getItem(`sse:report:${jid}`) || 'null'); } catch { return null; } })();
        const savedFailed = sessionStorage.getItem(`sse:failed:${jid}`);
        if (savedResult) {
          setReports(prev => ({ ...prev, [jid]: { ...(prev[jid] || {}), result: savedResult, connected: false, fileMeta } }));
          return;
        }
        if (savedFailed) {
          setReports(prev => ({ ...prev, [jid]: { ...(prev[jid] || {}), error: savedFailed || '분석에 실패했어요.', connected: false, fileMeta } }));
          return;
        }
        setReports(prev => ({ ...prev, [jid]: { ...(prev[jid] || {}), error: '세션 토큰을 찾을 수 없어요. 다시 시작해 주세요.', connected: false, fileMeta } }));
        return;
      }
      const url = `${ANALYZE_ENDPOINTS.SSE(jid)}?token=${encodeURIComponent(token)}`;
      const es = new EventSource(url);
      sources.push(es);
      es.onopen = () => setReports(prev => ({ ...prev, [jid]: { ...(prev[jid] || {}), connected: true, fileMeta } }));
      es.onerror = () => setReports(prev => ({ ...prev, [jid]: { ...(prev[jid] || {}), connected: false, fileMeta } }));

      const onProgress = (e) => {
        try {
          const d = JSON.parse(e.data || '{}');
          setReports(prev => ({ ...prev, [jid]: { ...(prev[jid] || {}), stage: d.stage, progress: d.progress, fileMeta } }));
        } catch {}
      };
      const onResult = (e) => {
        try {
          const d = JSON.parse(e.data || '{}');
          const payload = (d.result || d);
          setReports(prev => ({ ...prev, [jid]: { ...(prev[jid] || {}), result: payload, fileMeta } }));
          try { sessionStorage.setItem(`sse:report:${jid}`, JSON.stringify(payload)); } catch {}
        } catch {}
        es.close();
        try { sessionStorage.removeItem(`sse:${jid}`); sessionStorage.removeItem(`sse:meta:${jid}`); } catch {}
      };
      const onFailed = (e) => {
        try {
          const d = JSON.parse(e.data || '{}');
          const reason = (d?.reason || '분석에 실패했어요.');
          setReports(prev => ({ ...prev, [jid]: { ...(prev[jid] || {}), error: reason, fileMeta } }));
          try { sessionStorage.setItem(`sse:failed:${jid}`, reason); } catch {}
        } catch {
          setReports(prev => ({ ...prev, [jid]: { ...(prev[jid] || {}), error: '분석에 실패했어요.', fileMeta } }));
        }
        es.close();
        try { sessionStorage.removeItem(`sse:${jid}`); sessionStorage.removeItem(`sse:meta:${jid}`); } catch {}
      };
      es.addEventListener('progress', onProgress);
      es.addEventListener('result', onResult);
      es.addEventListener('failed', onFailed);
    });

    return () => { sources.forEach(s => { try { s.close(); } catch {} }); };
  }, [jobIdsCsv, legacyJobId, legacyToken]);

  const ids = jobIds;

  // helpers
  const prettyBytes = (n) => {
    if (typeof n !== 'number') return '-';
    const u = ['B','KB','MB','GB','TB'];
    let i = 0, v = n;
    while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
    const digits = v >= 100 ? 0 : v >= 10 ? 1 : 2;
    return `${v.toFixed(digits)} ${u[i]}`;
  };

  return (
    <div className="p-0">
      <Navigation />
      <div className="mx-auto mt-24 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-600">미디어 분석 완료</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/analyze")}
              className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              돌아가기
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              PDF로 저장
            </button>
          </div>
        </div>

        {summary.total > 0 && (
          <div className="mb-4">
            <div className="mx-auto w-full max-w-5xl flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">총 {summary.total}</span>
                <span className="rounded-md bg-indigo-50 px-2 py-1 text-indigo-700">진행 {summary.running}</span>
                <span className="rounded-md bg-emerald-50 px-2 py-1 text-emerald-700">완료 {summary.done}</span>
                <span className="rounded-md bg-rose-50 px-2 py-1 text-rose-700">실패 {summary.failed}</span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className="h-2 w-40 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-2 rounded-full transition-all" style={{ width: `${summary.pct}%`, background: 'var(--brand)' }} />
                </div>
                <span className="text-slate-600">{summary.pct}%</span>
              </div>
            </div>
            {/* <HelpTips variant="D" /> */}
          </div>
        )}

        {ids.length > 0 && (
          <div className="space-y-4">
            {ids.map((jid) => {
              const r = reports[jid] || {};

              // 완료: 리포트 카드만 표시
              if (r.result) {
                return (
                  <div key={jid}>
                    <AnalysisReport ref={reportRef} data={r.result} mediaMeta={r.fileMeta} />
                  </div>
                );
              }

              // 실패: 에러만 간결히 표시
              if (r.error) {
                return (
                  <div key={jid} className="mx-auto w-full max-w-5xl rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                    {r.error}
                  </div>
                );
              }

              // 진행 중: 파일명 + 우측 멘트(헤더 내부 중앙 정렬)
              return (
                <div key={jid} className="mx-auto w-full max-w-5xl rounded-xl border border-slate-200 bg-white p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      {r.fileMeta?.name && (
                        <p className="truncate text-sm font-medium text-slate-800">파일: {r.fileMeta.name}</p>
                      )}
                    </div>
                    <div className="flex w-48 h-6 items-center justify-end text-right overflow-hidden">
                      <LoadingMent stage={r.stage} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {ids.length === 0 && (
          <div className="mt-4 rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-700">
            유효한 분석 세션이 없어요. 파일을 업로드하고 분석을 시작해주세요.
            <button
              type="button"
              onClick={() => navigate("/analyze")}
              className="ml-3 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              업로드 페이지로 이동
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
