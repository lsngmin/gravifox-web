import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import {
    UserGroupIcon,
    ChartPieIcon,
    BoltIcon,
    ArrowTrendingUpIcon,
    MoonIcon,
    SunIcon,
    ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { fetchAdminUsers } from "../api/admin";

const SERVICE_TRACKS = [
    { key: "backend", label: "백엔드 API" },
    { key: "ai", label: "AI 추론 서버" },
    { key: "queue", label: "메시지 큐" },
];

const describeIssue = (serviceKey, state) => {
    if (state === "operational") {
        return "이슈 없음";
    }
    if (state === "degraded") {
        switch (serviceKey) {
            case "backend":
                return "API 응답 지연 감지";
            case "ai":
                return "추론 대기열 증가";
            case "queue":
                return "큐 처리 속도 저하";
            default:
                return "성능 저하 감지";
        }
    }
    if (state === "maintenance") {
        switch (serviceKey) {
            case "backend":
                return "정기 배포 및 캐시 재구성";
            case "ai":
                return "모델 업데이트/가중치 재적재";
            case "queue":
                return "브로커 클러스터 점검";
            default:
                return "점검 진행 중";
        }
    }
    return "상태 정보 없음";
};

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

const AdminPreview = () => {
    const { i18n } = useTranslation();
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [hoveredEntry, setHoveredEntry] = useState(null);
    const [userItems, setUserItems] = useState([]);
    const [pageMeta, setPageMeta] = useState({ page: -1, totalPages: 0, totalElements: 0, size: PAGE_SIZE });
    const [isLoading, setIsLoading] = useState(false);
    const [isAppending, setIsAppending] = useState(false);
    const [error, setError] = useState(null);

    const loadUsers = useCallback(async (nextPage = 0) => {
        const append = nextPage > 0;
        append ? setIsAppending(true) : setIsLoading(true);
        setError(null);
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
            setError(err);
        } finally {
            append ? setIsAppending(false) : setIsLoading(false);
        }
    }, []);

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
    const errorMessage = error ? (error?.response?.data?.message ?? error.message ?? "사용자 정보를 불러오지 못했습니다.") : null;
    const hasMore = pageMeta.page + 1 < pageMeta.totalPages;

    const handleLoadMore = useCallback(() => {
        if (isAppending || isLoading || !hasMore) {
            return;
        }
        const nextPage = (pageMeta.page >= 0 ? pageMeta.page + 1 : 0);
        loadUsers(nextPage);
    }, [hasMore, isAppending, isLoading, loadUsers, pageMeta.page]);

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

    const resolveStatus = (item) => {
        if (!item?.emailVerified) {
            return { label: "인증 필요", tone: "warning" };
        }
        if (item?.monthlyQuotaRemaining != null && item?.monthlyQuotaRemaining <= 0) {
            return { label: "한도 초과", tone: "danger" };
        }
        return { label: "정상", tone: "success" };
    };

    const statusTimeline = useMemo(() => {
        const totalDays = 30;
        const anchor = new Date();
        anchor.setHours(0, 0, 0, 0);
        const entries = [];
        for (let offset = totalDays - 1; offset >= 0; offset--) {
            const date = new Date(anchor);
            date.setDate(anchor.getDate() - offset);
            const weekday = date.getDay();
            const dayIndex = totalDays - 1 - offset;

            const states = {};
            const issues = {};

            SERVICE_TRACKS.forEach((track, trackIndex) => {
                let state = "operational";
                const seed = (dayIndex + 1) * (trackIndex + 3);
                if (seed % 17 === 0 || (weekday === 0 && track.key === "queue")) {
                    state = "maintenance";
                } else if (
                    seed % 9 === 0 ||
                    (weekday === 2 && track.key === "ai") ||
                    (weekday === 3 && track.key === "backend" && seed % 5 === 0)
                ) {
                    state = "degraded";
                }

                states[track.key] = state;
                issues[track.key] = describeIssue(track.key, state);
            });

            entries.push({
                key: date.toISOString().slice(0, 10),
                date,
                states,
                issues,
            });
        }
        return entries;
    }, []);

    useEffect(() => {
        if (statusTimeline.length) {
            setHoveredEntry(statusTimeline[statusTimeline.length - 1]);
        }
    }, [statusTimeline]);

    const formatFullDate = (date) => {
        try {
            return new Intl.DateTimeFormat(i18n.language || "ko", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                weekday: "short",
            }).format(date);
        } catch (e) {
            const pad = (num) => num.toString().padStart(2, "0");
            const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
            return `${date.getFullYear()}-${pad(
                date.getMonth() + 1
            )}-${pad(date.getDate())} (${weekdays[date.getDay()]})`;
        }
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

    const colorForState = (state) => {
        switch (state) {
            case "operational":
                return isDarkMode
                    ? "bg-emerald-400/80"
                    : "bg-emerald-400";
            case "degraded":
                return isDarkMode
                    ? "bg-amber-400/80"
                    : "bg-amber-400";
            default:
                return isDarkMode
                    ? "bg-rose-400/80"
                    : "bg-rose-400";
        }
    };

    const labelForState = (state) => {
        switch (state) {
            case "operational":
                return "정상 운영";
            case "degraded":
                return "지연/부분 장애";
            default:
                return "점검 진행";
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
                            실시간 사용자 활동, 분석 처리량, 알림 로그를 한
                            화면에서 파악할 수 있는 미리보기입니다.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
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

                <section
                    className={clsx(
                        "rounded-2xl border px-6 py-5",
                        surfaceClass
                    )}
                >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
                            <span
                                className={clsx(
                                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs",
                                    isDarkMode
                                        ? "border-emerald-500/30 bg-emerald-400/10 text-emerald-200"
                                        : "border-emerald-200 bg-emerald-50 text-emerald-700"
                                )}
                            >
                                <ShieldCheckIcon className="h-5 w-5" />
                                운영 상태
                            </span>
                        </div>
                    </div>

                    <div className="mt-3 flex flex-col">
                        {SERVICE_TRACKS.map((track, index) => (
                            <div
                                key={track.key}
                                className={clsx(
                                    "flex flex-col gap-2 py-4",
                                    index > 0
                                        ? isDarkMode
                                            ? "border-t border-slate-800"
                                            : "border-t border-slate-200"
                                        : null
                                )}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <span
                                        className={clsx(
                                            "text-sm font-semibold tracking-wide",
                                            isDarkMode ? "text-slate-200" : "text-slate-600"
                                        )}
                                    >
                                        {track.label}
                                    </span>
                                </div>
                                <div
                                    className={clsx(
                                        "grid h-12 grid-flow-col auto-cols-fr items-end gap-2",
                                        isDarkMode ? "" : ""
                                    )}
                                    role="list"
                                >
                                    {statusTimeline.map((entry) => {
                                        const state = entry.states[track.key];
                                        const issue = entry.issues[track.key];
                                        const isActive = hoveredEntry?.key === entry.key;
                                        return (
                                            <div
                                                key={`${track.key}-${entry.key}`}
                                                role="button"
                                                tabIndex={0}
                                                onMouseEnter={() => setHoveredEntry(entry)}
                                                onFocus={() => setHoveredEntry(entry)}
                                                className={clsx(
                                                    "h-full w-full rounded-md transition-all duration-150",
                                                    colorForState(state),
                                                    "hover:outline hover:outline-2 hover:outline-offset-1",
                                                    isDarkMode
                                                        ? "hover:outline-slate-100/40"
                                                        : "hover:outline-slate-900/40",
                                                    isActive
                                                        ? isDarkMode
                                                            ? "outline outline-2 outline-offset-2 outline-cyan-300/60"
                                                            : "outline outline-2 outline-offset-2 outline-cyan-500/60"
                                                        : null
                                                )}
                                                title={`${formatFullDate(entry.date)} · ${track.label} · ${labelForState(state)} (${issue})`}
                                                aria-label={`${formatFullDate(entry.date)} ${track.label} ${labelForState(state)}`}
                                            />
                                        );
                                    })}
                                </div>
                                <div
                                    className={clsx(
                                        "flex justify-between text-[10px] uppercase tracking-widest",
                                        isDarkMode ? "text-slate-500" : "text-slate-500"
                                    )}
                                >
                                    <span>30일 전</span>
                                    <span>오늘</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div
                        className={clsx(
                            "mt-4 rounded-xl border px-4 py-3 text-sm",
                            isDarkMode
                                ? "border-slate-700 bg-slate-900/70"
                                : "border-slate-200 bg-slate-50"
                        )}
                    >
                        {hoveredEntry ? (
                            <div className="flex flex-col gap-2">
                                <p
                                    className={clsx(
                                        "text-sm font-semibold",
                                        isDarkMode ? "text-slate-200" : "text-slate-700"
                                    )}
                                >
                                    {formatFullDate(hoveredEntry.date)} 기준
                                </p>
                                <ul className="space-y-1 text-xs">
                                    {SERVICE_TRACKS.map((track) => {
                                        const state = hoveredEntry.states[track.key];
                                        const issue = hoveredEntry.issues[track.key];
                                        return (
                                            <li
                                                key={`${hoveredEntry.key}-${track.key}`}
                                                className="flex items-center justify-between gap-4"
                                            >
                                                <span
                                                    className={clsx(
                                                        "font-medium",
                                                        isDarkMode ? "text-slate-300" : "text-slate-600"
                                                    )}
                                                >
                                                    {track.label}
                                                </span>
                                                <span
                                                    className={clsx(
                                                        "text-right",
                                                        state === "operational"
                                                            ? isDarkMode
                                                                ? "text-emerald-300"
                                                                : "text-emerald-600"
                                                            : state === "degraded"
                                                            ? isDarkMode
                                                                ? "text-amber-300"
                                                                : "text-amber-600"
                                                            : isDarkMode
                                                            ? "text-rose-300"
                                                            : "text-rose-600"
                                                    )}
                                                >
                                                    {labelForState(state)} · {issue}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ) : (
                            <p className={clsx(
                                "text-sm",
                                isDarkMode ? "text-slate-400" : "text-slate-600"
                            )}>
                                상태 막대를 호버하면 날짜별 이슈 요약을 확인할 수 있습니다.
                            </p>
                        )}
                    </div>
                </section>

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
                    <article
                        className={clsx(
                            "rounded-2xl border",
                            surfaceClass
                        )}
                    >
                        <header className="flex items-center justify-between border-b px-6 py-4 text-sm">
                            <div className="flex flex-col gap-1">
                                <h2 className="font-semibold text-base md:text-lg">
                                    사용자 계정 현황 (샘플 데이터)
                                </h2>
                                <p
                                    className={clsx(
                                        "text-xs",
                                        isDarkMode
                                            ? "text-slate-400"
                                            : "text-slate-500"
                                    )}
                                >
                                    역할/요금제에 따라 테이블 컬럼을 확장하여
                                    운영 정책을 구성할 수 있습니다.
                                </p>
                            </div>
                            <button
                                type="button"
                                className={clsx(
                                    "rounded-full border px-3 py-1 text-xs transition",
                                    isDarkMode
                                        ? "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white"
                                        : "border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-800"
                                )}
                            >
                                CSV 내보내기
                            </button>
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
                                        const status = resolveStatus(user);
                                        const loginLabel = user.loginType ? user.loginType : "-";
                                        const limitDisplay = limit > 0 ? limit.toLocaleString() : "—";
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
                                                    <span
                                                        className={clsx(
                                                            "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
                                                            status.tone === "success"
                                                                ? isDarkMode
                                                                    ? "border-emerald-500/30 bg-emerald-400/10 text-emerald-300"
                                                                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                                : status.tone === "warning"
                                                                ? isDarkMode
                                                                    ? "border-amber-500/30 bg-amber-400/10 text-amber-300"
                                                                    : "border-amber-200 bg-amber-50 text-amber-700"
                                                                : isDarkMode
                                                                ? "border-rose-500/30 bg-rose-400/10 text-rose-300"
                                                                : "border-rose-200 bg-rose-50 text-rose-700"
                                                        )}
                                                    >
                                                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                                                        {status.label}
                                                    </span>
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
