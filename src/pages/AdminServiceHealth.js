import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import {
    ArrowLeftIcon,
    MoonIcon,
    ShieldCheckIcon,
    SunIcon,
} from "@heroicons/react/24/outline";

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

const buildStatusTimeline = () => {
    const totalDays = 30;
    const anchor = new Date();
    anchor.setHours(0, 0, 0, 0);
    const entries = [];

    for (let offset = totalDays - 1; offset >= 0; offset -= 1) {
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
};

const colorForState = (state, isDarkMode) => {
    switch (state) {
        case "operational":
            return isDarkMode ? "bg-emerald-400/80" : "bg-emerald-400";
        case "degraded":
            return isDarkMode ? "bg-amber-400/80" : "bg-amber-400";
        default:
            return isDarkMode ? "bg-rose-400/80" : "bg-rose-400";
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

const formatFullDate = (date, locale = "ko") => {
    try {
        return new Intl.DateTimeFormat(locale, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            weekday: "short",
        }).format(date);
    } catch (error) {
        const pad = (num) => num.toString().padStart(2, "0");
        const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} (${weekdays[date.getDay()]})`;
    }
};

const AdminServiceHealth = () => {
    const { lng = "ko" } = useParams();
    const { i18n } = useTranslation();
    const adminHomePath = `/${lng}/admin`;
    const [isDarkMode, setIsDarkMode] = useState(true);
    const statusTimeline = useMemo(() => buildStatusTimeline(), []);
    const [hoveredEntry, setHoveredEntry] = useState(() =>
        statusTimeline.length ? statusTimeline[statusTimeline.length - 1] : null
    );

    useEffect(() => {
        if (statusTimeline.length) {
            setHoveredEntry(statusTimeline[statusTimeline.length - 1]);
        }
    }, [statusTimeline]);

    const latestEntry = statusTimeline.length ? statusTimeline[statusTimeline.length - 1] : null;

    const surfaceClass = isDarkMode
        ? "bg-slate-900/70 border-slate-800 shadow-slate-950/30"
        : "bg-white border-slate-200 shadow-slate-900/5";
    const subtleSurface = isDarkMode ? "bg-slate-900/60 border-slate-800" : "bg-slate-50 border-slate-200";

    return (
        <main className={clsx("min-h-screen transition-colors duration-300", isDarkMode ? "bg-slate-950 text-slate-50" : "bg-slate-100 text-slate-900")}>
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 md:px-10 md:py-16">
                <header className="flex flex-col gap-4">
                    <Link
                        to={adminHomePath}
                        className={clsx(
                            "inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition",
                            isDarkMode
                                ? "border-slate-800 bg-slate-900/80 text-slate-200 hover:border-slate-500 hover:text-white"
                                : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:text-slate-900"
                        )}
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                        운영 허브로 돌아가기
                    </Link>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-slate-500">
                            <span>Admin</span>
                            <span className="opacity-50">Service Health</span>
                        </div>
                        <h1 className="text-3xl font-semibold md:text-4xl">서비스 상태 모니터링</h1>
                        <p className={clsx("max-w-3xl text-sm md:text-base", isDarkMode ? "text-slate-400" : "text-slate-600")}>
                            핵심 서비스 트랙의 30일 운영 상태를 한눈에 확인하고, 날짜별 상세 이슈를 검토할 수 있습니다. 색상은 정상 운영·지연/부분 장애·점검 진행을 나타냅니다.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
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

                <section className="grid gap-4 md:grid-cols-3">
                    {SERVICE_TRACKS.map((track) => {
                        const state = latestEntry?.states?.[track.key] ?? "operational";
                        const issue = describeIssue(track.key, state);
                        return (
                            <article
                                key={track.key}
                                className={clsx(
                                    "flex flex-col gap-3 rounded-2xl border p-6 transition",
                                    surfaceClass
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={clsx(
                                            "inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg",
                                            state === "operational"
                                                ? "from-emerald-500 via-emerald-400 to-teal-400"
                                                : state === "degraded"
                                                ? "from-amber-500 via-orange-400 to-yellow-400"
                                                : "from-rose-500 via-red-500 to-orange-500"
                                        )}
                                    >
                                        <ShieldCheckIcon className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <p className={clsx("text-sm font-semibold", isDarkMode ? "text-slate-300" : "text-slate-600")}>
                                            {track.label}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {latestEntry ? formatFullDate(latestEntry.date, i18n.language) : "데이터 없음"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span
                                        className={clsx(
                                            "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                                            state === "operational"
                                                ? isDarkMode
                                                    ? "border border-emerald-400/80 bg-emerald-500/10 text-emerald-200"
                                                    : "border border-emerald-100 bg-emerald-50 text-emerald-700"
                                                : state === "degraded"
                                                ? isDarkMode
                                                    ? "border border-amber-400/80 bg-amber-500/10 text-amber-200"
                                                    : "border border-amber-100 bg-amber-50 text-amber-700"
                                                : isDarkMode
                                                ? "border border-rose-400/80 bg-rose-500/10 text-rose-200"
                                                : "border border-rose-100 bg-rose-50 text-rose-700"
                                        )}
                                    >
                                        {labelForState(state)}
                                    </span>
                                    <span className={clsx("text-xs", isDarkMode ? "text-slate-400" : "text-slate-600")}>
                                        {issue}
                                    </span>
                                </div>
                            </article>
                        );
                    })}
                </section>

                <section className="grid gap-6 xl:grid-cols-[3fr,2fr]">
                    <article
                        className={clsx(
                            "rounded-2xl border p-6",
                            surfaceClass
                        )}
                    >
                        <header className="flex flex-wrap items-start justify-between gap-3">
                            <div className="flex flex-col gap-1">
                                <span
                                    className={clsx(
                                        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em]",
                                        isDarkMode
                                            ? "border-emerald-500/40 bg-emerald-400/10 text-emerald-200"
                                            : "border-emerald-200 bg-emerald-50 text-emerald-600"
                                    )}
                                >
                                    서비스 트랙 타임라인
                                </span>
                                <h2 className="text-xl font-semibold">30일 운영 추이</h2>
                                <p className={clsx("text-xs", isDarkMode ? "text-slate-400" : "text-slate-600")}>
                                    색상은 정상 운영(녹색), 지연/부분 장애(주황), 점검 진행(붉은색)을 의미합니다. 마우스를 올리거나 포커스하면 상세 이슈를 확인할 수 있습니다.
                                </p>
                            </div>
                        </header>

                        <div className="mt-6 flex flex-col gap-6">
                            {SERVICE_TRACKS.map((track, index) => (
                                <div
                                    key={track.key}
                                    className={clsx(
                                        "flex flex-col gap-3 pb-4",
                                        index > 0
                                            ? isDarkMode
                                                ? "border-t border-slate-800 pt-4"
                                                : "border-t border-slate-200 pt-4"
                                            : null
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className={clsx("text-sm font-semibold", isDarkMode ? "text-slate-200" : "text-slate-600")}>
                                            {track.label}
                                        </h3>
                                        <span className="text-xs text-slate-500">
                                            {statusTimeline.length}일 히스토리
                                        </span>
                                    </div>
                                    <div className="grid h-14 grid-flow-col auto-cols-fr items-end gap-2" role="list">
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
                                                        colorForState(state, isDarkMode),
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
                                                    title={`${formatFullDate(entry.date, i18n.language)} · ${track.label} · ${labelForState(state)} (${issue})`}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </article>

                    <aside
                        className={clsx(
                            "rounded-2xl border p-6",
                            surfaceClass
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold">선택한 날짜 상세</h3>
                            <span className={clsx("text-xs", isDarkMode ? "text-slate-500" : "text-slate-600")}>
                                총 {statusTimeline.length}일치 기록
                            </span>
                        </div>
                        <div className="mt-4">
                            {hoveredEntry ? (
                                <div className="flex flex-col gap-3">
                                    <div className={clsx("rounded-xl border px-4 py-3", subtleSurface)}>
                                        <p className="text-sm font-semibold">
                                            {formatFullDate(hoveredEntry.date, i18n.language)}
                                        </p>
                                        <p className={clsx("text-xs", isDarkMode ? "text-slate-400" : "text-slate-600")}>
                                            각 트랙별로 발생한 상태와 요약 이슈를 확인하세요.
                                        </p>
                                    </div>
                                    <ul className="space-y-3">
                                        {SERVICE_TRACKS.map((track) => {
                                            const state = hoveredEntry.states[track.key];
                                            const issue = hoveredEntry.issues[track.key];
                                            return (
                                                <li
                                                    key={`${hoveredEntry.key}-${track.key}`}
                                                    className={clsx("rounded-xl border px-4 py-3", subtleSurface)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-semibold">
                                                            {track.label}
                                                        </span>
                                                        <span
                                                            className={clsx(
                                                                "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold",
                                                                state === "operational"
                                                                    ? isDarkMode
                                                                        ? "border border-emerald-400/70 bg-emerald-500/10 text-emerald-200"
                                                                        : "border border-emerald-100 bg-emerald-50 text-emerald-700"
                                                                    : state === "degraded"
                                                                    ? isDarkMode
                                                                        ? "border border-amber-400/70 bg-amber-500/10 text-amber-200"
                                                                        : "border border-amber-100 bg-amber-50 text-amber-700"
                                                                    : isDarkMode
                                                                    ? "border border-rose-400/70 bg-rose-500/10 text-rose-200"
                                                                    : "border border-rose-100 bg-rose-50 text-rose-700"
                                                            )}
                                                        >
                                                            {labelForState(state)}
                                                        </span>
                                                    </div>
                                                    <p className={clsx("mt-2 text-xs leading-relaxed", isDarkMode ? "text-slate-300" : "text-slate-600")}>
                                                        {issue}
                                                    </p>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ) : (
                                <p className={clsx("text-sm", isDarkMode ? "text-slate-400" : "text-slate-600")}>
                                    상태 막대를 호버하거나 포커스하면 날짜별 이슈 요약을 확인할 수 있습니다.
                                </p>
                            )}
                        </div>
                    </aside>
                </section>
            </div>
        </main>
    );
};

export default AdminServiceHealth;

