// src/app/hooks/useThemeMode.js
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY } from "../../app/lib/constants";

const VALID_THEMES = new Set(["light", "dark"]);
const LEGACY_STORAGE_KEYS = ["preferred-theme"];
const THEME_CHANGE_EVENT = "theme-mode-change";

const readStoredTheme = () => {
    if (typeof window === "undefined") return null;
    try {
        const candidates = [
            window.sessionStorage?.getItem(THEME_STORAGE_KEY),
            window.localStorage?.getItem(THEME_STORAGE_KEY),
            ...LEGACY_STORAGE_KEYS.flatMap((key) => [
                window.sessionStorage?.getItem(key),
                window.localStorage?.getItem(key),
            ]),
        ];
        for (const stored of candidates) {
            if (stored === "dark" || stored === "light") {
                return stored;
            }
        }
    } catch {
        /** ignore storage read issues */
    }
    return null;
};

const detectTheme = () => {
    const stored = readStoredTheme();
    if (stored) return stored;
    if (typeof document !== "undefined" && document.documentElement.classList.contains("dark")) {
        return "dark";
    }
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)")?.matches) {
        return "dark";
    }
    return "light";
};

const persistTheme = (mode) => {
    if (typeof window === "undefined") return;
    try {
        window.sessionStorage?.setItem(THEME_STORAGE_KEY, mode);
        LEGACY_STORAGE_KEYS.forEach((key) => {
            window.sessionStorage?.setItem(key, mode);
            window.localStorage?.setItem?.(key, mode);
        });
    } catch {
        /** ignore storage write errors */
    }
};

const dispatchThemeChange = (mode) => {
    if (typeof window === "undefined") return;
    try {
        window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: mode }));
        window.dispatchEvent(new CustomEvent("preferred-theme-change", { detail: mode }));
        window.dispatchEvent(new CustomEvent("theme-change", { detail: mode }));
    } catch {
        /** ignore dispatch errors */
    }
};

const applyThemeToDom = (mode) => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", mode === "dark");
};

const applyTheme = (mode, { notify = true, persist = true } = {}) => {
    applyThemeToDom(mode);
    if (persist) persistTheme(mode);
    if (notify) dispatchThemeChange(mode);
};

let currentTheme = (() => {
    if (typeof window === "undefined") return "light";
    const initial = detectTheme();
    applyTheme(initial, { notify: false });
    return initial;
})();

const listeners = new Set();

const subscribeToStore = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

const notifyListeners = () => {
    listeners.forEach((listener) => listener());
};

const setInternalTheme = (mode, { notify = true, persist = true } = {}) => {
    if (!VALID_THEMES.has(mode)) return currentTheme;
    const changed = mode !== currentTheme;
    currentTheme = mode;
    applyTheme(mode, { notify, persist });
    if (changed) notifyListeners();
    return currentTheme;
};

const getSnapshot = () => currentTheme;
const getServerSnapshot = () => "light";

export function useThemeMode() {
    const themeMode = useSyncExternalStore(subscribeToStore, getSnapshot, getServerSnapshot);

    const setThemeMode = useCallback((value) => {
        if (VALID_THEMES.has(value)) {
            setInternalTheme(value);
        }
    }, []);

    const toggleTheme = useCallback(() => {
        setInternalTheme(themeMode === "dark" ? "light" : "dark");
    }, [themeMode]);

    useEffect(() => {
        if (typeof window === "undefined") return undefined;

        const handleVisibility = () => {
            if (document.visibilityState !== "visible") return;
            const detected = detectTheme();
            if (detected !== currentTheme) {
                setInternalTheme(detected, { notify: false });
            }
        };

        const handleExternalEvent = (event) => {
            const detail = event?.detail;
            if (detail === "light" || detail === "dark") {
                if (detail !== currentTheme) {
                    setInternalTheme(detail, { notify: false });
                }
                return;
            }
            const detected = detectTheme();
            if (detected !== currentTheme) {
                setInternalTheme(detected, { notify: false });
            }
        };

        const handleStorage = () => {
            const stored = readStoredTheme();
            if (stored && stored !== currentTheme) {
                setInternalTheme(stored, { notify: false });
            }
        };

        const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
        const handleMedia = (event) => {
            const stored = readStoredTheme();
            if (stored) {
                if (stored !== currentTheme) {
                    setInternalTheme(stored, { notify: false });
                }
                return;
            }
            const next = event.matches ? "dark" : "light";
            if (next !== currentTheme) {
                setInternalTheme(next);
            }
        };

        window.addEventListener(THEME_CHANGE_EVENT, handleExternalEvent);
        window.addEventListener("preferred-theme-change", handleExternalEvent);
        window.addEventListener("theme-change", handleExternalEvent);
        window.addEventListener("storage", handleStorage);
        document.addEventListener("visibilitychange", handleVisibility);
        mq?.addEventListener?.("change", handleMedia);

        return () => {
            window.removeEventListener(THEME_CHANGE_EVENT, handleExternalEvent);
            window.removeEventListener("preferred-theme-change", handleExternalEvent);
            window.removeEventListener("theme-change", handleExternalEvent);
            window.removeEventListener("storage", handleStorage);
            document.removeEventListener("visibilitychange", handleVisibility);
            mq?.removeEventListener?.("change", handleMedia);
        };
    }, []);

    return { themeMode, setThemeMode, toggleTheme };
}
