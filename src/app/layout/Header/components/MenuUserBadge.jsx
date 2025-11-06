import React from 'react';
import { useNavigate } from 'react-router-dom';

import Icon from 'app/components/icons/Icon';
import { useThemeMode } from 'app/hooks/useThemeMode';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'providers/authProvider';
import { Menu, MenuButton, MenuItems } from '@headlessui/react';
import LocaleSelector from './LocaleSelector';

import { useHeaderContext } from '../context';

const MenuUserBadge = ({ onNavigate }) => {
    const { userInfo } = useAuth();
    const { themeMode, toggleTheme } = useThemeMode();
    const { localePrefix, closeMenu } = useHeaderContext();
    const { t } = useTranslation('common');
    const navigate = useNavigate();

    if (!userInfo) {
        return null;
    }

    const displayName = userInfo?.nickname || userInfo?.userId || '';
    const displayEmail = userInfo?.userId || '';

    const goSettings = () => {
        const settingsPath = localePrefix ? `${localePrefix}/settings` : '/settings';
        navigate(settingsPath);
        if (typeof onNavigate === 'function') {
            onNavigate();
        }
    };

    const isDark = themeMode === 'dark';

    return (
        <div className="flex items-center justify-between gap-4 border-b border-slate-200/70 px-4 py-4 dark:border-slate-800">
            <div className="text-left">
                <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{displayName}</p>
                {displayEmail ? (
                    <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">{displayEmail}</p>
                ) : null}
            </div>
            <div className="flex items-center gap-2">
                <Menu as="div" className="relative z-10">
                    <MenuButton
                        type="button"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/70 bg-white/80 text-gray-600 shadow-sm transition hover:border-slate-300 hover:bg-white hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-white dark:focus-visible:ring-offset-slate-900"
                        aria-label={t('navigation.actions.changeLanguage', '언어 변경')}
                        title={t('navigation.actions.changeLanguage', '언어 변경')}
                    >
                        <Icon name="globe" className="h-[18px] w-[18px] text-indigo-500" />
                    </MenuButton>
                    <MenuItems
                        transition
                        className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-xl bg-white text-gray-700 shadow-xl ring-1 ring-black/5 transition data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-150 data-[leave]:duration-100 data-[enter]:ease-out data-[leave]:ease-in dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700/70"
                    >
                        <LocaleSelector variant="menu" onSelect={closeMenu} />
                    </MenuItems>
                </Menu>
                <button
                    type="button"
                    onClick={toggleTheme}
                    aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
                    aria-pressed={isDark}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/70 bg-white/80 text-gray-600 shadow-sm transition hover:border-slate-300 hover:bg-white hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-white dark:focus-visible:ring-offset-slate-900"
                >
                    {isDark ? (
                        <Icon name="sun" className="h-[18px] w-[18px] text-amber-400" />
                    ) : (
                        <Icon name="moon" className="h-[18px] w-[18px] text-slate-600" />
                    )}
                </button>
                <button
                    type="button"
                    onClick={goSettings}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/70 bg-white/80 text-gray-600 shadow-sm transition hover:border-slate-300 hover:bg-white hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-white dark:focus-visible:ring-offset-slate-900"
                    aria-label="Settings"
                >
                    <Icon name="settings" className="h-[18px] w-[18px]" />
                </button>
            </div>
        </div>
    );
};

export default MenuUserBadge;
