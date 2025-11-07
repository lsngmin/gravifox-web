import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowRightIcon,
    ChartPieIcon,
    EnvelopeIcon,
    PencilSquareIcon,
    QueueListIcon,
    ShieldCheckIcon,
    Squares2X2Icon,
    UserGroupIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import AdminThemeToggle from "../components/admin/AdminThemeToggle";

const AdminHome = () => {
    const navigate = useNavigate();
    const { lng = "ko" } = useParams();
    const previewPath = `/${lng}/admin/preview`;
    const mailPath = `/${lng}/admin/mail`;
    const blogPath = `/${lng}/admin/blog`;
    const inboxPath = `/${lng}/admin/issues`;
    const usersPath = `/${lng}/admin/users`;
    const serviceHealthPath = `/${lng}/admin/service-health`;

    const sections = useMemo(
        () => [
            {
                id: "service-health",
                title: "서비스 상태 모니터링",
                description:
                    "백엔드 API, AI 추론 서버, 메시지 큐의 최근 30일 상태 변화를 살펴보고 이슈를 추적합니다.",
                hint: "Status Timeline",
                to: serviceHealthPath,
                icon: ShieldCheckIcon,
                accent: "from-cyan-500 via-sky-500 to-emerald-500",
            },
            {
                id: "users",
                title: "사용자 목록",
                description:
                    "가입자 정보를 확인하고 월별 사용량을 관리합니다.",
                hint: "Users",
                to: usersPath,
                icon: UserGroupIcon,
                accent: "from-indigo-500 via-sky-500 to-emerald-400",
            },
            {
                id: "inbox",
                title: "피드백 수신함",
                description:
                    "지원 페이지를 통해 접수된 버그 제보, 기능 제안, 문의하기 기록을 유형별로 검토합니다.",
                hint: "버그 · 제안 · 문의",
                to: inboxPath,
                icon: Squares2X2Icon,
                accent: "from-emerald-500 via-teal-400 to-sky-500",
            },
            {
                id: "preview",
                title: "운영 현황 미리보기",
                description:
                    "실시간 서비스 상태, 분석 처리량, 사용자 활동을 대시보드에서 확인합니다.",
                hint: "분석 리포트, 사용자 지표",
                to: previewPath,
                icon: ChartPieIcon,
                accent: "from-sky-500 via-cyan-400 to-emerald-400",
            },
            {
                id: "mail",
                title: "운영자 메일 발송",
                description:
                    "선택한 사용자 혹은 그룹에게 맞춤 공지, 긴급 알림, 온보딩 가이드를 발송합니다.",
                hint: "SMTP 연동, 전송 이력",
                to: mailPath,
                icon: EnvelopeIcon,
                accent: "from-violet-500 via-indigo-400 to-sky-400",
            },
            {
                id: "blog",
                title: "블로그 글 관리",
                description:
                    "새 글을 작성해 초안으로 보관하고, 검토 후 업로드하여 블로그 페이지에 즉시 반영합니다.",
                hint: "Draft → Publish",
                to: blogPath,
                icon: PencilSquareIcon,
                accent: "from-rose-500 via-orange-400 to-amber-300",
            },
            {
                id: "queues",
                title: "예약 전송 / 큐 관리",
                description:
                    "곧 제공 예정입니다. 메시지 전송 예약과 큐 상태를 한눈에 관리할 수 있도록 준비 중입니다.",
                hint: "Coming soon",
                to: null,
                icon: QueueListIcon,
                accent: "from-slate-500 via-slate-400 to-slate-300",
            },
        ],
        [blogPath, inboxPath, mailPath, previewPath, serviceHealthPath, usersPath]
    );

    const handleNavigate = (target) => {
        if (!target) {
            return;
        }
        navigate(target);
    };

    const pageClass =
        "min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100";
    const containerClass =
        "mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-12 sm:px-6 md:px-10 md:py-16";
    const heroEyebrowClass = "text-xs uppercase tracking-[0.4em] text-slate-500";
    const heroBodyClass = "max-w-3xl text-sm text-slate-600 md:text-base dark:text-slate-400";
    const sectionGridClass = "grid gap-6 sm:grid-cols-2 xl:grid-cols-3";
    const cardBaseClass =
        "group relative flex h-full flex-col rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_32px_60px_-34px_rgba(15,23,42,0.28)] transition duration-300 hover:border-slate-400/60 hover:bg-slate-50 dark:border-slate-800/80 dark:bg-slate-900/70 dark:shadow-[0_26px_55px_-30px_rgba(15,23,42,0.65)] dark:hover:border-slate-300/40 dark:hover:bg-slate-900/90";
    const cardClass = (isDisabled) =>
        clsx(cardBaseClass, isDisabled && "cursor-not-allowed opacity-70");
    const bodyTextClass = "mt-3 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300";
    const hintClass = "text-xs font-medium uppercase tracking-[0.3em] text-slate-500";
    const actionChipClass =
        "inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition group-hover:border-slate-500 group-hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:group-hover:border-slate-400 dark:group-hover:text-white";
    const disabledChipClass =
        "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-400 dark:border-slate-800/80 dark:bg-slate-950/80 dark:text-slate-500";

    return (
        <main className={pageClass}>
            <div className={containerClass}>
                <header className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className={heroEyebrowClass}>Admin · Console</p>
                        <AdminThemeToggle />
                    </div>
                    <h1 className="text-3xl font-semibold md:text-4xl">운영 허브</h1>
                    <p className={heroBodyClass}>
                        주요 운영 기능을 한 곳에서 빠르게 접근할 수 있는 시작 화면입니다. 서비스 지표
                        확인부터 사용자 커뮤니케이션까지 작업 흐름에 맞춰 이동해 보세요.
                    </p>
                </header>

                <section className={sectionGridClass}>
                    {sections.map((section) => {
                        const Icon = section.icon;
                        const isDisabled = !section.to;
                        return (
                            <article
                                key={section.id}
                                className={cardClass(isDisabled)}
                                role={isDisabled ? "article" : "button"}
                                tabIndex={isDisabled ? -1 : 0}
                                onClick={() => handleNavigate(section.to)}
                                onKeyDown={(event) => {
                                    if (
                                        !isDisabled &&
                                        (event.key === "Enter" || event.key === " ")
                                    ) {
                                        event.preventDefault();
                                        handleNavigate(section.to);
                                    }
                                }}
                            >
                                <div
                                    className={clsx(
                                        "mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg",
                                        section.accent
                                    )}
                                >
                                    <Icon className="h-6 w-6" aria-hidden="true" />
                                </div>
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                                    {section.title}
                                </h2>
                                <p className={bodyTextClass}>{section.description}</p>
                                <div className="mt-6 flex items-center justify-between">
                                    <span className={hintClass}>{section.hint}</span>
                                    {section.to ? (
                                        <span className={actionChipClass}>
                                            이동
                                            <ArrowRightIcon className="h-4 w-4" />
                                        </span>
                                    ) : (
                                        <span className={disabledChipClass}>준비 중</span>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </section>
            </div>
        </main>
    );
};

export default AdminHome;
