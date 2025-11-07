import React from 'react';
import { useTranslation } from 'react-i18next';

import Icon from 'app/components/icons/Icon';
import { useThemeMode } from 'app/hooks/useThemeMode';

import LocaleSelector from './LocaleSelector';
import { useHeaderContext } from '../context';

const MenuGuestPreferences = () => {
    const { closeMenu } = useHeaderContext();
    const { themeMode, toggleTheme } = useThemeMode();
    const { t } = useTranslation('common');

    const isDark = themeMode === 'dark';

    return (
        <div className="space-y-4">
            <LocaleSelector onSelect={closeMenu} />
            <section className="rounded-2xl border border-gray-200 bg-white/75 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                            {t('navigation.theme.title', '테마')}
                        </p>
                        <p className="mt-1 text-sm text-gray-700 dark:text-slate-200">
                            {isDark
                                ? t('navigation.theme.currentDark', '다크 모드 사용 중')
                                : t('navigation.theme.currentLight', '라이트 모드 사용 중')}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={toggleTheme}
                        aria-label={t('navigation.actions.toggleTheme', '테마 전환')}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-gray-600 shadow-sm transition hover:border-slate-300 hover:bg-white hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-white dark:focus-visible:ring-offset-slate-900"
                    >
                        {isDark ? (
                            <Icon name="sun" className="h-5 w-5 text-amber-400" />
                        ) : (
                            <Icon name="moon" className="h-5 w-5 text-slate-600" />
                        )}
                    </button>
                </div>
            </section>
        </div>
    );
};

export default MenuGuestPreferences;
