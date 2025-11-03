import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from 'providers/authProvider';

import LoginButton from './LoginButton';
import UsageBadge from './UsageBadge';
import { useHeaderContext } from '../context';
import { useThemeMode } from '../../../hooks/useThemeMode';
import Icon from 'app/components/icons/Icon';
import { Menu, MenuButton, MenuItems } from '@headlessui/react';
import LocaleSelector from './LocaleSelector';
import { useTranslation } from 'react-i18next';

const TooltipIconButton = ({ label, onClick, icon, danger }) => (
    <div className="relative group">
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            title={label}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full border bg-white/70 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-slate-800 dark:focus-visible:ring-offset-slate-900
            ${danger
                ? 'border-slate-200/80 text-rose-500 hover:border-rose-200 hover:text-rose-600 dark:border-slate-700 dark:text-rose-300 dark:hover:border-rose-500/50'
                : 'border-slate-200/80 text-gray-600 hover:border-slate-300 hover:text-gray-900 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600'}
            `}
        >
            {icon}
        </button>
        <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-slate-700">
            {label}
        </span>
    </div>
);

const AccountControls = () => {
    const { userInfo, logout } = useAuth();
    const { localePrefix } = useHeaderContext();
    const { themeMode, toggleTheme } = useThemeMode();
    const navigate = useNavigate();

    const isLoggedIn = Boolean(userInfo);
    const { t } = useTranslation('common');
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
                    <TooltipIconButton
                        label={t('navigation.actions.toggleTheme', '테마 전환')}
                        onClick={toggleTheme}
                        icon={<Icon name={themeMode === 'dark' ? 'sun' : 'moon'} className="h-5 w-5" />}
                    />
                    <TooltipIconButton
                        label={t('navigation.actions.settings', '설정')}
                        onClick={goSettings}
                        icon={<Icon name="settings" className="h-5 w-5" />}
                    />
                    <TooltipIconButton
                        label={t('navigation.actions.viewDashboard', '대시보드')}
                        onClick={goDashboard}
                        icon={<Icon name="dashboard" className="h-5 w-5" />}
                    />

                    {/* Language quick menu */}
                    <div className="relative group">
                    <Menu as="div" className="relative z-10">
                        <MenuButton
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white/70 text-gray-600 shadow-sm transition hover:border-slate-300 hover:bg-white hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-white dark:focus-visible:ring-offset-slate-900"
                            aria-label={t('navigation.actions.changeLanguage', '언어 변경')}
                            title={t('navigation.actions.changeLanguage', '언어 변경')}
                        >
                            <Icon name="globe" className="h-5 w-5" />
                        </MenuButton>
                        <MenuItems
                            transition
                            className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-xl bg-white text-gray-700 shadow-xl ring-1 ring-black/5 transition data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-150 data-[leave]:duration-100 data-[enter]:ease-out data-[leave]:ease-in dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700/70"
                        >
                            <LocaleSelector variant="menu" />
                        </MenuItems>
                    </Menu>
                    <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-slate-700">
                        {t('navigation.actions.changeLanguage', '언어 변경')}
                    </span>
                    </div>
                    <TooltipIconButton
                        label={t('navigation.actions.logout', '로그아웃')}
                        onClick={logout}
                        icon={<Icon name="logout" className="h-5 w-5" />}
                        danger
                    />
                </>
            ) : (
                <LoginButton />
            )}
        </div>
    );
};

export default AccountControls;
