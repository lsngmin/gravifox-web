import React from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from "../../../lib/constants";

const FooterLanguageButton = () => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const currentLng = (i18n.language || DEFAULT_LANGUAGE).slice(0, 2);

    const changeLanguage = (lng) => {
        const next = SUPPORTED_LANGUAGES.includes(lng)
            ? lng
            : DEFAULT_LANGUAGE;

        i18n.changeLanguage(next);
        localStorage.setItem("i18nextLng", next);

        const stripLang = (path) => path.replace(/^\/(en|ko)/, "") || "/";
        const nextPath = `/${next}${stripLang(location.pathname)}${
            location.search || ""
        }${location.hash || ""}`;

        navigate(nextPath, { replace: true });
    };

    return (
        <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white/90 px-1.5 py-1 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
            {SUPPORTED_LANGUAGES.map((lng) => {
                const isActive = currentLng === lng;
                return (
                    <button
                        key={lng}
                        onClick={() => changeLanguage(lng)}
                        aria-pressed={isActive}
                        className={clsx(
                            "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400/70 focus-visible:ring-offset-white dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-900",
                            isActive
                                ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-white/80 dark:hover:bg-white/10"
                        )}
                    >
                        {lng.toUpperCase()}
                    </button>
                );
            })}
        </div>
    );
};

export default FooterLanguageButton;
