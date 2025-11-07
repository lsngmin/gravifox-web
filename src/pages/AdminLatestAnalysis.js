import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import clsx from "clsx";
import { ArrowPathIcon, ClockIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import AdminPageTopBar from "../components/admin/AdminPageTopBar";
import { fetchAdminLatestAnalysisReports } from "../api/admin";

const LIMIT_OPTIONS = [10, 25, 50, 100];

const STATUS_TONE_BADGE = {
    positive:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-100",
    warning:
        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-100",
    negative:
        "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-100",
    info:
        "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-400/30 dark:bg-sky-500/10 dark:text-sky-100",
    neutral:
        "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-600/60 dark:bg-slate-800/40 dark:text-slate-100",
};

const STATUS_TONE_DOT = {
    positive: "bg-emerald-500",
    warning: "bg-amber-500",
    negative: "bg-rose-500",
    info: "bg-sky-500",
    neutral: "bg-slate-400",
};

const formatDateTime = (value, locale = "ko") => {
    if (!value) return "—";
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
        return typeof value === "string" ? value : "—";
    }
    try {
        return new Intl.DateTimeFormat(locale, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    } catch {
        return date.toLocaleString();
    }
};

const detectStatusLabel = (analysis = {}) => {
    const candidates = [
        analysis.status,
        analysis.pipelineStatus,
        analysis.resultStatus,
        analysis.state,
        analysis.summaryStatus,
        analysis.verdict,
    ];
    for (const candidate of candidates) {
        if (typeof candidate === "string" && candidate.trim()) {
            return candidate.trim();
        }
        if (typeof candidate === "boolean") {
            return candidate ? "SUCCESS" : "FAILED";
        }
    }
    if (analysis.pass === true) return "SUCCESS";
    if (analysis.pass === false) return "FAILED";
    return null;
};

const toneForStatus = (status) => {
    const value = (status || "").toLowerCase();
    if (!value) return "neutral";
    if (/(fail|error|reject|block|denied|timeout|invalid)/.test(value)) return "negative";
    if (/(pending|queue|running|process|wait|hold)/.test(value)) return "warning";
    if (/(success|pass|complete|done|ok|valid|resolved|finish)/.test(value)) return "positive";
    if (/(review|manual|info|notice|check)/.test(value)) return "info";
    return "neutral";
};

const formatRuntime = (value) => {
    if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
        return null;
    }
    if (value >= 1000) {
        const sec = value / 1000;
        return sec >= 10 ? `${sec.toFixed(0)}초` : `${sec.toFixed(1)}초`;
    }
    return `${Math.round(value)}ms`;
};

const normalizePercentage = (value) => {
    if (typeof value !== "number" || Number.isNaN(value)) return null;
    const normalized = value <= 1 ? value * 100 : value;
    return `${Math.round(normalized)}%`;
};

const buildMetaPairs = (analysis = {}) => {
    const pairs = [];
    const reportId = analysis.reportId ?? analysis.id ?? analysis.reportID;
    if (reportId) {
        pairs.push({ key: "report", label: "리포트 ID", value: reportId });
    }

    const modelParts = [analysis.modelName, analysis.modelVersion].filter(Boolean);
    if (modelParts.length) {
        pairs.push({ key: "model", label: "모델", value: modelParts.join(" · ") });
    }

    const requester =
        analysis.requestedBy ||
        analysis.requesterEmail ||
        analysis.ownerName ||
        analysis.ownerEmail ||
        analysis.userEmail;
    if (requester) {
        pairs.push({ key: "requester", label: "요청자", value: requester });
    }

    const dataset = analysis.datasetName || analysis.dataset || analysis.collectionName;
    if (dataset) {
        pairs.push({ key: "dataset", label: "데이터 소스", value: dataset });
    }

    const mediaType = analysis.mediaType || analysis.assetType || analysis.inputType;
    if (mediaType) {
        pairs.push({ key: "media", label: "미디어 유형", value: mediaType });
    }

    const target =
        analysis.assetName || analysis.inputName || analysis.mediaName || analysis.targetName || analysis.jobName;
    if (target) {
        pairs.push({ key: "target", label: "대상", value: target });
    }

    const runtime =
        analysis.durationMs ?? analysis.elapsedMs ?? analysis.runtimeMs ?? analysis.processingTimeMs ?? analysis.latencyMs;
    const runtimeLabel = formatRuntime(runtime);
    if (runtimeLabel) {
        pairs.push({ key: "runtime", label: "처리 시간", value: runtimeLabel });
    }

    const confidence =
        normalizePercentage(
            analysis.confidence ??
                analysis.score ??
                analysis.reliability ??
                analysis.trust ??
                analysis.accuracy ??
                analysis.quality
        );
    if (confidence) {
        pairs.push({ key: "confidence", label: "신뢰도", value: confidence });
    }

    return pairs;
};

