import React, {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import { useTranslation } from "react-i18next";

import {useAuth} from "providers/authProvider";


export default function MobileNavigationAuthButton({ localePrefix = "", onNavigate }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { accessToken, logout } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation('common');

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
                        className="w-full rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-base font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-100"
                    >
                        {t('navigation.actions.viewDashboard')}
                    </button>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-semibold text-slate-600 transition hover:border-rose-200 hover:text-rose-600 hover:bg-rose-50"
                    >
                        {t('navigation.actions.logout')} <span aria-hidden="true">&rarr;</span>
                    </button>
                </>
            ) : (
                <Link
                    to={loginPath}
                    onClick={() => typeof onNavigate === "function" && onNavigate()}
                    className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                    {t('navigation.actions.login')} <span aria-hidden="true" className="ml-1">&rarr;</span>
                </Link>
            )}
        </div>
    );
}
