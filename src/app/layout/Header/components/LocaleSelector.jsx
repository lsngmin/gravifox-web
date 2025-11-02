import React from 'react';
import { MenuItem } from '@headlessui/react';
import { useTranslation } from 'react-i18next';

import Icon from 'app/components/icons/Icon';

import { useHeaderContext } from '../context';

const LOCALES = [
    { code: 'en', label: 'English' },
    { code: 'ko', label: '한국어' },
];

const LocaleSelector = ({ variant = 'list', onSelect }) => {
    const { currentLocale, navigateWithLocale } = useHeaderContext();
    const { i18n, t } = useTranslation('common');

    const handleChange = (locale) => {
        const base = locale.slice(0, 2);
        try {
            i18n.changeLanguage(base);
        } catch (error) {
            // i18n 인스턴스가 준비되지 않았더라도 네비게이션은 계속 진행합니다.
        }
        if (typeof window !== 'undefined') {
            try {
                window.localStorage.setItem('i18nextLng', base);
            } catch (error) {
                // 저장 실패는 무시합니다.
            }
        }
        navigateWithLocale(base);
        if (typeof onSelect === 'function') {
            onSelect(base);
        }
    };

    if (variant === 'menu') {
        return (
            <div className="border-t border-gray-100 py-1 dark:border-slate-700">
                <p className="px-4 pt-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">
                    {t('navigation.language.title', 'Language')}
                </p>
                {LOCALES.map((locale) => (
                    <MenuItem key={locale.code}>
                        {({ active }) => (
                            <button
                                type="button"
                                onClick={() => handleChange(locale.code)}
                                className={`${
                                    active
                                        ? 'bg-gray-100 text-gray-900 dark:bg-slate-800 dark:text-slate-100'
                                        : 'text-gray-700 dark:text-slate-300'
                                } flex w-full items-center gap-3 px-4 py-2 text-sm`}
                            >
                                <Icon name="globe" className="h-5 w-5 text-indigo-500" />
                                <span className="flex-1 text-left">{locale.label}</span>
                                {currentLocale?.startsWith(locale.code) && (
                                    <span className="text-xs font-medium text-indigo-500 dark:text-indigo-300">
                                        {t('navigation.language.current', '선택됨')}
                                    </span>
                                )}
                            </button>
                        )}
                    </MenuItem>
                ))}
            </div>
        );
    }

    return (
        <section className="rounded-2xl border border-gray-200 bg-white/75 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                {t('navigation.language.title', '언어')}
            </h3>
            <div className="mt-2 grid gap-1.5">
                {LOCALES.map((locale) => {
                    const isActive = currentLocale?.startsWith(locale.code);
                    return (
                        <button
                            key={locale.code}
                            type="button"
                            onClick={() => handleChange(locale.code)}
                            className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                                isActive
                                    ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/50 dark:bg-indigo-500/15 dark:text-indigo-100'
                                    : 'border-transparent bg-white/60 text-gray-700 hover:border-gray-200 hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800'
                            }`}
                        >
                            <Icon name="globe" className="h-5 w-5 text-indigo-500" />
                            <span className="flex-1 text-left">{locale.label}</span>
                            {isActive && (
                                <span className="text-xs text-indigo-500 dark:text-indigo-300">
                                    {t('navigation.language.currentShort', '현재')}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </section>
    );
};

export default LocaleSelector;
