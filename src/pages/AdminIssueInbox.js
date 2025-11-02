import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import dayjs from "dayjs";
import clsx from "clsx";
import {
    ArrowLeftIcon,
    ArrowPathIcon,
    BugAntIcon,
    LifebuoyIcon,
    QuestionMarkCircleIcon,
    SparklesIcon,
    Squares2X2Icon,
} from "@heroicons/react/24/outline";
import IssueFetchDataAPI from "features/issues/api/issueFetchDataAPI";

const CATEGORY_META = {
    all: {
        label: "전체 항목",
        description: "모든 유형의 응답 모음",
        icon: Squares2X2Icon,
        accent: "from-slate-600 via-slate-500 to-slate-400",
    },
    "bug-report": {
        label: "버그 제보",
        description: "사용자가 발견한 오류 및 결함",
        icon: BugAntIcon,
        accent: "from-rose-500 via-pink-500 to-amber-400",
    },
    "feature-request": {
        label: "기능 제안",
        description: "신규 기능 제안 및 개선 요청",
        icon: SparklesIcon,
        accent: "from-indigo-500 via-purple-500 to-sky-400",
    },
    "support-contact": {
        label: "문의",
        description: "운영/계정 관련 문의 사항",
        icon: LifebuoyIcon,
        accent: "from-sky-500 via-cyan-400 to-emerald-400",
    },
    uncategorized: {
        label: "기타 / 미분류",
        description: "유형이 명확하지 않은 응답",
        icon: QuestionMarkCircleIcon,
        accent: "from-zinc-600 via-zinc-500 to-zinc-400",
    },
};

const CATEGORY_KEYS = ["bug-report", "feature-request", "support-contact", "uncategorized"];

const normalizeString = (value) => (typeof value === "string" ? value.toLowerCase() : "");

const resolveCategory = (issue) => {
    const directCategory = issue?.category || issue?.category_key || issue?.categoryKey;
    if (directCategory && CATEGORY_META[directCategory]) {
        return directCategory;
    }

    const rawLabels = issue?.labels;
    if (Array.isArray(rawLabels) && rawLabels.length > 0) {
        const normalizedLabels = rawLabels
            .map((label) => (typeof label === "string" ? label : label?.name || ""))
            .map((label) => normalizeString(label));

        if (normalizedLabels.some((label) => label.includes("feature") || label.includes("enhancement"))) {
            return "feature-request";
        }

        if (normalizedLabels.some((label) => label.includes("support") || label.includes("문의"))) {
            return "support-contact";
        }

        if (normalizedLabels.some((label) => label.includes("bug"))) {
            return "bug-report";
        }
    }

    const title = normalizeString(issue?.title);
    const body = normalizeString(issue?.body);

    if (title.includes("feature") || body.includes("feature")) {
        return "feature-request";
    }

    if (title.includes("support") || body.includes("support") || body.includes("문의")) {
        return "support-contact";
    }

    if (title.includes("bug") || body.includes("bug") || title.includes("이슈")) {
        return "bug-report";
    }

    return "uncategorized";
};

const resolveDate = (issue) => issue?.updated_at || issue?.updatedAt || issue?.created_at || issue?.createdAt;

const formatDateTime = (value) => {
    if (!value) {
        return "—";
    }
    const parsed = dayjs(value);
    if (!parsed.isValid()) {
        return "—";
    }
    return parsed.format("YYYY-MM-DD HH:mm");
};

const toStateLabel = (state) => {
    if (!state) return "UNKNOWN";
    const normalized = state.toString().toLowerCase();
    if (normalized === "open") return "OPEN";
    if (normalized === "closed") return "CLOSED";
    return normalized.toUpperCase();
};

