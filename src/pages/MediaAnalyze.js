import React, { useEffect, useMemo, useState } from "react";
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
    const [theme, setTheme] = useState(resolveInitialTheme);
    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            window.localStorage.setItem(STORAGE_KEY, theme);
            window.sessionStorage?.setItem(STORAGE_KEY, theme);
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
                {/* 본문 카드 */}
                <HowItWorksSection theme={theme} />
            </main>
            {/* 테스트용 버튼/모달 제거됨 */}
            <Footer />
        </div>
    );
}
