import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import {
    UserGroupIcon,
    ChartPieIcon,
    BoltIcon,
    ArrowTrendingUpIcon,
    MoonIcon,
    SunIcon,
    EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { fetchAdminLatestAnalysisReports, fetchAdminUsers, resetAdminUserQuota } from "../api/admin";

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
    const [isDarkMode, setIsDarkMode] = useState(true);
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

    const loadUsers = useCallback(async (nextPage = 0) => {
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
            setPageMeta((prev) => ({
                page: data?.page ?? nextPage,
                totalPages: data?.totalPages ?? prev.totalPages,
                totalElements: data?.totalElements ?? prev.totalElements,
                size: data?.size ?? prev.size,
            }));
        } catch (err) {
            setListError(err);
        } finally {
            append ? setIsAppending(false) : setIsLoading(false);
        }
    }, []);

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
                footer: { type: 'growth', percent: growthPercent },
            },
            {
                title: "금주 분석 처리량",
                value: totalReports.toLocaleString(),
                icon: ChartPieIcon,
                footer: "일 평균 420건",
            },
            {
                title: "평균 사용률",
                value: `${avgUsage}%`,
                icon: ArrowTrendingUpIcon,
                footer: "Starter 기준 40% 사용",
            },
            {
                title: "실험 기능 활성",
                value: "13개 조직",
                icon: BoltIcon,
                footer: "Heatmap Lab 베타 운영 중",
            },
        ];
    }, [userItems, pageMeta.totalElements]);

    const userSummaries = userItems;
    const errorMessage = listError ? (listError?.response?.data?.message ?? listError.message ?? "사용자 정보를 불러오지 못했습니다.") : null;
    const recentErrorMessage = recentError ? (recentError?.response?.data?.message ?? recentError.message ?? "최신 분석 정보를 불러오지 못했습니다.") : null;
    const hasMore = pageMeta.page + 1 < pageMeta.totalPages;

    const handleLoadMore = useCallback(() => {
        if (isAppending || isLoading || !hasMore) {
            return;
        }
        const nextPage = (pageMeta.page >= 0 ? pageMeta.page + 1 : 0);
        loadUsers(nextPage);
    }, [hasMore, isAppending, isLoading, loadUsers, pageMeta.page]);

    const handleResetUsage = useCallback(async (userNo) => {
        setResettingIds((prev) => {
            const next = new Set(prev);
            next.add(userNo);
            return next;
        });
        try {
            await resetAdminUserQuota(userNo);
            setUserItems((prev) => prev.map((item) => {
                if (item.userNo !== userNo) {
                    return item;
                }
                const limit = item.monthlyQuotaLimit ?? 0;
                return {
                    ...item,
                    monthlyQuotaUsed: 0,
                    monthlyQuotaRemaining: limit,
                };
            }));
        } catch (err) {
            console.error("Failed to reset monthly usage", err);
        } finally {
            setResettingIds((prev) => {
                const next = new Set(prev);
                next.delete(userNo);
                return next;
            });
        }
    }, []);

    const formatDateTime = (value) => {
        if (!value) return "—";
        try {
            return new Intl.DateTimeFormat(i18n.language || "ko", {
                dateStyle: "medium",
                timeStyle: "short",
            }).format(new Date(value));
        } catch (err) {
            return value;
        }
    };

    const friendlyRecentError = useMemo(() => {
        if (!recentError) return null;
        return "최신 분석 데이터를 불러오지 못했어요. 서버 연결 상태를 확인한 뒤 다시 시도해 주세요.";
    }, [recentError]);

    const formatScore = (score) => {
        if (score == null) return "—";
        const numeric =
            typeof score === "number"
                ? score
                : Number.isNaN(Number(score))
                ? null
                : Number(score);
        if (numeric == null || !Number.isFinite(numeric)) {
            return String(score);
        }
        return numeric.toFixed(3);
    };

    const formatInference = (value) => {
        if (value == null) return "—";
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) {
            return String(value);
        }
        return `${numeric.toLocaleString()} ms`;
    };

    const surfaceClass = isDarkMode
        ? "bg-slate-900/70 border-slate-800 shadow-slate-950/30"
        : "bg-white border-slate-200 shadow-slate-900/5";
    const subtleSurface = isDarkMode
        ? "bg-slate-900/60 border-slate-800"
        : "bg-slate-50 border-slate-200";
    const tableStripe = isDarkMode ? "odd:bg-slate-900/40" : "odd:bg-slate-50";
    const barTrack = isDarkMode ? "bg-slate-800" : "bg-slate-200";
    const barFill = isDarkMode
        ? "bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-300"
        : "bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-300";

    const severityAccent = (severity) => {
        switch (severity) {
            case "warning":
                return isDarkMode ? "text-amber-300" : "text-amber-600";
            case "notice":
                return isDarkMode ? "text-sky-300" : "text-sky-600";
            default:
                return isDarkMode ? "text-slate-300" : "text-slate-600";
        }
    };

    const trendMax = Math.max(
        ...analysisTrend.map((item) => item.value),
        1
    );

    return (
        <main
            className={clsx(
                "min-h-screen transition-colors duration-300",
                isDarkMode
                    ? "bg-slate-950 text-slate-50"
                    : "bg-slate-100 text-slate-900"
            )}
        >
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 md:px-8">
                <header
                    className={clsx(
                        "flex flex-wrap items-center justify-between gap-4 rounded-3xl border px-6 py-5",
                        surfaceClass
                    )}
                >
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-slate-400">
                            <span>Console</span>
                            <span className="opacity-60">Admin</span>
                        </div>
                        <h1 className="text-2xl font-semibold md:text-3xl">
                            플랫폼 운영 대시보드
                        </h1>
                        <p
                            className={clsx(
                                "text-sm",
                                isDarkMode ? "text-slate-300" : "text-slate-600"
                            )}
                        >
                            실시간 사용자 활동, 분석 처리량, 알림 로그를 확인하고 필요 시 우측 상단의
                            메일 발송 도구로 바로 이동해 사용자 커뮤니케이션을 이어갈 수 있습니다.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            to={mailPath}
                            className={clsx(
                                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition",
                                isDarkMode
                                    ? "border-sky-500/50 bg-sky-500/10 text-sky-100 hover:border-sky-300 hover:bg-sky-500/20"
                                    : "border-sky-500/50 bg-sky-50 text-sky-700 hover:border-sky-500 hover:bg-sky-100"
                            )}
                        >
                            <EnvelopeIcon className="h-5 w-5" />
                            사용자 메일 발송
                        </Link>
                        <button
                            type="button"
                            onClick={() => setIsDarkMode((prev) => !prev)}
                            className={clsx(
                                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition",
                                isDarkMode
                                    ? "border-slate-700 bg-slate-900/80 hover:border-slate-500 hover:bg-slate-800"
                                    : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50"
                            )}
                        >
                            {isDarkMode ? (
                                <>
                                    <SunIcon className="h-5 w-5 text-amber-400" />
                                    라이트 모드
                                </>
                            ) : (
                                <>
                                    <MoonIcon className="h-5 w-5 text-slate-600" />
                                    다크 모드
                                </>
                            )}
                        </button>
                    </div>
                </header>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {stats.map((item) => (
                        <article
                            key={item.title}
                            className={clsx(
                                "flex flex-col gap-4 rounded-2xl border p-6 transition",
                                surfaceClass
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <span
                                    className={clsx(
                                        "text-sm",
                                        isDarkMode
                                            ? "text-slate-400"
                                            : "text-slate-500"
                                    )}
                                >
                                    {item.title}
                                </span>
                                <item.icon
                                    className={clsx(
                                        "h-6 w-6",
                                        isDarkMode
                                            ? "text-slate-400"
                                            : "text-slate-500"
                                    )}
                                />
                            </div>
                            <div className="text-3xl font-semibold tracking-tight">
                                {item.value}
                            </div>
                            <div className="mt-4 flex items-center justify-between gap-3">
                                {item.footer && item.footer.type === 'growth' ? (
                                    <span
                                        className={clsx(
                                            "font-display text-base font-semibold tracking-tight",
                                            item.footer.percent >= 0
                                                ? "text-[color:var(--brand)]"
                                                : "text-rose-500"
                                        )}
                                    >
                                        전일 대비 {item.footer.percent >= 0 ? '+' : ''}{item.footer.percent.toFixed(1)}%
                                    </span>
                                ) : (
                                    <span
                                        className={clsx(
                                            "text-xs",
                                            isDarkMode
                                                ? "text-slate-400"
                                                : "text-slate-500"
                                        )}
                                    >
                                        {item.footer}
                                    </span>
                                )}
                                <button
                                    type="button"
                                    className={clsx(
                                        "rounded-full border px-3 py-1 text-xs font-medium transition",
                                        isDarkMode
                                            ? "border-slate-700 text-slate-200 hover:border-slate-500 hover:text-white"
                                            : "border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-800"
                                    )}
                                >
                                    상세 관리
                                </button>
                            </div>
                        </article>
                    ))}
                </section>

                <section className="grid gap-6 xl:grid-cols-[2fr,1fr]">
                    <div className="flex flex-col gap-6">
                        <article
                            className={clsx(
                                "rounded-2xl border p-6",
                                surfaceClass
                            )}
                        >
                            <header className="flex flex-wrap items-start justify-between gap-3 border-b pb-4">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-base font-semibold md:text-lg">
                                        최신 분석
                                    </h2>
                                    <p
                                        className={clsx(
                                            "text-xs",
                                            isDarkMode
                                                ? "text-slate-400"
                                                : "text-slate-500"
                                        )}
                                    >
                                        전체 사용자 최신 {RECENT_ANALYSIS_LIMIT}건을 생성일 기준으로 정렬합니다.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={loadRecentAnalyses}
                                    disabled={recentLoading}
                                    className={clsx(
                                        "rounded-full border px-3 py-1 text-xs font-medium transition",
                                        isDarkMode
                                            ? "border-slate-700 text-slate-200 hover:border-slate-500 hover:text-white"
                                            : "border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-800",
                                        recentLoading && "opacity-60"
                                    )}
                                >
                                    {recentLoading ? "불러오는 중..." : "새로고침"}
                                </button>
                            </header>
                            <div className="mt-4 space-y-4">
                                {recentLoading ? (
                                    <div
                                        className={clsx(
                                            "rounded-xl border px-4 py-6 text-sm",
                                            subtleSurface,
                                            isDarkMode ? "text-slate-300" : "text-slate-600"
                                        )}
                                    >
                                        최신 분석을 불러오는 중입니다...
                                    </div>
                                ) : recentError ? (
                                    <div
                                        className={clsx(
                                            "rounded-xl border px-4 py-6 text-sm",
                                            subtleSurface
                                        )}
                                    >
                                        <p
                                            className={clsx(
                                                "font-medium",
                                                isDarkMode ? "text-rose-300" : "text-rose-600"
                                            )}
                                        >
                                            {friendlyRecentError}
                                        </p>
                                        {recentErrorMessage && (
                                            <p
                                                className={clsx(
                                                    "mt-1 text-xs",
                                                    isDarkMode
                                                        ? "text-slate-400"
                                                        : "text-slate-500"
                                                )}
                                            >
                                                상세: {recentErrorMessage}
                                            </p>
                                        )}
                                        <div className="pt-2">
                                            <button
                                                type="button"
                                                onClick={loadRecentAnalyses}
                                                className={clsx(
                                                    "rounded-full border px-3 py-1 text-xs font-medium transition",
                                                    isDarkMode
                                                        ? "border-slate-600 text-slate-200 hover:border-slate-400 hover:text-white"
                                                        : "border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-800"
                                                )}
                                            >
                                                다시 시도
                                            </button>
                                        </div>
                                    </div>
                                ) : recentAnalyses.length === 0 ? (
                                    <div
                                        className={clsx(
                                            "rounded-xl border px-4 py-6 text-sm",
                                            subtleSurface,
                                            isDarkMode ? "text-slate-300" : "text-slate-600"
                                        )}
                                    >
                                        아직 표시할 분석이 없습니다.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y text-xs sm:text-sm">
                                            <thead
                                                className={clsx(
                                                    isDarkMode
                                                        ? "bg-slate-900/60 text-slate-300"
                                                        : "bg-slate-100 text-slate-600"
                                                )}
                                            >
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-medium sm:px-6">
                                                        사용자
                                                    </th>
                                                    <th className="px-4 py-3 text-left font-medium sm:px-6">
                                                        라벨
                                                    </th>
                                                    <th className="px-4 py-3 text-left font-medium sm:px-6">
                                                        점수
                                                    </th>
                                                    <th className="px-4 py-3 text-left font-medium sm:px-6">
                                                        모델 버전
                                                    </th>
                                                    <th className="px-4 py-3 text-left font-medium sm:px-6">
                                                        추론 시간
                                                    </th>
                                                    <th className="px-4 py-3 text-left font-medium sm:px-6">
                                                        생성 시각
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody
                                                className={clsx(
                                                    isDarkMode
                                                        ? "divide-y divide-slate-800"
                                                        : "divide-y divide-slate-200"
                                                )}
                                            >
                                                {recentAnalyses.map((item, index) => {
                                                    const userLabel =
                                                        item.nickname ||
                                                        item.userId ||
                                                        (item.userNo != null
                                                            ? `사용자 #${item.userNo}`
                                                            : "알 수 없음");
                                                    const secondaryId =
                                                        item.nickname &&
                                                        item.userId &&
                                                        item.nickname !== item.userId
                                                            ? item.userId
                                                            : null;
                                                    return (
                                                        <tr
                                                            key={
                                                                item.uploadId ??
                                                                `analysis-${item.userNo ?? "unknown"}-${index}`
                                                            }
                                                            className={clsx(
                                                                "align-top transition-colors",
                                                                isDarkMode
                                                                    ? "hover:bg-slate-900/50"
                                                                    : "hover:bg-slate-50"
                                                            )}
                                                        >
                                                            <td className="px-4 py-3 sm:px-6">
                                                                <div className="flex flex-col">
                                                                    <span className="font-semibold">
                                                                        {userLabel}
                                                                    </span>
                                                                    {secondaryId && (
                                                                        <span
                                                                            className={clsx(
                                                                                "text-[11px]",
                                                                                isDarkMode
                                                                                    ? "text-slate-500"
                                                                                    : "text-slate-500"
                                                                            )}
                                                                        >
                                                                            {secondaryId}
                                                                        </span>
                                                                    )}
                                                                    {item.uploadId && (
                                                                        <span
                                                                            className={clsx(
                                                                                "text-[11px]",
                                                                                isDarkMode
                                                                                    ? "text-slate-500"
                                                                                    : "text-slate-500"
                                                                            )}
                                                                        >
                                                                            #{item.uploadId}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 sm:px-6">
                                                                {item.label ?? "—"}
                                                            </td>
                                                            <td className="px-4 py-3 sm:px-6">
                                                                {formatScore(item.score)}
                                                            </td>
                                                            <td className="px-4 py-3 sm:px-6">
                                                                {item.modelVersion ?? "—"}
                                                            </td>
                                                            <td className="px-4 py-3 sm:px-6">
                                                                {formatInference(item.inferenceTimeMs)}
                                                            </td>
                                                            <td className="px-4 py-3 sm:px-6">
                                                                {formatDateTime(item.createdAt)}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </article>
                        <article
                            className={clsx(
                                "rounded-2xl border",
                                surfaceClass
                            )}
                        >
                            <header className="border-b px-6 py-4 text-sm">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-base font-semibold md:text-lg">
                                        사용자 계정 현황
                                    </h2>
                                    <p
                                        className={clsx(
                                            "text-xs",
                                            isDarkMode
                                                ? "text-slate-400"
                                                : "text-slate-500"
                                        )}
                                    >
                                        월간 사용량과 최근 분석 시각을 확인할 수 있습니다.
                                    </p>
                                </div>
                            </header>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y text-sm">
                                <thead
                                    className={clsx(
                                        isDarkMode
                                            ? "bg-slate-900/80 text-slate-300"
                                            : "bg-slate-100 text-slate-600"
                                    )}
                                >
                                    <tr>
                                        <th className="px-6 py-3 text-left font-medium">사용자</th>
                                        <th className="px-6 py-3 text-left font-medium">로그인</th>
                                        <th className="px-6 py-3 text-left font-medium">최근 분석</th>
                                        <th className="px-6 py-3 text-left font-medium">월간 사용량</th>
                                        <th className="px-6 py-3 text-left font-medium">계정 상태</th>
                                    </tr>
                                </thead>
                                <tbody className={clsx(tableStripe)}>
                                    {isLoading && userSummaries.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                                                사용자 정보를 불러오는 중입니다...
                                            </td>
                                        </tr>
                                    )}
                                    {errorMessage && !isLoading && userSummaries.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-6 text-center text-sm text-rose-500">
                                                {errorMessage}
                                            </td>
                                        </tr>
                                    )}
                                    {!isLoading && !errorMessage && userSummaries.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                                                표시할 사용자가 없습니다.
                                            </td>
                                        </tr>
                                    )}
                                    {!isLoading && userSummaries.length > 0 && userSummaries.map((user) => {
                                        const limit = user.monthlyQuotaLimit ?? 0;
                                        const used = user.monthlyQuotaUsed ?? 0;
                                        const percent = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
                                        const loginLabel = user.loginType ? user.loginType : "-";
                                        const limitDisplay = limit > 0 ? limit.toLocaleString() : "—";
                                        const isResetting = resettingIds.has(user.userNo);
                                        return (
                                            <tr
                                                key={user.userNo}
                                                className={clsx(
                                                    "border-b transition-colors",
                                                    isDarkMode
                                                        ? "border-slate-800 hover:bg-slate-900/60"
                                                        : "border-slate-200 hover:bg-slate-100"
                                                )}
                                            >
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">
                                                            {user.nickname || user.userId}
                                                        </span>
                                                        <span
                                                            className={clsx(
                                                                "text-xs",
                                                                isDarkMode
                                                                    ? "text-slate-400"
                                                                    : "text-slate-500"
                                                            )}
                                                        >
                                                            {user.userId}
                                                        </span>
                                                        <span
                                                            className={clsx(
                                                                "text-xs",
                                                                isDarkMode
                                                                    ? "text-slate-500"
                                                                    : "text-slate-600"
                                                            )}
                                                        >
                                                            {user.emailVerified ? "이메일 인증 완료" : "이메일 인증 필요"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={clsx(
                                                            "rounded-full border px-3 py-1 text-xs font-medium",
                                                            isDarkMode
                                                                ? "border-slate-700 text-slate-200"
                                                                : "border-slate-300 text-slate-600"
                                                        )}
                                                        style={{ whiteSpace: "nowrap" }}
                                                    >
                                                        {loginLabel}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={clsx(
                                                            "text-sm",
                                                            isDarkMode
                                                                ? "text-slate-300"
                                                                : "text-slate-600"
                                                        )}
                                                    >
                                                        {formatDateTime(user.lastAnalysisAt)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span
                                                                className={clsx(
                                                                    isDarkMode
                                                                        ? "text-slate-300"
                                                                        : "text-slate-600"
                                                                )}
                                                            >
                                                                {used.toLocaleString()}
                                                            </span>
                                                            <span
                                                                className={clsx(
                                                                    isDarkMode
                                                                        ? "text-slate-500"
                                                                        : "text-slate-500"
                                                                )}
                                                            >
                                                                / {limitDisplay}
                                                            </span>
                                                        </div>
                                                        <div
                                                            className={clsx(
                                                                "h-1.5 w-full overflow-hidden rounded-full",
                                                                barTrack
                                                            )}
                                                        >
                                                            <div
                                                                className={clsx(
                                                                    "h-full rounded-full transition-all duration-500",
                                                                    barFill
                                                                )}
                                                                style={{ width: `${percent}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleResetUsage(user.userNo)}
                                                        disabled={isResetting}
                                                        className={clsx(
                                                            "rounded-full border px-3 py-1 text-xs font-medium transition",
                                                            isDarkMode
                                                                ? "border-slate-700 text-slate-200 hover:border-slate-500 hover:text-white"
                                                                : "border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-800",
                                                            isResetting && "opacity-60"
                                                        )}
                                                        style={{ whiteSpace: "nowrap" }}
                                                    >
                                                        {isResetting ? "초기화 중..." : "사용량 초기화"}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {hasMore && (
                            <div className={clsx(
                                    "border-t px-6 py-4 text-center",
                                    isDarkMode ? "border-slate-800/40" : "border-slate-200"
                            )}>
                                <button
                                    type="button"
                                    onClick={handleLoadMore}
                                    disabled={isAppending}
                                    className={clsx(
                                        "inline-flex items-center justify-center rounded-full px-4 py-1.5 text-sm font-medium transition",
                                        isDarkMode
                                            ? "border border-slate-700 text-slate-200 hover:border-slate-500 hover:text-white"
                                            : "border border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-800",
                                        isAppending && "opacity-70"
                                    )}
                                >
                                    {isAppending ? "불러오는 중..." : "더 보기"}
                                </button>
                            </div>
                        )}
                    </article>
                    </div>

                    <aside
                        className={clsx(
                            "flex h-full flex-col gap-6 rounded-2xl border p-6",
                            surfaceClass
                        )}
                    >
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-semibold">
                                    분석 트렌드
                                </h3>
                                <span
                                    className={clsx(
                                        "text-xs",
                                        isDarkMode
                                            ? "text-slate-400"
                                            : "text-slate-500"
                                    )}
                                >
                                    지난 5일
                                </span>
                            </div>
                            <div className="space-y-3">
                                {analysisTrend.map((item) => (
                                    <div
                                        key={item.label}
                                        className="flex items-center gap-3"
                                    >
                                        <span className="w-8 shrink-0 text-xs font-medium">
                                            {item.label}
                                        </span>
                                        <div className="flex-1">
                                            <div
                                                className={clsx(
                                                    "h-2 rounded-full",
                                                    barTrack
                                                )}
                                            >
                                                <div
                                                    className={clsx(
                                                        "h-full rounded-full transition-all",
                                                        barFill
                                                    )}
                                                    style={{
                                                        width: `${Math.round(
                                                            (item.value /
                                                                trendMax) *
                                                                100
                                                        )}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <span
                                            className={clsx(
                                                "w-12 text-right text-xs",
                                                isDarkMode
                                                    ? "text-slate-400"
                                                    : "text-slate-600"
                                            )}
                                        >
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-semibold">
                                    운영 알림
                                </h3>
                                <button
                                    type="button"
                                    className={clsx(
                                        "text-xs underline-offset-4 transition hover:underline",
                                        isDarkMode
                                            ? "text-slate-300"
                                            : "text-slate-600"
                                    )}
                                >
                                    전체 보기
                                </button>
                            </div>
                            <ul className="space-y-4 text-sm">
                                {activityFeed.map((item) => (
                                    <li
                                        key={item.id}
                                        className={clsx(
                                            "rounded-xl border px-4 py-3",
                                            subtleSurface
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium uppercase tracking-widest">
                                                {item.id}
                                            </span>
                                            <span
                                                className={clsx(
                                                    "text-[11px]",
                                                    isDarkMode
                                                        ? "text-slate-500"
                                                        : "text-slate-500"
                                                )}
                                            >
                                                {item.time}
                                            </span>
                                        </div>
                                        <p
                                            className={clsx(
                                                "mt-2 flex items-center gap-2 text-sm font-semibold",
                                                severityAccent(item.severity)
                                            )}
                                        >
                                            {item.title}
                                        </p>
                                        <p
                                            className={clsx(
                                                "mt-1 text-xs leading-relaxed",
                                                isDarkMode
                                                    ? "text-slate-300"
                                                    : "text-slate-600"
                                            )}
                                        >
                                            {item.detail}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>
                </section>
            </div>
        </main>
    );
};

export default AdminPreview;