const buildMetricEntries = (analysis = {}) => {
    const metricsSource = analysis.metrics || analysis.scores || analysis.statistics;
    if (!metricsSource || typeof metricsSource !== "object") {
        return [];
    }
    return Object.entries(metricsSource)
        .filter(([, value]) => value !== null && value !== undefined)
        .slice(0, 6)
        .map(([key, value]) => ({
            key,
            label: key.replace(/[_-]+/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").toUpperCase(),
            value:
                typeof value === "number"
                    ? Number.isInteger(value)
                        ? value.toLocaleString()
                        : Number(value).toFixed(2)
                    : String(value),
        }));
};

const buildTagList = (analysis = {}) => {
    const tags = [];
    if (Array.isArray(analysis.tags)) tags.push(...analysis.tags);
    if (Array.isArray(analysis.labels)) tags.push(...analysis.labels);
    if (analysis.category) tags.push(analysis.category);
    if (analysis.mode) tags.push(analysis.mode);
    if (analysis.tier) tags.push(analysis.tier);
    return Array.from(
        new Set(
            tags
                .map((tag) => (typeof tag === "string" ? tag.trim() : String(tag)))
                .filter((tag) => tag && tag !== "-")
        )
    ).slice(0, 6);
};

const AdminLatestAnalysis = () => {
    const { lng = "ko" } = useParams();
    const [limit, setLimit] = useState(25);
    const [query, setQuery] = useState("");
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [refreshedAt, setRefreshedAt] = useState(null);

    const loadAnalyses = useCallback(
        async (sizeParam) => {
            const size = typeof sizeParam === "number" ? sizeParam : limit;
            setLoading(true);
            setError(null);
            try {
                const items = await fetchAdminLatestAnalysisReports({ size });
                setAnalyses(Array.isArray(items) ? items : []);
                setRefreshedAt(new Date());
            } catch (err) {
                setAnalyses([]);
                setError(err);
            } finally {
                setLoading(false);
            }
        },
        [limit]
    );

    useEffect(() => {
        loadAnalyses(limit);
    }, [limit, loadAnalyses]);

    const filteredAnalyses = useMemo(() => {
        const trimmed = query.trim().toLowerCase();
        if (!trimmed) return analyses;
        return analyses.filter((analysis) => {
            const haystack = [
                analysis.projectName,
                analysis.modelName,
                analysis.modelVersion,
                analysis.summary,
                analysis.reportId,
                analysis.id,
                analysis.requesterEmail,
                analysis.ownerName,
                ...(Array.isArray(analysis.tags) ? analysis.tags : []),
                ...(Array.isArray(analysis.labels) ? analysis.labels : []),
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            return haystack.includes(trimmed);
        });
    }, [analyses, query]);

    const statusSummary = useMemo(() => {
        const counts = new Map();
        analyses.forEach((analysis) => {
            const label = detectStatusLabel(analysis) ?? "상태 미정";
            const key = label || "상태 미정";
            const existing = counts.get(key);
            counts.set(key, {
                label: key,
                tone: toneForStatus(key),
                count: (existing?.count ?? 0) + 1,
            });
        });
        return Array.from(counts.values()).sort((a, b) => b.count - a.count);
    }, [analyses]);

    const pageClass =
        "min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100";
    const containerClass =
        "mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 md:px-10 md:py-16";
    const introTextClass = "max-w-3xl text-sm text-slate-600 md:text-base dark:text-slate-400";
    const controlInputClass =
        "w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-500";
    const controlSelectClass =
        "rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100";
    const controlButtonClass =
        "inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-500 dark:hover:text-white dark:focus-visible:ring-slate-400 dark:focus-visible:ring-offset-slate-900";
    const statCardClass =
        "flex flex-col gap-2 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_22px_40px_-30px_rgba(15,23,42,0.4)] dark:border-slate-800/80 dark:bg-slate-900/70";
    const listCardClass =
        "flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_30px_60px_-45px_rgba(15,23,42,0.6)] dark:border-slate-800/70 dark:bg-slate-900/70";
    const tagClass =
        "rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200";

    return (
        <main className={pageClass}>
            <div className={containerClass}>
                <header className="flex flex-col gap-6">
                    <AdminPageTopBar lng={lng} currentLabel="최신 분석" />
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-500">
                            <span>Admin</span>
                            <span className="opacity-60">Analysis Feed</span>
                        </div>
                        <h1 className="text-3xl font-semibold md:text-4xl">최신 분석 리포트</h1>
                        <p className={introTextClass}>
                            서비스 모니터링 카드에서 분리된 전용 화면입니다. 전체 팀의 최신 분석 결과를 한 번에 모니터링하고,
                            상태·요청자·모델 기준으로 빠르게 검색하세요.
                        </p>
                    </div>
                </header>

                <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-[0_26px_60px_-45px_rgba(15,23,42,0.4)] md:flex-row md:items-center md:justify-between dark:border-slate-800/70 dark:bg-slate-900/70">
                    <div className="flex w-full flex-1 items-center gap-3">
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-slate-400 dark:text-slate-500" />
                            <input
                                type="search"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="프로젝트, 모델, 요약, 리포트 ID 검색"
                                className={clsx(controlInputClass, "pl-12")}
                                aria-label="분석 검색"
                            />
                        </div>
                        <select
                            value={limit}
                            onChange={(event) => setLimit(Number(event.target.value))}
                            className={controlSelectClass}
                            aria-label="불러올 개수"
                        >
                            {LIMIT_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                    {option}건
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <ClockIcon className="h-4 w-4" />
                            <span>마지막 동기화</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">
                                {refreshedAt ? formatDateTime(refreshedAt, lng) : "—"}
                            </span>
                        </div>
                        <button
                            type="button"
                            className={controlButtonClass}
                            onClick={() => loadAnalyses(limit)}
                            disabled={loading}
                        >
                            <ArrowPathIcon
                                className={clsx("h-5 w-5", loading && "animate-spin text-sky-500 dark:text-sky-300")}
                            />
                            새로고침
                        </button>
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <article className={statCardClass}>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">전체</p>
                        <p className="text-3xl font-semibold">{analyses.length.toLocaleString()}건</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            검색 조건 적용 시 {filteredAnalyses.length.toLocaleString()}건 표시
                        </p>
                    </article>
                    {statusSummary.length === 0 ? (
                        <article className={statCardClass}>
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                                상태 데이터
                            </p>
                            <p className="text-lg text-slate-600 dark:text-slate-300">표시할 상태 정보가 없습니다.</p>
                        </article>
                    ) : (
                        statusSummary.map((status) => (
                            <article key={status.label} className={statCardClass}>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={clsx(
                                            "h-2 w-2 rounded-full",
                                            STATUS_TONE_DOT[status.tone] || STATUS_TONE_DOT.neutral
                                        )}
                                    />
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                        {status.label}
                                    </p>
                                </div>
                                <p className="text-2xl font-semibold">{status.count.toLocaleString()}건</p>
                            </article>
                        ))
                    )}
                </section>

                {error && (
                    <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-100">
                        <p className="font-semibold">최신 분석 데이터를 불러오지 못했습니다.</p>
                        <p className="mt-1">
                            {error.response?.data?.message || error.message || "알 수 없는 오류가 발생했습니다."}
                        </p>
                    </div>
                )}

                <section aria-live="polite" aria-busy={loading}>
                    {loading && filteredAnalyses.length === 0 ? (
                        <div className="space-y-4">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div
                                    key={`analysis-skeleton-${index}`}
                                    className="animate-pulse rounded-3xl border border-slate-200 bg-white/80 p-6 dark:border-slate-800/70 dark:bg-slate-900/60"
                                >
                                    <div className="h-5 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
                                    <div className="mt-3 h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
                                    <div className="mt-4 h-3 w-full rounded bg-slate-200 dark:bg-slate-800" />
                                </div>
                            ))}
                        </div>
                    ) : filteredAnalyses.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-100/70 px-6 py-10 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
                            표시할 분석 리포트가 없습니다. 검색 조건을 변경하거나 새로고침하세요.
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {filteredAnalyses.map((analysis, index) => {
                                const statusLabel = detectStatusLabel(analysis);
                                const tone = toneForStatus(statusLabel);
                                const metaPairs = buildMetaPairs(analysis);
                                const metrics = buildMetricEntries(analysis);
                                const tags = buildTagList(analysis);
                                const cardKey = analysis.reportId ?? analysis.id ?? `analysis-${index}`;
                                return (
                                    <article key={cardKey} className={listCardClass}>
                                        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-500">
                                                    {analysis.projectName ? "프로젝트" : "분석"}
                                                </p>
                                                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                                                    {analysis.projectName || analysis.title || "이름 미상"}
                                                </h2>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {formatDateTime(analysis.createdAt, lng)}
                                                </p>
                                            </div>
                                            {statusLabel && (
                                                <span
                                                    className={clsx(
                                                        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                                                        STATUS_TONE_BADGE[tone] || STATUS_TONE_BADGE.neutral
                                                    )}
                                                >
                                                    <span
                                                        className={clsx(
                                                            "h-2 w-2 rounded-full",
                                                            STATUS_TONE_DOT[tone] || STATUS_TONE_DOT.neutral
                                                        )}
                                                    />
                                                    {statusLabel}
                                                </span>
                                            )}
                                        </header>

                                        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                                            {analysis.summary || analysis.description || "요약 정보가 없습니다."}
                                        </p>

                                        {metaPairs.length > 0 && (
                                            <dl className="grid gap-4 sm:grid-cols-2">
                                                {metaPairs.map((meta) => (
                                                    <div
                                                        key={`${cardKey}-${meta.key}`}
                                                        className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3 dark:border-slate-800/70 dark:bg-slate-900/60"
                                                    >
                                                        <dt className="text-xs uppercase tracking-[0.3em] text-slate-500">
                                                            {meta.label}
                                                        </dt>
                                                        <dd className="text-sm font-medium text-slate-800 dark:text-slate-100">
                                                            {meta.value}
                                                        </dd>
                                                    </div>
                                                ))}
                                            </dl>
                                        )}

                                        {metrics.length > 0 && (
                                            <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 dark:border-slate-800/60 dark:bg-slate-900/60">
                                                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                                                    계산 지표
                                                </p>
                                                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                    {metrics.map((metric) => (
                                                        <div key={`${cardKey}-${metric.key}`}>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                {metric.label}
                                                            </p>
                                                            <p className="text-base font-semibold text-slate-900 dark:text-slate-50">
                                                                {metric.value}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {tags.map((tag) => (
                                                    <span key={`${cardKey}-${tag}`} className={tagClass}>
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
};

export default AdminLatestAnalysis;
