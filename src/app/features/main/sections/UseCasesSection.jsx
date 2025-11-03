import { useTranslation } from "react-i18next";
import {
    PhotoIcon,
    BriefcaseIcon,
    ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

const USE_CASES = [
    {
        key: "secondHand",
        icon: PhotoIcon,
        titleKey: "useCases.items.secondHand.title",
        descKey: "useCases.items.secondHand.desc",
        detailKey: "useCases.items.secondHand.detail",
    },
    {
        key: "jobProfile",
        icon: BriefcaseIcon,
        titleKey: "useCases.items.jobProfile.title",
        descKey: "useCases.items.jobProfile.desc",
        detailKey: "useCases.items.jobProfile.detail",
    },
    {
        key: "socialMedia",
        icon: ChatBubbleLeftRightIcon,
        titleKey: "useCases.items.socialMedia.title",
        descKey: "useCases.items.socialMedia.desc",
        detailKey: "useCases.items.socialMedia.detail",
    },
];

export default function UseCasesSection() {
    const { t } = useTranslation("home");

    return (
        <section
            id="use-cases"
            className="relative isolate overflow-hidden bg-white py-12 sm:py-16 dark:bg-slate-950"
        >
            <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(129,140,248,0.12),_transparent_55%)] dark:bg-[radial-gradient(circle_at_bottom,_rgba(129,140,248,0.22),_transparent_55%)]"
                aria-hidden="true"
            />
            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-indigo-500 dark:text-indigo-300 sm:text-xs">
                        {t("useCases.eyebrow", "Use Cases")}
                    </h3>
                    <p className="mt-3 text-xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl dark:text-white">
                        {t("useCases.title", "Where Gravifox fits")}
                    </p>
                    <p className="mt-4 text-[13px] leading-relaxed text-slate-600 sm:text-base md:text-lg dark:text-indigo-100/80">
                        {t("useCases.subtitle", "다른 일을 하러 가도 분석은 백그라운드에서 계속돼요.")}
                    </p>
                </div>

                <div className="mt-12 grid gap-6 lg:grid-cols-3">
                    {USE_CASES.map(({ key, icon: Icon, titleKey, descKey, detailKey }) => (
                        <article
                            key={key}
                            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900/70 dark:shadow-indigo-900/20"
                        >
                            <div className="relative flex h-full flex-col">
                                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/90 text-white shadow-lg shadow-indigo-500/30 dark:bg-indigo-500">
                                    <Icon className="h-6 w-6" aria-hidden="true" />
                                </div>
                                <h4 className="mt-6 text-lg font-semibold text-slate-900 dark:text-white">
                                    {t(titleKey)}
                                </h4>
                                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-indigo-100/80">
                                    {t(descKey)}
                                </p>
                                <p className="mt-6 rounded-2xl bg-indigo-50 px-4 py-3 text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">
                                    {t(detailKey)}
                                </p>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
