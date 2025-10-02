import React from "react";
import { useTranslation } from "react-i18next";


export default function BlogHero() {
    const { t } = useTranslation("blog");
    return (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500/10 via-white to-white border border-gray-200 p-8 sm:p-12 shadow-[0_16px_30px_rgba(0,0,0,0.06)]">
            <div className="max-w-3xl">
                <p className="text-sm font-medium text-indigo-600">{t("hero.kicker")}</p>
                <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
                    {t("hero.title")}
                </h1>
                <p className="mt-4 text-base text-gray-600">{t("hero.subtitle")}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                    <a href="#latest" className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-white text-sm font-semibold shadow hover:opacity-90 transition">
                        {t("hero.ctaPrimary")}
                    </a>
                    <a href="#categories" className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                        {t("hero.ctaSecondary")}
                    </a>
                </div>
            </div>
        </section>
    );
}