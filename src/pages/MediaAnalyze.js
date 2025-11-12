import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Moon, Sun } from "lucide-react";
import Header from "../app/layout/Header";
import Footer from "../app/layout/Footer/Footer";
import HowItWorksSection from "../features/analyze/HowItWorksSection";
// ErrorModal, 테스트용 업로드 API는 제거

const STORAGE_KEY = "preferred-theme";
const resolveInitialTheme = () => {
    if (typeof window === "undefined") return "dark";
    try {
        const stored =
            window.sessionStorage?.getItem(STORAGE_KEY) ||
            window.localStorage?.getItem(STORAGE_KEY);
        if (stored === "dark" || stored === "light") {
            return stored;
        }
        return "dark";
    } catch {
        return "dark";
    }
};

export default function MediaAnalyze() {
    const { t } = useTranslation("common");
    const [theme, setTheme] = useState(resolveInitialTheme);
    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            window.localStorage.setItem(STORAGE_KEY, theme);
            window.sessionStorage?.setItem(STORAGE_KEY, theme);
            window.dispatchEvent(new CustomEvent("preferred-theme-change", { detail: theme }));
        } catch {}
    }, [theme]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const refreshTheme = () => {
            setTheme(resolveInitialTheme());
        };
        const handleStorage = (event) => {
            if (event.storageArea === window.localStorage && event.key === STORAGE_KEY) {
                refreshTheme();
            }
        };
        const handleFocus = () => refreshTheme();
        window.addEventListener("storage", handleStorage);
        window.addEventListener("focus", handleFocus);
        window.addEventListener("preferred-theme-change", refreshTheme);
        return () => {
            window.removeEventListener("storage", handleStorage);
            window.removeEventListener("focus", handleFocus);
            window.removeEventListener("preferred-theme-change", refreshTheme);
        };
    }, []);

    const isDark = theme === "dark";
    const toggleLabel = t("actions.toggleTheme", "Toggle theme");
    const currentThemeMessage = isDark
        ? t("theme.currentDark", "Dark mode enabled")
        : t("theme.currentLight", "Light mode enabled");
    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    const rootClass = useMemo(() => (
        `min-h-screen font-sans flex flex-col transition-colors duration-300 ${
            isDark ? "dark bg-slate-950 text-slate-100" : "bg-white text-slate-900"
        }`
    ), [isDark]);

    const mainClass = useMemo(() => (
        `flex-1 pt-28 sm:pt-32 lg:pt-36 pb-16 transition-colors duration-300 ${
            isDark ? "bg-slate-950" : "bg-white"
        }`
    ), [isDark]);

    return (
        <div className={rootClass}>
            {/* 네비게이션 재사용 */}
            {/** Navigation은 전역 헤더 역할을 하며, 메인과 동일하게 재사용합니다. */}
            <Header />
            <main className={mainClass}>
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={toggleTheme}
                            aria-pressed={isDark}
                            aria-label={toggleLabel}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-700 shadow-sm backdrop-blur transition hover:border-slate-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-slate-500 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-900"
                        >
                            {isDark ? (
                                <Sun className="h-4 w-4 text-slate-900 dark:text-slate-100" />
                            ) : (
                                <Moon className="h-4 w-4 text-slate-700 dark:text-slate-200" />
                            )}
                            {toggleLabel}
                        </button>
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            {currentThemeMessage}
                        </span>
                    </div>
                </div>
                {/* 본문 카드 */}
                <HowItWorksSection theme={theme} />
            </main>
            {/* 테스트용 버튼/모달 제거됨 */}
            <Footer />
        </div>
    );
}
