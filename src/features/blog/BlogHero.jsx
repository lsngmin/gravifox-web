import React from "react";
import { useTranslation } from "react-i18next";


export default function BlogHero() {
    const { t } = useTranslation("blog");
    return (
        <section className="relative overflow-hidden rounded-3xl border border-indigo-200/40 bg-gradient-to-br from-white via-indigo-50/70 to-white/70 p-8 shadow-[0_20px_45px_rgba(15,23,42,0.08)] transition dark:border-slate-700/70 dark:from-slate-900 dark:via-slate-900/60 dark:to-slate-950 dark:shadow-[0_26px_60px_rgba(2,6,23,0.45)] sm:p-12">
            <div className="max-w-3xl">
                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-300">{t("hero.kicker")}</p>
                <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
                    {t("hero.title")}
                </h1>
                <p className="mt-4 text-base text-slate-600 dark:text-slate-300">{t("hero.subtitle")}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                    <a
                        href="#latest"
                        className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                    >
                        {t("hero.ctaPrimary")}
                    </a>
                    <a
                        href="#categories"
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200/70 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900/70"
                    >
                        {t("hero.ctaSecondary")}
                    </a>
                </div>
            </div>
        </section>
    );
}
