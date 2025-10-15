import { useEffect, useState } from "react";
import AnalysisHistoryList from "./components/AnalysisHistoryList";
import { fetchQuotaSummary } from "../analyze/api/quotaSummary";

const SummaryDashboard = () => {
    const [quotaSummary, setQuotaSummary] = useState(null);
    const [quotaLoading, setQuotaLoading] = useState(true);
    const [quotaError, setQuotaError] = useState(null);

    const quotaFallbackMessage =
        "남은 분석 횟수를 잠시 확인하지 못했어요. 테스트 환경이라면 생길 수 있는 정상 상황이니, 실제 서비스에서는 잠시 후 다시 시도하거나 문제가 계속되면 관리자에게 알려주세요.";

    useEffect(() => {
        if (typeof document === "undefined") return;
        const id = "dashboard-dark-styles";
        if (document.getElementById(id)) return;
        const style = document.createElement("style");
        style.id = id;
        style.textContent = `
          body.dashboard-body-dark,
          body.dashboard-body-dark #root {
            background-color: #13213f;
          }
          .dashboard-dark {
            background-color: #13213f;
            color: rgba(226,232,240,0.92);
          }
          .dashboard-dark a {
            color: rgba(165,180,252,0.88);
          }
          .dashboard-dark .bg-white {
            --tw-bg-opacity: 1;
            background-color: rgba(30,41,59,0.72);
            backdrop-filter: blur(10px);
          }
          .dashboard-dark .bg-slate-100 {
            background-color: rgba(41,53,75,0.6);
          }
          .dashboard-dark .bg-rose-50 {
            background-color: rgba(120,22,45,0.6);
          }
          .dashboard-dark .bg-emerald-50 {
            background-color: rgba(22,78,73,0.55);
          }
          .dashboard-dark .bg-amber-50 {
            background-color: rgba(120,63,4,0.58);
          }
          .dashboard-dark .bg-slate-200 {
            background-color: rgba(100,116,139,0.3);
          }
          .dashboard-dark .border-slate-200 {
            --tw-border-opacity: 1;
            border-color: rgba(94,106,131,0.4);
          }
          .dashboard-dark .border-rose-200 {
            border-color: rgba(244,63,94,0.35);
          }
          .dashboard-dark .border-emerald-200 {
            border-color: rgba(16,185,129,0.32);
          }
          .dashboard-dark .border-amber-200 {
            border-color: rgba(245,158,11,0.3);
          }
          .dashboard-dark .text-slate-900,
          .dashboard-dark .text-slate-800,
          .dashboard-dark .text-slate-700 {
            color: rgba(226,232,240,0.94);
          }
          .dashboard-dark .text-slate-600,
          .dashboard-dark .text-slate-500 {
            color: rgba(148,163,184,0.78);
          }
          .dashboard-dark .text-slate-400 {
            color: rgba(148,163,184,0.72);
          }
          .dashboard-dark .text-rose-700 {
            color: rgba(254,205,211,0.92);
          }
          .dashboard-dark .text-emerald-700 {
            color: rgba(167,243,208,0.92);
          }
          .dashboard-dark .text-amber-700 {
            color: rgba(253,230,138,0.92);
          }
          .dashboard-dark .text-indigo-600 {
            color: rgba(165,180,252,0.88);
          }
          .dashboard-dark .hover\\:bg-slate-50:hover {
            background-color: rgba(30,41,59,0.6);
          }
          .dashboard-dark .hover\\:bg-white\\/10:hover {
            background-color: rgba(226,232,240,0.08);
          }
          .dashboard-dark .focus\\:ring-indigo-500\\/30:focus {
            --tw-ring-opacity: 0.45;
            --tw-ring-color: rgba(129,140,248,var(--tw-ring-opacity));
          }
        `;
        document.head.appendChild(style);
    }, []);

    useEffect(() => {
        if (typeof document === "undefined") return;
        document.body.classList.add("dashboard-body-dark");
        return () => {
            document.body.classList.remove("dashboard-body-dark");
        };
    }, []);

    useEffect(() => {
        let active = true;
        (async () => {
            setQuotaLoading(true);
            try {
                const summary = await fetchQuotaSummary();
                if (active) {
                    setQuotaSummary(summary);
                    setQuotaError(null);
                }
            } catch (err) {
                if (active) {
                    setQuotaError(quotaFallbackMessage);
                }
            } finally {
                if (active) setQuotaLoading(false);
            }
        })();
        return () => {
            active = false;
        };
    }, []);

    const formatCount = (value) => {
        if (typeof value !== "number" || !Number.isFinite(value)) return "-";
        try {
            return value.toLocaleString("ko-KR");
        } catch {
            return String(value);
        }
    };

    return (
        <div className="dashboard-dark flex-1 bg-slate-800 p-4 text-slate-100 md:p-6">
            <div className="mx-auto w-full max-w-6xl space-y-6">
                {/* Dashboard hero */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-700/55 bg-slate-700/60 px-5 py-7 shadow-lg shadow-slate-900/20 md:px-6 md:py-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-700/30 via-slate-900/70 to-indigo-900/50" />
                    <div className="absolute inset-y-0 right-[-10%] w-64 bg-gradient-to-l from-violet-500/35 via-indigo-400/20 to-transparent blur-3xl opacity-70" aria-hidden="true" />
                    <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-gradient-to-br from-indigo-500/30 via-violet-500/20 to-transparent blur-3xl opacity-70" aria-hidden="true" />
                    <div className="relative space-y-3">
                        <h1 className="text-2xl font-bold text-slate-100 md:text-3xl">
                            Dashboard
                            <span className="ml-2 text-lg font-medium text-indigo-200/80 md:text-xl">Control Center</span>
                        </h1>
                        <p className="max-w-2xl text-sm text-slate-400 sm:text-base">최근 분석 결과를 모아놨어요.</p>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-700/50 bg-slate-700/35 px-4 py-3 text-sm text-slate-300 shadow-inner shadow-slate-900/20">
                    {quotaLoading
                        ? "남은 분석 횟수를 불러오는 중이에요…"
                        : typeof quotaSummary?.remaining === "number"
                            ? `이번 달 남은 분석은 ${formatCount(quotaSummary.remaining)}회예요.${
                                typeof quotaSummary.limit === "number"
                                    ? ` (총 ${formatCount(quotaSummary.limit)}회 중 ${formatCount(Math.max(0, quotaSummary.remaining))}회 남음)`
                                    : ""
                            }`
                            : quotaError}
                </div>

                {/* Hero header with soft gradient */}
                {/*
                <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60 shadow-lg shadow-slate-900/30">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 opacity-95" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.25),_transparent_55%)]" />
                    <div className="relative px-5 py-6 md:px-6 md:py-7">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <h1 className="text-lg font-semibold text-slate-100 sm:text-xl md:text-2xl">Dashboard</h1>
                        </div>
                        <div className="mt-6">
                            <StatsSummaryBar />
                        </div>
                    </div>
                </div>
                */}

                <div className="flex flex-col items-stretch sm:flex-row sm:justify-end">
                    <a
                        href="/analyze"
                        className="inline-flex w-full items-center justify-center rounded-md bg-indigo-500 px-4 py-[0.65rem] text-sm font-semibold !text-white shadow-lg shadow-indigo-900/40 transition hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 sm:w-auto sm:px-5 sm:py-[0.82rem]"
                    >
                        + 새 분석
                    </a>
                </div>

                {/* Body */}
                <AnalysisHistoryList />
            </div>
        </div>
    );
};
export default SummaryDashboard;
