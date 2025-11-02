import React, { useEffect } from "react";
import clsx from "clsx";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useThemeMode } from "../../app/hooks/useThemeMode";

const AdminThemeToggle = ({ className }) => {
    const { themeMode, toggleTheme } = useThemeMode();
    const isDark = themeMode === "dark";

    useEffect(() => {
        if (typeof document === "undefined") return;
        document.documentElement.classList.toggle("dark", isDark);
    }, [isDark]);

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
            aria-pressed={isDark}
            className={clsx(
                "inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white/80 text-slate-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:focus-visible:ring-slate-400 dark:focus-visible:ring-offset-slate-900 dark:hover:border-slate-500 dark:hover:text-white aria-pressed:border-slate-600 aria-pressed:text-slate-900 dark:aria-pressed:border-slate-400 dark:aria-pressed:text-white",
                className
            )}
        >
            {isDark ? <SunIcon className="h-5 w-5 text-amber-400" /> : <MoonIcon className="h-5 w-5 text-slate-600" />}
        </button>
    );
};

export default AdminThemeToggle;
