import React from "react";
import clsx from "clsx";
import Icon from "../../../components/icons/Icon";
import { useThemeMode } from "../../../hooks/useThemeMode";

const containerClass =
    "inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/90 px-1.5 py-1 shadow-sm backdrop-blur " +
    "dark:border-slate-700 dark:bg-slate-900/70";

const buttonBaseClass =
    "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400/70 " +
    "focus-visible:ring-offset-white dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-900";

const iconClass = "h-4 w-4";

const FooterThemeButton = () => {
    const { themeMode, setThemeMode } = useThemeMode();

    const renderButton = (mode, label, iconName) => {
        const isActive = themeMode === mode;
        return (
            <button
                key={mode}
                type="button"
                onClick={() => setThemeMode(mode)}
                aria-label={`${label} 모드로 전환`}
                aria-pressed={isActive}
                className={clsx(
                    buttonBaseClass,
                    isActive
                        ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-white/80 dark:hover:bg-white/10"
                )}
            >
                <Icon
                    name={iconName}
                    className={clsx(iconClass, isActive ? "opacity-100" : "opacity-80")}
                />
            </button>
        );
    };

    return (
        <div className={containerClass}>
            {renderButton("light", "Light", "sun")}
            {renderButton("dark", "Dark", "moon")}
        </div>
    );
};

export default FooterThemeButton;
