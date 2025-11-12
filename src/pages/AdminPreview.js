import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import {
    UserGroupIcon,
    ChartPieIcon,
    BoltIcon,
    ArrowTrendingUpIcon,
    EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { fetchAdminLatestAnalysisReports, fetchAdminUsers, resetAdminUserQuota } from "../api/admin";
import AdminPageTopBar from "../components/admin/AdminPageTopBar";
import AdminUserActions from "../components/admin/AdminUserActions";

const activityFeed = [
    {
        id: "INC-1042",
        severity: "warning",
        title: "업로드 지연 감지",
        detail: "서울 리전 미디어 업로드가 3분 이상 지연되었습니다.",
        time: "2분 전",
    },
    {
        id: "AUD-991",
        severity: "info",
        title: "권한 변경",
        detail: "운영자 jason이 Enterprise 팀 'Photon'의 역할을 갱신했습니다.",
        time: "18분 전",
    },
    {
        id: "REP-775",
        severity: "notice",
        title: "신규 리포트 제출",
        detail: "pixeltrail 팀이 모델 버전 v1.4.2 검증 결과를 업로드했습니다.",
        time: "47분 전",
    },
];

const analysisTrend = [
    { label: "월", value: 320 },
    { label: "화", value: 412 },
    { label: "수", value: 388 },
    { label: "목", value: 460 },
    { label: "금", value: 508 },
];

const PAGE_SIZE = 10;
const RECENT_ANALYSIS_LIMIT = 10;

const AdminPreview = () => {
    const params = useParams();
    const { i18n } = useTranslation();
    const paramsLng = params?.lng;
    const resolvedLng = useMemo(() => {
        if (paramsLng) return paramsLng;
        const fallback = i18n.language || "ko";
        return fallback.slice(0, 2);
    }, [paramsLng, i18n.language]);
    const mailPath = `/${resolvedLng}/admin/mail`;
    const latestAnalysisPath = `/${resolvedLng}/admin/analysis`;

    const [recentAnalyses, setRecentAnalyses] = useState([]);
    const [recentLoading, setRecentLoading] = useState(false);
    const [recentError, setRecentError] = useState(null);
    const [userItems, setUserItems] = useState([]);
    const [pageMeta, setPageMeta] = useState({ page: -1, totalPages: 0, totalElements: 0, size: PAGE_SIZE });
    const [isLoading, setIsLoading] = useState(false);
    const [isAppending, setIsAppending] = useState(false);
    const [listError, setListError] = useState(null);
    const [resettingIds, setResettingIds] = useState(() => new Set());

    const loadRecentAnalyses = useCallback(async () => {
        setRecentLoading(true);
        setRecentError(null);
        try {
            const items = await fetchAdminLatestAnalysisReports({ size: RECENT_ANALYSIS_LIMIT });
            setRecentAnalyses(Array.isArray(items) ? items : []);
        } catch (err) {
            setRecentAnalyses([]);
            setRecentError(err);
        } finally {
            setRecentLoading(false);
        }
    }, []);

    const loadUsers = useCallback(
        async (nextPage = 0) => {
            const append = nextPage > 0;
            append ? setIsAppending(true) : setIsLoading(true);
            setListError(null);
            try {
                const data = await fetchAdminUsers({ page: nextPage, size: PAGE_SIZE, sort: "userNo,DESC" });
                const items = data?.items ?? [];
                setUserItems((prev) => {
                    if (!append) {
                        return items;
                    }
                    const existingIds = new Set(prev.map((item) => item.userNo));
                    const merged = [...prev];
                    items.forEach((item) => {
                        if (!existingIds.has(item.userNo)) {
                            merged.push(item);
                            existingIds.add(item.userNo);
                        }
                    });
                    return merged;
                });
                setPageMeta({
                    page: data?.page ?? nextPage,
                    totalPages: data?.totalPages ?? 0,
                    totalElements: data?.totalElements ?? items.length,
                    size: data?.size ?? PAGE_SIZE,
                });
            } catch (err) {
                setListError(err);
            } finally {
                append ? setIsAppending(false) : setIsLoading(false);
            }
        },
        []
    );

    const handleResetQuota = async (userNo) => {
        setResettingIds((prev) => new Set(prev).add(userNo));
        try {
            // API는 원시 userNo 값을 기대하므로 객체가 아닌 숫자를 전달합니다.
            await resetAdminUserQuota(userNo);
            setUserItems((prev) =>
                prev.map((item) =>
                    item.userNo === userNo
                        ? { ...item, monthlyQuotaUsed: 0, monthlyQuotaLimit: item.monthlyQuotaLimit ?? 0 }
                        : item
                )
            );
        } catch (error) {
            console.error("reset quota failed", error);
        } finally {
            setResettingIds((prev) => {
                const next = new Set(prev);
                next.delete(userNo);
                return next;
            });
        }
    };

    useEffect(() => {
        loadRecentAnalyses();
    }, [loadRecentAnalyses]);

    useEffect(() => {
        loadUsers(0);
    }, [loadUsers]);

    const stats = useMemo(() => {
        const items = userItems;
        const totalUsers = pageMeta.totalElements ?? items.length;
        const simulatedPrevDayUsers = Math.max(totalUsers - 2, 1);
        const growthRaw = totalUsers - simulatedPrevDayUsers;
        const growthPercent =
            simulatedPrevDayUsers > 0 ? (growthRaw / simulatedPrevDayUsers) * 100 : 0;

        const totalReports = analysisTrend.reduce((acc, point) => acc + point.value, 0);

        const avgUsage = (() => {
            if (!items.length) return 0;
            let ratioSum = 0;
            let counted = 0;
            items.forEach((item) => {
                const limit = item.monthlyQuotaLimit ?? 0;
                const used = item.monthlyQuotaUsed ?? 0;
                if (limit > 0) {
                    ratioSum += Math.min(used / limit, 1);
                    counted += 1;
                }
            });
            if (counted === 0) return 0;
            return Math.round((ratioSum / counted) * 100);
        })();

        return [
            {
                title: "총 가입 유저",
                value: totalUsers,
                icon: UserGroupIcon,
                footer: { type: "growth", percent: growthPercent },
            },
            {
                title: "주간 리포트 처리량",
                value: totalReports,
                icon: ChartPieIcon,
                footer: { type: "trend", data: analysisTrend },
            },
            {
                title: "평균 사용량",
                value: `${avgUsage}%`,
                icon: BoltIcon,
                footer: { type: "hint", text: "월별 할당량 대비" },
            },
            {
                title: "지원 요청 미해결",
                value: activityFeed.length,
                icon: ArrowTrendingUpIcon,
                footer: { type: "hint", text: "지난 24시간" },
            },
        ];
    }, [pageMeta.totalElements, userItems]);

    const pageClass =
        "min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100";
    const containerClass =
        "mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 md:px-10 md:py-16";
    const introTextClass = "max-w-3xl text-sm text-slate-600 md:text-base dark:text-slate-400";
    const statCardClass =
        "flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_32px_-24px_rgba(15,23,42,0.2)] transition hover:border-slate-400/60 hover:shadow-[0_20px_40px_-24px_rgba(15,23,42,0.25)] dark:border-slate-800/70 dark:bg-slate-900/70 dark:hover:border-slate-500/60";
    const sectionCardClass =
        "rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.16)] dark:border-slate-800/80 dark:bg-slate-900/60";
    const tableHeaderCellClass =
        "px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300";
    const tableBodyCellClass = "px-6 py-4 text-sm text-slate-600 dark:text-slate-300";
    const badgeClass =
        "rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200";
    const errorBannerClass =
        "rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200";

    const friendlyRecentError = recentError
        ? "최근 분석 데이터를 불러오지 못했습니다."
        : null;
    const recentErrorMessage =
        recentError?.message || recentError?.response?.data?.message || null;
    const listErrorMessage = listError?.message || listError?.response?.data?.message || null;

    return (
        <main className={pageClass}>
            <div className={containerClass}>
                <header className="flex flex-col gap-6">
                    <AdminPageTopBar lng={resolvedLng} currentLabel="운영 현황" />
                    <div className="flex flex-col gap-3">
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-500">
                            운영 현황 대시보드
                        </p>
                        <h1 className="text-3xl font-semibold md:text-4xl">서비스 모니터링</h1>
                        <p className={introTextClass}>
                            실시간 사용자 활동, 분석 처리량, 알림 로그를 확인하고 필요 시 우측 상단의 메일 발송 도구로
                            바로 이동해 사용자 커뮤니케이션을 이어갈 수 있습니다.
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                to={mailPath}
                                className="inline-flex items-center gap-2 rounded-full border border-sky-500 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 transition hover:border-sky-500 hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-sky-500/50 dark:bg-sky-500/10 dark:text-sky-100 dark:hover:border-sky-300 dark:hover:bg-sky-500/20 dark:focus-visible:ring-offset-slate-950"
                            >
                                <EnvelopeIcon className="h-5 w-5" />
                                사용자 메일 발송
                            </Link>
                        </div>
                    </div>
                </header>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((item) => (
                        <article key={item.title} className={statCardClass}>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500 dark:text-slate-400">{item.title}</span>
                                <item.icon className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                            </div>
                            <div className="text-3xl font-semibold tracking-tight">{item.value}</div>
                            <div className="mt-3 flex items-center justify-between gap-3">
                                {item.footer && item.footer.type === "growth" ? (
                                    <span
                                        className={clsx(
                                            "text-sm font-semibold",
                                            item.footer.percent >= 0 ? "text-emerald-500" : "text-rose-500"
                                        )}
                                    >
                                        전일 대비 {item.footer.percent >= 0 ? "+" : ""}
                                        {item.footer.percent.toFixed(1)}%
                                    </span>
                                ) : item.footer && item.footer.type === "trend" ? (
                                    <div className="flex flex-1 items-end gap-1 text-xs text-slate-500 dark:text-slate-400">
                                        {item.footer.data.map((point) => (
                                            <span
                                                key={point.label}
                                                className="flex-1 rounded bg-sky-500/20 py-2 text-center text-[0.7rem] font-medium text-sky-600 dark:bg-sky-500/20 dark:text-sky-200"
                                            >
                                                {point.value}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        {item.footer?.text ?? "실시간 집계"}
                                    </span>
                                )}
                            </div>
                        </article>
                    ))}
                </section>

                <section className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
                    <article className={sectionCardClass}>
                        <header className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                                    사용자 목록
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    최근 가입 순으로 정렬된 사용자입니다.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => loadUsers(0)}
                                className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white"
                            >
                                새로고침
                            </button>
                        </header>

                        {listError && (
                            <div className={`${errorBannerClass} mt-4`}>
                                데이터를 불러오지 못했습니다. {listErrorMessage ?? "잠시 후 다시 시도해 주세요."}
                            </div>
                        )}

                        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                            <div className="max-h-[480px] overflow-y-auto">
                                <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                                    <thead className="bg-slate-100/80 backdrop-blur dark:bg-slate-900/70">
                                        <tr>
                                            <th className={tableHeaderCellClass}>이메일</th>
                                            <th className={tableHeaderCellClass}>플랜</th>
                                            <th className={tableHeaderCellClass}>이번 달 사용량</th>
                                            <th className={tableHeaderCellClass}>가입일</th>
                                            <th className={tableHeaderCellClass}>조치</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                        {isLoading ? (
                                            Array.from({ length: 5 }).map((_, index) => (
                                                <tr key={`user-skeleton-${index}`}>
                                                    {Array.from({ length: 5 }).map((__, idx) => (
                                                        <td key={idx} className="px-6 py-4">
                                                            <div className="h-4 rounded bg-slate-200 dark:bg-slate-800" />
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))
                                        ) : userItems.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="px-6 py-6 text-center text-sm text-slate-500 dark:text-slate-400"
                                                >
                                                    표시할 사용자가 없습니다.
                                                </td>
                                            </tr>
                                        ) : (
                                            userItems.map((user) => {
                                                const quota = user.monthlyQuotaLimit ?? 0;
                                                const used = user.monthlyQuotaUsed ?? 0;
                                                const ratio = quota > 0 ? Math.min((used / quota) * 100, 100) : 0;
                                                return (
                                                    <tr key={user.userNo}>
                                                        <td className={tableBodyCellClass}>
                                                            <div className="font-medium text-slate-900 dark:text-slate-100">
                                                                {user.email || user.userId || "이메일 미상"}
                                                                <span className="ml-2 align-middle text-xs font-normal text-slate-500 dark:text-slate-400">#{user.userNo}</span>
                                                            </div>
                                                        </td>
                                                        <td className={tableBodyCellClass}>
                                                            <span className={badgeClass}>
                                                                {user.subscriptionPlan ?? "Free"}
                                                            </span>
                                                        </td>
                                                        <td className={tableBodyCellClass}>
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                                                    <span>{used}/{quota || "∞"}</span>
                                                                    <span>{ratio.toFixed(0)}%</span>
                                                                </div>
                                                                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                                                                    <div
                                                                        className="h-full rounded-full bg-emerald-500"
                                                                        style={{ width: `${ratio}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className={tableBodyCellClass}>
                                                            {user.createdAt
                                                                ? new Date(user.createdAt).toLocaleDateString()
                                                                : "—"}
                                                        </td>
                                                        <td className={tableBodyCellClass}>
                                                            <AdminUserActions
                                                                user={user}
                                                                onReset={handleResetQuota}
                                                                isResetting={resettingIds.has(user.userNo)}
                                                                mailPath={mailPath}
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {pageMeta.totalPages > 1 && (
                            <div className="mt-4 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => loadUsers((pageMeta.page ?? 0) + 1)}
                                    disabled={isAppending || (pageMeta.page ?? 0) >= (pageMeta.totalPages ?? 1) - 1}
                                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white"
                                >
                                    {isAppending ? "불러오는 중..." : "다음 페이지"}
                                </button>
                            </div>
                        )}
                    </article>

                    <aside className={sectionCardClass}>
                        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                                    최신 분석
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    전체 사용자 최신 {RECENT_ANALYSIS_LIMIT}건을 생성일 기준으로 정렬합니다.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={loadRecentAnalyses}
                                    disabled={recentLoading}
                                    className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900 disabled:cursor-wait disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white"
                                >
                                    {recentLoading ? "불러오는 중..." : "새로고침"}
                                </button>
                                <Link
                                    to={latestAnalysisPath}
                                    className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white dark:focus-visible:ring-slate-400 dark:focus-visible:ring-offset-slate-950"
                                >
                                    전체 보기
                                </Link>
                            </div>
                        </header>

                        {recentLoading ? (
                            <div className="mt-4 space-y-3">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <div
                                        key={`recent-skeleton-${index}`}
                                        className="rounded-2xl border border-slate-200 bg-slate-100 p-4 dark:border-slate-800 dark:bg-slate-900/50"
                                    >
                                        <div className="h-4 rounded bg-slate-200 dark:bg-slate-800" />
                                        <div className="mt-2 h-3 rounded bg-slate-200 dark:bg-slate-800" />
                                    </div>
                                ))}
                            </div>
                        ) : recentError ? (
                            <div className={`${errorBannerClass} mt-4`}>
                                <p className="font-medium">{friendlyRecentError}</p>
                                {recentErrorMessage && <p className="mt-1 text-xs">상세: {recentErrorMessage}</p>}
                            </div>
                        ) : (
                            <div className="mt-4 space-y-3">
                                {recentAnalyses.length === 0 ? (
                                    <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-100 px-4 py-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
                                        최근 분석 기록이 없습니다.
                                    </p>
                                ) : (
                                    recentAnalyses.map((analysis) => (
                                        <article
                                            key={analysis.reportId ?? analysis.id ?? analysis.createdAt}
                                            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
                                        >
                                            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                {analysis.projectName ?? "이름 미상"}
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {analysis.modelName ?? analysis.modelVersion ?? "모델 정보 없음"}
                                            </p>
                                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                                                {analysis.summary ?? "요약 정보가 없습니다."}
                                            </p>
                                            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                                {analysis.createdAt
                                                    ? new Date(analysis.createdAt).toLocaleString()
                                                    : "—"}
                                            </p>
                                        </article>
                                    ))
                                )}
                            </div>
                        )}
                    </aside>
                </section>

                <section className={sectionCardClass}>
                    <header className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">활동 피드</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                운영 이벤트와 경고를 실시간으로 확인하세요.
                            </p>
                        </div>
                    </header>
                    <div className="mt-4 space-y-3">
                        {activityFeed.map((item) => (
                            <article
                                key={item.id}
                                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
                            >
                                <div className="flex items-center justify-between">
                                    <span
                                        className={clsx(
                                            "rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider",
                                            item.severity === "warning" && "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-200",
                                            item.severity === "info" && "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-200",
                                            item.severity === "notice" && "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-200"
                                        )}
                                    >
                                        {item.severity.toUpperCase()}
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">{item.time}</span>
                                </div>
                                <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-300">{item.detail}</p>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
};

export default AdminPreview;