const AdminIssueInbox = () => {
    const { lng = "ko" } = useParams();
    const { fetchData } = IssueFetchDataAPI();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState("all");
    const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

    const ingestIssues = useCallback((payload) => {
        if (!payload) return [];

        if (Array.isArray(payload)) {
            return payload;
        }

        if (Array.isArray(payload?.results)) {
            return payload.results;
        }

        if (typeof payload === "string") {
            try {
                const parsed = JSON.parse(payload);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return [];
            }
        }

        if (Array.isArray(payload?.data)) {
            return payload.data;
        }

        return [];
    }, []);

    const loadIssues = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetchData();
            const rawPayload = response?.data ?? response;
            const normalized = ingestIssues(rawPayload).map((issue) => {
                const category = resolveCategory(issue);
                return {
                    ...issue,
                    category,
                    resolvedUpdatedAt: resolveDate(issue),
                };
            });
            setIssues(normalized);
            setLastUpdatedAt(dayjs().format("YYYY-MM-DD HH:mm"));
        } catch (err) {
            setError(err);
            setIssues([]);
        } finally {
            setLoading(false);
        }
    }, [fetchData, ingestIssues]);

    useEffect(() => {
        loadIssues();
    }, [loadIssues]);

    const stats = useMemo(() => {
        const counts = issues.reduce(
            (acc, issue) => {
                const category = issue?.category || "uncategorized";
                acc.all += 1;
                acc[category] = (acc[category] || 0) + 1;
                return acc;
            },
            { all: 0 }
        );

        return ["all", ...CATEGORY_KEYS].map((key) => ({
            key,
            label: CATEGORY_META[key]?.label ?? CATEGORY_META.uncategorized.label,
            description: CATEGORY_META[key]?.description ?? CATEGORY_META.uncategorized.description,
            icon: CATEGORY_META[key]?.icon ?? CATEGORY_META.uncategorized.icon,
            accent: CATEGORY_META[key]?.accent ?? CATEGORY_META.uncategorized.accent,
            count: counts[key] ?? 0,
        }));
    }, [issues]);

    const filteredIssues = useMemo(() => {
        if (activeFilter === "all") return issues;
        return issues.filter((issue) => (issue?.category || "uncategorized") === activeFilter);
    }, [activeFilter, issues]);

    const supportEntryPath = `/${lng}/support`;
    const adminHomePath = `/${lng}/admin`;

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 md:px-10 md:py-16">
                <header className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                        <Link
                            to={adminHomePath}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1.5 transition hover:border-slate-600 hover:text-white"
                        >
                            <ArrowLeftIcon className="h-4 w-4" />
                            운영 허브로 돌아가기
                        </Link>
                        <span className="text-slate-600">/</span>
                        <span className="font-medium text-slate-200">사용자 피드백 수신함</span>
                    </div>
                    <h1 className="text-3xl font-semibold md:text-4xl">사용자 피드백 수신함</h1>
                    <p className="max-w-3xl text-sm text-slate-400 md:text-base">
                        지원 페이지에서 접수된 버그 제보, 기능 제안, 문의하기 내역을 한 곳에서 검토해 주세요.
                        상태와 유형별로 즉시 필터링할 수 있으며, 상세 내용은 항목을 펼쳐 확인할 수 있습니다.
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={loadIssues}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
                            disabled={loading}
                        >
                            <ArrowPathIcon
                                className={clsx("h-4 w-4", loading && "animate-spin")}
                                aria-hidden="true"
                            />
                            새로고침
                        </button>
                        <Link
                            to={supportEntryPath}
                            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/60 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:border-emerald-400 hover:bg-emerald-500/20"
                        >
                            사용자가 보는 지원 페이지 열기
                        </Link>
                        {lastUpdatedAt && (
                            <span className="text-xs text-slate-500 md:text-sm">
                                마지막 동기화: {lastUpdatedAt}
                            </span>
                        )}
                    </div>
                </header>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat) => {
                        const StatIcon = stat.icon;

                        return (
                            <button
                                key={stat.key}
                                type="button"
                                onClick={() => setActiveFilter(stat.key)}
                                className={clsx(
                                    "group relative flex flex-col rounded-3xl border border-slate-800/70 bg-slate-900/70 p-5 text-left shadow-[0_18px_40px_-28px_rgba(15,23,42,0.8)] transition duration-200 hover:border-slate-400/50 hover:bg-slate-900/90",
                                    activeFilter === stat.key && "border-emerald-400/60 shadow-[0_25px_65px_-30px_rgba(16,185,129,0.6)]"
                                )}
                            >
                                <div
                                    className={clsx(
                                        "mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg",
                                        stat.accent
                                    )}
                                >
                                    <StatIcon className="h-6 w-6" aria-hidden="true" />
                                </div>
                                <div className="flex items-baseline justify-between">
                                    <h2 className="text-lg font-semibold text-slate-50">{stat.label}</h2>
                                    <span className="text-2xl font-semibold text-emerald-400">{stat.count}</span>
                                </div>
                                <p className="mt-2 text-sm text-slate-400">{stat.description}</p>
                            </button>
                        );
                    })}
                </section>

                <section className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-100">접수된 항목</h2>
                            <p className="text-sm text-slate-500">
                                {activeFilter === "all"
                                    ? `총 ${filteredIssues.length}건의 피드백이 수집되었습니다.`
                                    : `${CATEGORY_META[activeFilter]?.label ?? "선택된"} 유형에서 ${filteredIssues.length}건이 발견되었습니다.`}
                            </p>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/60 shadow-[0_22px_60px_-30px_rgba(15,23,42,0.85)]">
                        <div className="max-h-[600px] overflow-y-auto">
                            <table className="min-w-full divide-y divide-slate-800 text-sm">
                                <thead className="bg-slate-900/80 sticky top-0 backdrop-blur">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left font-semibold text-slate-300">
                                            제목
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left font-semibold text-slate-300">
                                            유형
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left font-semibold text-slate-300">
                                            상태
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left font-semibold text-slate-300">
                                            최근 업데이트
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left font-semibold text-slate-300">
                                            세부 내용
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {loading && (
                                        <>
                                            {[...Array(4)].map((_, index) => (
                                                <tr key={`skeleton-${index}`} className="animate-pulse bg-slate-900/20">
                                                    <td className="px-6 py-5">
                                                        <div className="h-4 w-3/4 rounded bg-slate-800/90" />
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="h-4 w-24 rounded bg-slate-800/90" />
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="h-4 w-20 rounded bg-slate-800/90" />
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="h-4 w-28 rounded bg-slate-800/90" />
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="h-4 w-full rounded bg-slate-800/90" />
                                                    </td>
                                                </tr>
                                            ))}
                                        </>
                                    )}

                                    {!loading && filteredIssues.length === 0 && (
                                        <tr>
                                            <td
                                                className="px-6 py-10 text-center text-sm text-slate-500"
                                                colSpan={5}
                                            >
                                                표시할 항목이 없습니다. 다른 필터를 선택하거나 조금 뒤에 다시
                                                시도해 주세요.
                                            </td>
                                        </tr>
                                    )}

                                    {!loading &&
                                        filteredIssues.map((issue) => (
                                            <tr key={issue.id} className="transition hover:bg-slate-900/70">
                                                <td className="px-6 py-4 align-top">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-sm font-semibold text-slate-100">
                                                            {issue.title || "제목 없음"}
                                                        </span>
                                                        {issue?.number ? (
                                                            <span className="text-xs text-slate-500">
                                                                #{issue.number}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 align-top">
                                                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs font-medium text-slate-200">
                                                        {CATEGORY_META[issue.category]?.label ??
                                                            CATEGORY_META.uncategorized.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 align-top">
                                                    <span
                                                        className={clsx(
                                                            "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                                                            issue.state?.toLowerCase() === "open"
                                                                ? "border border-emerald-400/60 bg-emerald-500/10 text-emerald-200"
                                                                : "border border-slate-700 bg-slate-900/80 text-slate-200"
                                                        )}
                                                    >
                                                        {toStateLabel(issue.state)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 align-top text-sm text-slate-300">
                                                    {formatDateTime(issue.resolvedUpdatedAt)}
                                                </td>
                                                <td className="px-6 py-4 align-top text-sm text-slate-300">
                                                    <p className="line-clamp-4 whitespace-pre-line text-sm text-slate-300">
                                                        {issue.body?.trim() || "내용이 비어 있습니다."}
                                                    </p>
                                                    {issue?.repository_url && (
                                                        <p className="mt-2 text-xs text-slate-500">
                                                            저장소:{" "}
                                                            <span className="underline decoration-dotted underline-offset-2">
                                                                {issue.repository_url}
                                                            </span>
                                                        </p>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                        {error && (
                            <div className="border-t border-slate-800 bg-rose-950/40 px-6 py-4 text-sm text-rose-200">
                                피드백 데이터를 불러오지 못했습니다. 네트워크 상태를 확인한 뒤 다시 시도해 주세요.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
};

export default AdminIssueInbox;

