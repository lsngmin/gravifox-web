import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import AdminPageTopBar from "../components/admin/AdminPageTopBar";

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

const colorForState = (state) => {
    switch (state) {
        case "operational":
            return "bg-emerald-400 dark:bg-emerald-400/80";
        case "degraded":
            return "bg-amber-400 dark:bg-amber-400/80";
        default:
            return "bg-rose-400 dark:bg-rose-400/80";
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

    const pageClass =
        "min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100";
    const containerClass =
        "mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 md:px-10 md:py-16";
    const introTextClass = "max-w-3xl text-sm text-slate-600 md:text-base dark:text-slate-400";
    const trackCardClass =
        "flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_34px_-24px_rgba(15,23,42,0.15)] dark:border-slate-800/80 dark:bg-slate-900/70";
    const timelineCardClass =
        "rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.14)] dark:border-slate-800/80 dark:bg-slate-900/60";
    const legendBadgeClass =
        "inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300";

    return (
        <main className={pageClass}>
            <div className={containerClass}>
                <header className="flex flex-col gap-6">
                    <AdminPageTopBar lng={lng} currentLabel="서비스 상태" />
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-500">
                            <span>Admin</span>
                            <span className="opacity-50">Service Health</span>
                        </div>
                        <h1 className="text-3xl font-semibold md:text-4xl">서비스 상태 모니터링</h1>
                        <p className={introTextClass}>
                            핵심 서비스 트랙의 30일 운영 상태를 한눈에 확인하고, 날짜별 상세 이슈를 검토할 수 있습니다.
                            색은 정상 운영·지연/부분 장애·점검 진행을 나타냅니다.
                        </p>
                    </div>
                </header>

                <section className="grid gap-4 md:grid-cols-3">
                    {SERVICE_TRACKS.map((track) => {
                        const state = latestEntry?.states?.[track.key] ?? "operational";
                        const issue = describeIssue(track.key, state);
                        return (
                            <article key={track.key} className={trackCardClass}>
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
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{track.label}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {latestEntry ? formatFullDate(latestEntry.date, i18n.language) : "데이터 없음"}
                                        </p>
                                    </div>
                                </div>
                                <span className={legendBadgeClass}>{labelForState(state)}</span>
                                <p className="text-sm text-slate-600 dark:text-slate-300">{issue}</p>
                            </article>
                        );
                    })}
                </section>

                <section className={timelineCardClass}>
                    <header className="flex flex-col gap-2 border-b border-slate-200 pb-4 dark:border-slate-800">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">30일 히스토리</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            날짜를 가리키면 해당 서비스의 상세 이슈가 표시됩니다.
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span className={legendBadgeClass}>
                                <span className="h-3 w-3 rounded-full bg-emerald-400 dark:bg-emerald-400/80" />
                                정상
                            </span>
                            <span className={legendBadgeClass}>
                                <span className="h-3 w-3 rounded-full bg-amber-400 dark:bg-amber-400/80" />
                                지연/부분 장애
                            </span>
                            <span className={legendBadgeClass}>
                                <span className="h-3 w-3 rounded-full bg-rose-400 dark:bg-rose-400/80" />
                                점검
                            </span>
                        </div>
                    </header>

                    <div className="mt-6 grid gap-6 lg:grid-cols-[2fr,1fr]">
                        <div className="flex flex-col gap-4">
                            {SERVICE_TRACKS.map((track, index) => (
                                <div key={track.key} className={clsx("flex flex-col gap-3", index > 0 && "border-t border-slate-200 pt-4 dark:border-slate-800")}
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{track.label}</h3>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
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
                                                    onMouseEnter={() => setHoveredEntry(entry)}
                                                    onFocus={() => setHoveredEntry(entry)}
                                                    role="button"
                                                    tabIndex={0}
                                                    className={clsx(
                                                        "flex h-full flex-col justify-end rounded-md border border-transparent bg-slate-200 transition focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-slate-800",
                                                        isActive && "border-sky-400 shadow-lg shadow-sky-500/20"
                                                    )}
                                                >
                                                    <div className={clsx("h-full w-full rounded-md", colorForState(state))} />
                                                    <span className="sr-only">{track.label} {entry.key}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <aside className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-100 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">상세 이슈</h3>
                            {hoveredEntry ? (
                                <div className="space-y-3">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {formatFullDate(hoveredEntry.date, i18n.language)}
                                    </p>
                                    {SERVICE_TRACKS.map((track) => {
                                        const state = hoveredEntry.states[track.key];
                                        return (
                                            <div key={`detail-${track.key}`} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{track.label}</span>
                                                    <span className={legendBadgeClass}>{labelForState(state)}</span>
                                                </div>
                                                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                                    {hoveredEntry.issues[track.key]}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p>히스토리 바를 가리키면 상세 이슈가 표시됩니다.</p>
                            )}
                        </aside>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default AdminServiceHealth;
