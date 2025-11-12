import { useTranslation } from "react-i18next";

import Icon from "../../../components/icons/Icon";

export default function PageHero() {
    const { t, i18n } = useTranslation("home");
    const lng = (i18n.language || "en").slice(0, 2);

    const heroCtaStart = t("hero.cta.start", t("cta.start", "Get started free"));
    const heroCtaPricing = t("hero.cta.pricing", t("cta.pricing", "View pricing"));

    const highlightItems = [
        {
            icon: "check-circle",
            title: t("hero.highlight.precision.title", "97% 이상 검증 정확도"),
            description: t(
                "hero.highlight.precision.description",
                "수천 건의 합성 콘텐츠 벤치마크를 기반으로 신뢰도 스코어를 제공합니다."
            ),
        },
        {
            icon: "sparkles",
            title: t("hero.highlight.automation.title", "엔터프라이즈 자동화"),
            description: t(
                "hero.highlight.automation.description",
                "Webhook, 큐 기반 처리, Role 기반 접근 제어까지 기본으로 지원합니다."
            ),
        },
        {
            icon: "globe",
            title: t("hero.highlight.coverage.title", "다국어·다포맷 지원"),
            description: t(
                "hero.highlight.coverage.description",
                "이미지·영상·썸네일까지 한 번에 분석하고, 글로벌 고객을 위한 다국어 리포트를 제공합니다."
            ),
        },
    ];

    const supportLinks = [
        {
            title: t("hero.feedback", "버그 제보 및 기능 제안하기"),
            description: t(
                "hero.feedbackNote",
                "서비스 개선에 도움이 된 제안이나 버그 제보를 보내주시면, 정식 오픈 시 Pro 플랜 혜택을 드릴 예정이에요."
            ),
            href: `/${lng}/support`,
            cta: t("hero.feedbackCta", "→ 제안 남기기"),
            icon: "message-square",
        },
        {
            title: t("hero.contact", "문의하기"),
            description: t(
                "hero.contactNote",
                "협업 제안, 사용 중 궁금한 점, 기술 관련 문의는 언제든 환영해요. 가능한 빠르게 답변드릴게요."
            ),
            href: `/${lng}/contact`,
            cta: t("hero.contactCta", "→ 담당자 연결"),
            icon: "mail",
        },
        {
            title: t("hero.roadmap", "로드맵 보기"),
            description: t(
                "hero.roadmapNote",
                "앞으로 추가될 기능과 개선 일정을 확인해보세요. 서비스의 방향을 함께 만들어가요."
            ),
            href: `/${lng}/roadmap`,
            cta: t("hero.roadmapCta", "→ 로드맵 확인"),
            icon: "map",
        },
    ];

    return (
        <section className="relative isolate overflow-hidden bg-white text-slate-900 dark:bg-slate-950 dark:text-indigo-50">
            <div
                className="absolute inset-0 -z-20 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-indigo-900 dark:to-slate-900"
                aria-hidden="true"
            />
            <div
                className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(165,180,252,0.35),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.35),_transparent_55%)]"
                aria-hidden="true"
            />
            <div
                className="absolute top-[10%] left-1/2 -z-10 h-[540px] w-[540px] -translate-x-1/2 rounded-full bg-indigo-300/30 blur-3xl dark:bg-indigo-500/20"
                aria-hidden="true"
            />

            <div className="relative mx-auto max-w-6xl px-6 pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20">
                <div className="flex flex-col gap-12 text-slate-900 dark:text-indigo-50">
                    <div className="space-y-10">
                        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-100/50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-indigo-700 shadow-[0_14px_32px_-18px_rgba(99,102,241,0.45)] dark:border-indigo-200/30 dark:bg-indigo-200/10 dark:text-indigo-100/90 dark:shadow-[0_0_30px_rgba(129,140,248,0.35)]">
                            {t("hero.ribbon")}
                        </span>
                        <div className="space-y-3">
                            <h1 className="text-[28px] sm:text-5xl md:text-6xl font-black leading-tight text-transparent bg-gradient-to-br from-indigo-700 via-indigo-500 to-indigo-400 bg-clip-text drop-shadow-[0_18px_48px_rgba(79,70,229,0.25)] dark:from-indigo-50 dark:via-white dark:to-indigo-200 dark:drop-shadow-[0_18px_48px_rgba(30,64,175,0.26)]">
                                {t("hero.headline")}
                            </h1>
                            <p className="text-base sm:text-lg md:text-xl leading-relaxed text-slate-600 dark:text-indigo-100/90">
                                {t(
                                    "hero.subtitle1",
                                    "Drop a photo and we tell you right away if AI made it."
                                )}
                            </p>
                            <p className="text-base sm:text-lg md:text-xl leading-relaxed text-slate-600 dark:text-indigo-100/90">
                                {t(
                                    "hero.subtitle2",
                                    "We point out the clues so you can understand at a glance."
                                )}
                            </p>
                            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-slate-500 dark:text-indigo-200/85">
                                {t(
                                    "hero.subcaption",
                                    "테스트 기간 동안 로그인 없이도 제한된 횟수로 AI 탐지 기능을 무료 체험할 수 있습니다."
                                )}
                            </p>
                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <a
                                href={`/${lng}/analyze`}
                                className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-sm sm:text-base font-semibold text-white shadow-[0_20px_36px_-18px_rgba(79,70,229,0.55)] transition hover:bg-indigo-500 hover:shadow-[0_28px_48px_-22px_rgba(99,102,241,0.6)] dark:bg-white dark:text-slate-900 dark:shadow-[0_24px_48px_-20px_rgba(129,140,248,0.65)] dark:hover:bg-indigo-50/95 dark:hover:shadow-[0_32px_60px_-24px_rgba(99,102,241,0.65)]"
                            >
                                {heroCtaStart}
                                <Icon name="arrow-outward" className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                            </a>
                            <a
                                href={`/${lng}/pricing`}
                                className="inline-flex items-center justify-center rounded-full border border-indigo-200 bg-white px-6 py-3 text-sm sm:text-base font-semibold text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-white/25 dark:bg-transparent dark:text-indigo-100 dark:hover:border-white/40 dark:hover:bg-white/10"
                            >
                                {heroCtaPricing}
                            </a>
                        </div>

                        <div className="space-y-8">
                            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {highlightItems.map(({ icon, title, description }) => (
                                    <li
                                        key={title}
                                        className="group relative overflow-hidden rounded-3xl border border-indigo-200/40 bg-white p-5 text-slate-700 shadow-sm transition-colors duration-300 hover:border-indigo-300 hover:bg-indigo-50 dark:border-white/10 dark:bg-white/5 dark:text-indigo-50"
                                    >
                                        <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-indigo-200/30 via-transparent to-transparent dark:from-white/10 dark:via-indigo-500/10 dark:to-transparent" />
                                        <div className="relative flex items-start gap-3">
                                            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 shadow-inner shadow-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-100 dark:shadow-indigo-500/30">
                                                <Icon name={icon} className="h-5 w-5" />
                                            </span>
                                            <div className="space-y-1.5">
                                                <h3 className="text-base font-semibold text-indigo-900 dark:text-white">{title}</h3>
                                                <p className="text-sm leading-snug text-slate-600 dark:text-indigo-100/75">{description}</p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <div className="border-t border-slate-200/40 pt-10">
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {supportLinks.map(({ title, description, href, cta, icon }) => (
                                        <a
                                            key={title}
                                            href={href}
                                        className="group relative flex h-full flex-col gap-2 overflow-hidden rounded-3xl border border-indigo-200/40 bg-white p-4 text-slate-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-white/10 dark:bg-white/5 dark:text-indigo-100 dark:hover:border-white/30 dark:hover:bg-white/10"
                                        >
                                            <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-tr from-indigo-200/25 via-transparent to-transparent dark:from-indigo-300/15 dark:via-transparent dark:to-transparent" />
                                            <div className="relative flex items-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-100">
                                                <Icon name={icon} className="h-4 w-4 flex-none text-indigo-500 dark:text-indigo-200" />
                                                <span>{title}</span>
                                            </div>
                                            <p className="relative text-xs sm:text-sm leading-snug text-slate-500 dark:text-indigo-100/70">
                                                {description}
                                            </p>
                                            <span className="relative self-end text-right mt-2 text-xs font-semibold text-indigo-600 transition group-hover:text-indigo-800 dark:text-indigo-200 dark:group-hover:text-white">
                                                {cta}
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
