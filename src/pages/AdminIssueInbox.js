import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import dayjs from "dayjs";
import clsx from "clsx";
import {
    ArrowPathIcon,
    BugAntIcon,
    LifebuoyIcon,
    QuestionMarkCircleIcon,
    SparklesIcon,
    Squares2X2Icon,
} from "@heroicons/react/24/outline";
import IssueFetchDataAPI from "features/issues/api/issueFetchDataAPI";
import AdminPageTopBar from "../components/admin/AdminPageTopBar";

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
    if (!value) return "—";
    const parsed = dayjs(value);
    if (!parsed.isValid()) return "—";
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

    const pageClass =
        "min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100";
    const containerClass =
        "mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 md:px-10 md:py-16";
    const introTextClass = "max-w-3xl text-sm text-slate-600 md:text-base dark:text-slate-400";
    const refreshButtonClass =
        "inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-500 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white dark:focus-visible:ring-slate-400 dark:focus-visible:ring-offset-slate-950";
    const supportLinkClass =
        "inline-flex items-center gap-2 rounded-full border border-emerald-400 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-emerald-500/60 dark:bg-emerald-500/10 dark:text-emerald-100 dark:hover:border-emerald-400 dark:hover:bg-emerald-500/20 dark:focus-visible:ring-offset-slate-950";
    const timestampClass = "text-xs text-slate-500 md:text-sm";
    const baseStatCardClass =
        "group relative flex flex-col rounded-3xl border border-slate-200 bg-white/90 p-5 text-left shadow-[0_20px_45px_-25px_rgba(15,23,42,0.28)] transition duration-200 hover:border-slate-400/60 hover:bg-slate-50 dark:border-slate-800/70 dark:bg-slate-900/70 dark:shadow-[0_18px_40px_-28px_rgba(15,23,42,0.8)] dark:hover:border-slate-400/50 dark:hover:bg-slate-900/90";
    const statCardClass = (key) =>
        clsx(baseStatCardClass, activeFilter === key && "border-emerald-400/60 shadow-[0_25px_65px_-30px_rgba(16,185,129,0.45)] dark:border-emerald-400/60");
    const statLabelClass = "text-lg font-semibold text-slate-900 dark:text-slate-50";
    const statDescriptionClass = "mt-2 text-sm text-slate-600 dark:text-slate-400";
    const sectionTitleClass = "text-xl font-semibold text-slate-900 dark:text-slate-100";
    const sectionSubtextClass = "text-sm text-slate-600 dark:text-slate-500";
    const tableShellClass =
        "overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-[0_32px_60px_-34px_rgba(15,23,42,0.24)] transition-shadow dark:border-slate-800/80 dark:bg-slate-900/60 dark:shadow-[0_22px_60px_-30px_rgba(15,23,42,0.85)]";
    const tableHeadClass = "sticky top-0 bg-slate-100/95 backdrop-blur dark:bg-slate-900/85";
    const tableHeaderCellClass =
        "px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300";
    const tableBodyCellClass = "px-6 py-4 align-top text-sm text-slate-600 dark:text-slate-300";
    const detailTextClass = "line-clamp-4 whitespace-pre-line text-sm text-slate-600 dark:text-slate-300";
    const repoTextClass = "mt-2 text-xs text-slate-500 dark:text-slate-500";
    const errorBannerClass =
        "border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200";
    const skeletonRowClass = "animate-pulse bg-slate-50 dark:bg-slate-900/20";
    const skeletonBlockClass = "h-4 rounded bg-slate-200 dark:bg-slate-800/90";
    const mobileCardClass =
        "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/70 dark:shadow-[0_18px_40px_-32px_rgba(15,23,42,0.7)]";
    const mobileTitleClass = "text-base font-semibold text-slate-900 dark:text-slate-100";
    const mobileMetaLabelClass = "text-xs font-semibold uppercase tracking-[0.25em] text-slate-500";
    const mobileMetaValueClass = "text-sm text-slate-600 dark:text-slate-300";
    const mobileBodyTextClass = "mt-2 text-sm text-slate-600 dark:text-slate-300";
    const statusBadgeClass = (state) => {
        const normalized = (state || "").toString().toLowerCase();
        if (normalized === "open") {
            return "inline-flex items-center gap-1 rounded-full border border-emerald-400 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200";
        }
        if (normalized === "closed") {
            return "inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-200";
        }
        return "inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-500 dark:bg-slate-800/60 dark:text-slate-200";
    };

    return (
        <main className={pageClass}>
            <div className={containerClass}>
                <header className="flex flex-col gap-6">
                    <AdminPageTopBar lng={lng} currentLabel="사용자 피드백 수신함" />
                    <div className="flex flex-col gap-3">
                        <h1 className="text-3xl font-semibold md:text-4xl">사용자 피드백 수신함</h1>
                        <p className={introTextClass}>
                            지원 페이지에서 접수된 버그 제보, 기능 제안, 문의하기 내역을 한 곳에서 검토해 주세요.
                            상태와 유형별로 즉시 필터링할 수 있으며, 상세 내용은 항목을 펼쳐 확인할 수 있습니다.
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={loadIssues}
                                className={refreshButtonClass}
                                disabled={loading}
                            >
                                <ArrowPathIcon className={clsx("h-4 w-4", loading && "animate-spin")} aria-hidden="true" />
                                새로고침
                            </button>
                            <Link to={supportEntryPath} className={supportLinkClass}>
                                사용자가 보는 지원 페이지 열기
                            </Link>
                            {lastUpdatedAt && <span className={timestampClass}>마지막 동기화: {lastUpdatedAt}</span>}
                        </div>
                    </div>
                </header>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat) => {
                        const StatIcon = stat.icon;
                        return (
                            <button
                                key={stat.key}
                                type="button"
                                onClick={() => setActiveFilter(stat.key)}
                                className={statCardClass(stat.key)}
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
                                    <h2 className={statLabelClass}>{stat.label}</h2>
                                    <span className="text-2xl font-semibold text-emerald-500 dark:text-emerald-400">
                                        {stat.count}
                                    </span>
                                </div>
                                <p className={statDescriptionClass}>{stat.description}</p>
                            </button>
                        );
                    })}
                </section>

                <section className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div className="space-y-1">
                            <h2 className={sectionTitleClass}>접수된 항목</h2>
                            <p className={sectionSubtextClass}>
                                {activeFilter === "all"
                                    ? `총 ${filteredIssues.length}건의 피드백이 수집되었습니다.`
                                    : `${CATEGORY_META[activeFilter]?.label ?? "선택된"} 유형에서 ${filteredIssues.length}건이 발견되었습니다.`}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 lg:hidden">
                        {loading
                            ? Array.from({ length: 3 }).map((_, index) => (
                                  <div key={`mobile-skeleton-${index}`} className={mobileCardClass}>
                                      <div className={clsx("h-4 w-3/4", skeletonBlockClass)} />
                                      <div className="mt-3 flex flex-wrap gap-3">
                                          <span className={clsx("h-3 w-20", skeletonBlockClass)} />
                                          <span className={clsx("h-3 w-16", skeletonBlockClass)} />
                                      </div>
                                      <div className={clsx("mt-4 h-20", skeletonBlockClass)} />
                                  </div>
                              ))
                            : filteredIssues.length > 0
                            ? filteredIssues.map((issue) => (
                                  <article key={issue.id || issue.number || issue.title} className={mobileCardClass}>
                                      <h3 className={mobileTitleClass}>{issue.title || "제목 미상"}</h3>
                                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                                          <span className={mobileMetaLabelClass}>유형</span>
                                          <span className={mobileMetaValueClass}>
                                              {CATEGORY_META[issue.category]?.label ?? "기타"}
                                          </span>
                                          <span className={mobileMetaLabelClass}>상태</span>
                                          <span className={mobileMetaValueClass}>{toStateLabel(issue.state)}</span>
                                          <span className={mobileMetaLabelClass}>업데이트</span>
                                          <span className={mobileMetaValueClass}>
                                              {formatDateTime(issue.resolvedUpdatedAt)}
                                          </span>
                                      </div>
                                      <p className={mobileBodyTextClass}>
                                          {issue.body?.trim() || "내용이 비어 있습니다."}
                                      </p>
                                      {issue?.repository_url && (
                                          <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                                              저장소:{" "}
                                              <span className="underline decoration-dotted underline-offset-2">
                                                  {issue.repository_url}
                                              </span>
                                          </p>
                                      )}
                                  </article>
                              ))
                            : (
                                  <p className="text-sm text-slate-500 dark:text-slate-400">
                                      표시할 항목이 없습니다.
                                  </p>
                              )}
                    </div>

                    <div className={clsx("hidden lg:block", tableShellClass)}>
                        <div className="max-h-[600px] overflow-y-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                                <thead className={tableHeadClass}>
                                    <tr>
                                        <th className={tableHeaderCellClass}>제목</th>
                                        <th className={tableHeaderCellClass}>유형</th>
                                        <th className={tableHeaderCellClass}>상태</th>
                                        <th className={tableHeaderCellClass}>최근 업데이트</th>
                                        <th className={tableHeaderCellClass}>세부 내용</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {loading &&
                                        Array.from({ length: 4 }).map((_, index) => (
                                            <tr key={`skeleton-${index}`} className={skeletonRowClass}>
                                                <td className="px-6 py-5">
                                                    <div className={clsx("w-3/4", skeletonBlockClass)} />
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className={clsx("w-24", skeletonBlockClass)} />
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className={clsx("w-16", skeletonBlockClass)} />
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className={clsx("w-28", skeletonBlockClass)} />
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className={clsx("h-16", skeletonBlockClass)} />
                                                </td>
                                            </tr>
                                        ))}

                                    {!loading && filteredIssues.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                                                표시할 항목이 없습니다.
                                            </td>
                                        </tr>
                                    )}

                                    {!loading &&
                                        filteredIssues.map((issue) => (
                                            <tr key={issue.id || issue.number || issue.title}>
                                                <td className={tableBodyCellClass}>
                                                    <p className="font-medium text-slate-900 dark:text-slate-100">
                                                        {issue.title || "제목 미상"}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                                                        #{issue.number ?? "—"}
                                                    </p>
                                                </td>
                                                <td className={tableBodyCellClass}>
                                                    <span className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-200">
                                                        {CATEGORY_META[issue.category]?.label ?? "기타"}
                                                    </span>
                                                </td>
                                                <td className={tableBodyCellClass}>
                                                    <span className={statusBadgeClass(issue.state)}>
                                                        {toStateLabel(issue.state)}
                                                    </span>
                                                </td>
                                                <td className={tableBodyCellClass}>
                                                    {formatDateTime(issue.resolvedUpdatedAt)}
                                                </td>
                                                <td className={tableBodyCellClass}>
                                                    <p className={detailTextClass}>
                                                        {issue.body?.trim() || "내용이 비어 있습니다."}
                                                    </p>
                                                    {issue?.repository_url && (
                                                        <p className={repoTextClass}>
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
                    </div>

                    {error && (
                        <div className={errorBannerClass}>
                            피드백 데이터를 불러오지 못했습니다. 네트워크 상태를 확인한 뒤 다시 시도해 주세요.
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
};

export default AdminIssueInbox;
