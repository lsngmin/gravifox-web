import React, { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    ArrowRightIcon,
    ChartPieIcon,
    EnvelopeIcon,
    PencilSquareIcon,
    QueueListIcon,
    ShieldCheckIcon,
    Squares2X2Icon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";

const AdminHome = () => {
    const navigate = useNavigate();
    const { lng = "ko" } = useParams();
    const previewPath = `/${lng}/admin/preview`;
    const mailPath = `/${lng}/admin/mail`;
    const blogPath = `/${lng}/admin/blog`;
    const inboxPath = `/${lng}/admin/issues`;
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
        [blogPath, inboxPath, mailPath, previewPath, serviceHealthPath]
    );

    const handleNavigate = (target) => {
        if (!target) {
            return;
        }
        navigate(target);
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 md:px-10 md:py-16">
                <header className="flex flex-col gap-4">
                    <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                        Admin · Console
                    </p>
                    <h1 className="text-3xl font-semibold md:text-4xl">
                        운영 허브
                    </h1>
                    <p className="max-w-3xl text-sm text-slate-400 md:text-base">
                        주요 운영 기능을 한 곳에서 빠르게 접근할 수 있는 시작 화면입니다. 서비스 지표
                        확인부터 사용자 커뮤니케이션까지 작업 흐름에 맞춰 이동해 보세요.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-3">
                        <Link
                            to={previewPath}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
                        >
                            현황 프리뷰 열기
                            <ArrowRightIcon className="h-4 w-4" />
                        </Link>
                        <Link
                            to={serviceHealthPath}
                            className="inline-flex items-center gap-2 rounded-full border border-cyan-400/60 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-300 hover:bg-cyan-500/20"
                        >
                            서비스 상태 보기
                            <ArrowRightIcon className="h-4 w-4" />
                        </Link>
                        <Link
                            to={mailPath}
                            className="inline-flex items-center gap-2 rounded-full border border-sky-600/60 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-100 transition hover:border-sky-400 hover:bg-sky-500/20"
                        >
                            사용자 메일 작성
                            <ArrowRightIcon className="h-4 w-4" />
                        </Link>
                        <Link
                            to={blogPath}
                            className="inline-flex items-center gap-2 rounded-full border border-amber-400/60 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-100 transition hover:border-amber-300 hover:bg-amber-500/20"
                        >
                            블로그 글 쓰기
                            <ArrowRightIcon className="h-4 w-4" />
                        </Link>
                        <Link
                            to={inboxPath}
                            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/60 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:border-emerald-400 hover:bg-emerald-500/20"
                        >
                            피드백 수신함 열기
                            <ArrowRightIcon className="h-4 w-4" />
                        </Link>
                    </div>
                </header>

                <section className="grid gap-6 md:grid-cols-2">
                    {sections.map((section) => {
                        const Icon = section.icon;
                        const isDisabled = !section.to;
                        return (
                            <article
                                key={section.id}
                                className={clsx(
                                    "group relative flex h-full flex-col rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.6)] transition duration-300 hover:border-slate-300/40 hover:bg-slate-900/90",
                                    isDisabled && "cursor-not-allowed opacity-70"
                                )}
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
                                <h2 className="text-xl font-semibold text-slate-50">
                                    {section.title}
                                </h2>
                                <p className="mt-3 flex-1 text-sm leading-6 text-slate-300">
                                    {section.description}
                                </p>
                                <div className="mt-6 flex items-center justify-between">
                                    <span className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500">
                                        {section.hint}
                                    </span>
                                    {section.to ? (
                                        <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-100 transition group-hover:border-slate-400 group-hover:text-white">
                                            이동
                                            <ArrowRightIcon className="h-4 w-4" />
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-2 rounded-full border border-slate-800/80 bg-slate-950 px-4 py-2 text-sm font-medium text-slate-500">
                                            준비 중
                                        </span>
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
