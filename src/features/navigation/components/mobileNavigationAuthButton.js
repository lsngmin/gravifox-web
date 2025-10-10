import React, {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import { useTranslation } from "react-i18next";

import {useAuth} from "providers/authProvider";


export default function MobileNavigationAuthButton({ localePrefix = "", onNavigate, variant = "light" }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { accessToken, logout } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation('common');
    const isDark = variant === "dark";

    const buildPath = (suffix) => {
        if (!suffix.startsWith("/")) {
            suffix = `/${suffix}`;
        }
        return localePrefix ? `${localePrefix}${suffix}` : suffix;
    };

    const loginPath = buildPath("/login");
    const dashboardPath = buildPath("/dashboard");

    useEffect(() => {
        // 페이지 로드될 때 토큰 확인
        if (accessToken) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    }, [accessToken]);

    const handleLogout = () => {
        logout();
        if (typeof onNavigate === "function") onNavigate();
    };

    const handleDashboard = (event) => {
        event.preventDefault();
        if (typeof onNavigate === "function") onNavigate();
        navigate(dashboardPath);
    };

    return (
        <div className="space-y-2">
            {isLoggedIn ? (
                <>
                    <button
                        type="button"
                        onClick={handleDashboard}
                        className={`w-full rounded-xl border px-4 py-3 text-base font-semibold shadow-sm transition ${
                            isDark
                                ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-100 hover:bg-indigo-500/30'
                                : 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                        }`}
                    >
                        {t('navigation.actions.viewDashboard')}
                    </button>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className={`w-full rounded-xl border px-4 py-3 text-base font-semibold transition ${
                            isDark
                                ? 'border-slate-700 text-slate-300 hover:border-rose-500/60 hover:text-rose-300 hover:bg-rose-500/10'
                                : 'border-slate-200 text-slate-600 hover:border-rose-200 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                    >
                        {t('navigation.actions.logout')} <span aria-hidden="true">&rarr;</span>
                    </button>
                </>
            ) : (
                <Link
                    to={loginPath}
                    onClick={() => typeof onNavigate === "function" && onNavigate()}
                    className={`flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 ${
                        isDark ? 'focus-visible:ring-offset-slate-900' : 'focus-visible:ring-offset-white'
                    }`}
                >
                    {t('navigation.actions.login')} <span aria-hidden="true" className="ml-1">&rarr;</span>
                </Link>
            )}
        </div>
    );
}
