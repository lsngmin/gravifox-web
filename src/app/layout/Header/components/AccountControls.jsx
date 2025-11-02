import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from 'providers/authProvider';

import LoginButton from './LoginButton';
import UsageBadge from './UsageBadge';
import { useHeaderContext } from '../context';
import { useThemeMode } from '../../../hooks/useThemeMode';
import Icon from 'app/components/icons/Icon';

const AccountControls = () => {
    const { userInfo, logout } = useAuth();
    const { localePrefix } = useHeaderContext();
    const { themeMode, toggleTheme } = useThemeMode();
    const navigate = useNavigate();

    const isLoggedIn = Boolean(userInfo);
    const displayName = userInfo?.nickname || userInfo?.userId || '';
    const displayEmail = userInfo?.userId || '';

    const goSettings = () => {
        const settingsPath = localePrefix ? `${localePrefix}/settings` : '/settings';
        navigate(settingsPath);
    };

    const goDashboard = () => {
        const dashboardPath = localePrefix ? `${localePrefix}/dashboard` : '/dashboard';
        navigate(dashboardPath);
    };

    return (
        <div className="hidden lg:flex items-center justify-end gap-3">
            {isLoggedIn ? (
                <>
                    <div className="flex flex-col items-end leading-tight">
                        <span className="text-sm font-semibold text-gray-800 dark:text-slate-100">
                            {displayName}
                        </span>
                        {displayEmail ? (
                            <span className="text-xs text-gray-500 dark:text-slate-400">{displayEmail}</span>
                        ) : null}
                    </div>
                    <UsageBadge />
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white/70 text-gray-600 shadow-sm transition hover:border-slate-300 hover:bg-white hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-white dark:focus-visible:ring-offset-slate-900"
                        aria-label="Toggle theme"
                    >
                        <Icon name={themeMode === 'dark' ? 'sun' : 'moon'} className="h-5 w-5" />
                    </button>
                    <button
                        type="button"
                        onClick={goSettings}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white/70 text-gray-600 shadow-sm transition hover:border-slate-300 hover:bg-white hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-white dark:focus-visible:ring-offset-slate-900"
                        aria-label="Settings"
                    >
                        <Icon name="settings" className="h-5 w-5" />
                    </button>
                    <button
                        type="button"
                        onClick={goDashboard}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white/70 text-gray-600 shadow-sm transition hover:border-slate-300 hover:bg-white hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-white dark:focus-visible:ring-offset-slate-900"
                        aria-label="Dashboard"
                    >
                        <Icon name="dashboard" className="h-5 w-5" />
                    </button>
                    <button
                        type="button"
                        onClick={logout}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white/70 text-rose-500 shadow-sm transition hover:border-rose-200 hover:bg-white hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-700 dark:bg-slate-800 dark:text-rose-300 dark:hover:border-rose-500/50 dark:hover:bg-slate-700 dark:focus-visible:ring-offset-slate-900"
                        aria-label="Sign out"
                    >
                        <Icon name="logout" className="h-5 w-5" />
                    </button>
                </>
            ) : (
                <LoginButton />
            )}
        </div>
    );
};

export default AccountControls;
