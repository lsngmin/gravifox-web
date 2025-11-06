import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../app/layout/Header";
import Footer from "../app/layout/Footer/Footer";
import AnalysisReport from "../features/analyze/components/report/AnalysisReport";
import { ANALYZE_ENDPOINTS } from "../api/endPointRoute";
import { normalizeAnalysisResult } from "../features/analyze/utils/normalizeResult";
import { buildStoredFailure, buildStoredReport, parseStoredFailure, parseStoredReport } from "../utils/reportStorage";

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

const STAGE_LABELS = {
  ALIGN: "얼굴 정렬 중",
  INFER: "추론 중",
  POST: "결과 정리 중",
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

function resolveStageLabel(stage) {
  if (!stage) return "진행 중";
  const upper = typeof stage === "string" ? stage.toUpperCase() : stage;
  return STAGE_LABELS[upper] || "진행 중";
}

function normalizeProgress(progress) {
  if (typeof progress !== "number" || Number.isNaN(progress)) return null;
  const pct = progress > 1 ? progress : progress * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
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
        const storedReportRaw = sessionStorage.getItem(`sse:report:${jid}`);
        const { result: storedResult, fileMeta: storedMeta } = parseStoredReport(storedReportRaw, fileMeta);
        const effectiveMeta = storedMeta || fileMeta;
        if (storedResult) {
          const normalized = normalizeAnalysisResult(storedResult);
          setReports(prev => ({ ...prev, [jid]: { ...(prev[jid] || {}), result: normalized, connected: false, fileMeta: effectiveMeta } }));
          return;
        }
        const storedFailedRaw = sessionStorage.getItem(`sse:failed:${jid}`);
        const { reason: storedReason, fileMeta: failedMeta } = parseStoredFailure(storedFailedRaw, effectiveMeta);
        if (storedReason) {
          setReports(prev => ({ ...prev, [jid]: { ...(prev[jid] || {}), error: storedReason || '분석에 실패했어요.', connected: false, fileMeta: failedMeta || effectiveMeta } }));
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
          const payload = normalizeAnalysisResult(d.result || d);
          setReports(prev => ({ ...prev, [jid]: { ...(prev[jid] || {}), result: payload, fileMeta } }));
          try { sessionStorage.setItem(`sse:report:${jid}`, JSON.stringify(buildStoredReport(payload, fileMeta))); } catch {}
        } catch {}
        es.close();
        try { sessionStorage.removeItem(`sse:${jid}`); sessionStorage.removeItem(`sse:meta:${jid}`); } catch {}
      };
      const onFailed = (e) => {
        try {
          const d = JSON.parse(e.data || '{}');
          const reason = (d?.reason || '분석에 실패했어요.');
          setReports(prev => ({ ...prev, [jid]: { ...(prev[jid] || {}), error: reason, fileMeta } }));
          try { sessionStorage.setItem(`sse:failed:${jid}`, JSON.stringify(buildStoredFailure(reason, fileMeta))); } catch {}
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
  }, [jobIds, legacyJobId, legacyToken, search]);

  const ids = jobIds;
  const statItems = [
    { label: "총 요청", value: summary.total, accent: "text-white" },
    { label: "진행 중", value: summary.running, accent: "text-indigo-100" },
    { label: "완료", value: summary.done, accent: "text-emerald-100" },
    { label: "실패", value: summary.failed, accent: "text-rose-100" },
  ];
  const formatNumber = (v) => {
    if (typeof v !== "number" || Number.isNaN(v)) return "-";
    return v.toLocaleString();
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-900 text-slate-100">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.28),transparent_60%)]" aria-hidden />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-900/60 via-transparent" aria-hidden />
          <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-end">
              <div className="flex-1">
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
                  Analyze Result
                </span>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  미디어 분석 리포트가 준비됐어요
                </h1>
                <p className="mt-4 max-w-2xl text-sm text-slate-300 sm:text-base">
                  업로드한 미디어에 대한 판정과 핵심 지표를 한눈에 확인해 보세요. 필요한 경우 PDF로 저장하거나 추가 분석을 바로 진행할 수 있어요.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/analyze")}
                    className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm font-semibold text-slate-100 transition hover:border-white/40 hover:bg-white/10"
                  >
                    돌아가기
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-900/20 transition hover:bg-slate-100"
                  >
                    PDF로 저장
                  </button>
                </div>
              </div>
              {summary.total > 0 && (
                <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/10 p-5 shadow-xl shadow-black/10 backdrop-blur-sm">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-200">
                    <span>전체 진행률</span>
                    <span>{summary.pct}%</span>
                  </div>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-300 transition-all duration-500"
                      style={{ width: `${summary.pct}%` }}
                    />
                  </div>
                  <p className="mt-4 text-xs text-slate-300">
                    {summary.done > 0 ? `완료 ${summary.done.toLocaleString()}건, 진행 ${summary.running.toLocaleString()}건, 실패 ${summary.failed.toLocaleString()}건` : "분석이 진행 중이에요."}
                  </p>
                </div>
              )}
            </div>

            {summary.total > 0 && (
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statItems.map((item) => (
                  <div
                    key={item.label}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.08] p-5 shadow-lg shadow-slate-950/5 backdrop-blur"
                  >
                    <div className="absolute inset-0 translate-y-8 scale-[1.15] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_55%)] opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100" aria-hidden />
                    <div className="relative z-10 flex flex-col">
                      <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-300">{item.label}</span>
                      <span className={`mt-3 text-2xl font-semibold ${item.accent}`}>
                        {formatNumber(item.value)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="relative z-10 -mt-10 pb-16 sm:-mt-14 sm:pb-24">
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
            {ids.length > 0 && (
              <div className="grid gap-6">
                {ids.map((jid) => {
                  const r = reports[jid] || {};
                  const progressPct = normalizeProgress(r.progress);
                  const stageLabel = resolveStageLabel(r.stage);

                  if (r.result) {
                    return (
                      <div key={jid} className="relative">
                        <AnalysisReport ref={reportRef} data={r.result} mediaMeta={r.fileMeta} />
                      </div>
                    );
                  }

                  if (r.error) {
                    return (
                      <div
                        key={jid}
                        className="overflow-hidden rounded-2xl border border-rose-200 bg-white p-6 text-sm text-rose-700 shadow-sm shadow-rose-200/50"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="text-base font-semibold text-rose-600">분석 실패</div>
                          {r.fileMeta?.name && (
                            <div className="truncate text-xs font-medium text-rose-500/80">파일명 · {r.fileMeta.name}</div>
                          )}
                        </div>
                        <p className="mt-3 leading-relaxed text-rose-600">{r.error}</p>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={jid}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60 transition hover:border-indigo-200 hover:shadow-lg"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">분석 진행 중</p>
                          {r.fileMeta?.name && (
                            <p className="mt-2 truncate text-base font-semibold text-slate-900" title={r.fileMeta.name}>
                              {r.fileMeta.name}
                            </p>
                          )}
                          <p className="mt-1 text-sm text-slate-500">{stageLabel}</p>
                        </div>
                        <div className="flex flex-col items-start gap-3 text-sm text-indigo-600 sm:flex-row sm:items-center sm:gap-4">
                          <LoadingMent stage={r.stage} />
                          <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                            {r.connected ? "실시간 연결" : "연결 대기"}
                          </span>
                        </div>
                      </div>
                      {progressPct !== null && (
                        <div className="mt-5">
                          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>진행률</span>
                            <span className="text-slate-700">{progressPct}%</span>
                          </div>
                          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 transition-all duration-500"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {ids.length === 0 && (
              <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/60">
                <div className="max-w-xl">
                  <h2 className="text-lg font-semibold text-slate-900">분석 내역이 없어요</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    유효한 분석 세션을 찾지 못했어요. 새 미디어를 업로드하고 분석을 시작해 주세요.
                  </p>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/analyze")}
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600"
                  >
                    업로드 페이지로 이동
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
