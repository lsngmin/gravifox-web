import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';

const THEME_STORAGE_KEY = 'preferred-theme';

const getPreferredTheme = () => {
    if (typeof window === 'undefined') return 'light';
    const read = () => {
        try {
            const stored =
                window.localStorage?.getItem(THEME_STORAGE_KEY) ??
                window.sessionStorage?.getItem(THEME_STORAGE_KEY) ??
                null;
            if (stored === 'dark' || stored === 'light') return stored;
        } catch {}
        return null;
    };
    const stored = read();
    if (stored) return stored;

    try {
        if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
    } catch {}
    return 'light';
};

const Footer = () => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const currentLng = useMemo(() => (i18n.language || 'en').slice(0,2), [i18n.language]);
    const [theme, setTheme] = useState(() => getPreferredTheme());

    const changeLanguage = (next) => {
        const supported = ['en','ko'];
        const lng = supported.includes(next) ? next : 'en';
        try { i18n.changeLanguage(lng); localStorage.setItem('i18nextLng', lng); } catch {}
        const stripLang = (path) => {
            if (path === '/en' || path === '/ko') return '/';
            if (path.startsWith('/en/')) return path.substring(3);
            if (path.startsWith('/ko/')) return path.substring(3);
            return path;
        };
        const pathNoLng = stripLang(location.pathname || '/');
        const nextPath = `/${lng}${pathNoLng === '/' ? '' : pathNoLng}${location.search || ''}${location.hash || ''}`;
        navigate(nextPath, { replace: true });
    };

    const goTo = (path) => {
        const next = path.startsWith('/') ? path : `/${path}`;
        navigate(`/${currentLng}${next}`);
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const syncTheme = () => setTheme(getPreferredTheme());
        window.addEventListener('focus', syncTheme);
        window.addEventListener('storage', syncTheme);
        window.addEventListener('preferred-theme-change', syncTheme);
        return () => {
            window.removeEventListener('focus', syncTheme);
            window.removeEventListener('storage', syncTheme);
            window.removeEventListener('preferred-theme-change', syncTheme);
        };
    }, []);

    const applyTheme = (next) => {
        if (next !== 'dark' && next !== 'light') return;
        setTheme(next);
        if (typeof window === 'undefined') return;
        try {
            window.localStorage?.setItem(THEME_STORAGE_KEY, next);
            window.sessionStorage?.setItem(THEME_STORAGE_KEY, next);
        } catch {}
        window.dispatchEvent(new CustomEvent('preferred-theme-change', { detail: next }));
    };

    const isDark = theme === 'dark';

    const languageShellClass = isDark
        ? 'inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-1.5 py-1 shadow-sm shadow-black/30 backdrop-blur'
        : 'inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white/80 px-1.5 py-1 shadow-sm shadow-slate-200/70 backdrop-blur';
    const languageTabClass = (active) => [
        'px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        active
            ? isDark
                ? 'bg-white text-slate-900 shadow-sm shadow-white/40 ring-white/70 ring-offset-0'
                : 'bg-slate-900 text-white shadow-sm shadow-slate-900/30 ring-slate-900/40 ring-offset-white'
            : isDark
                ? 'text-white/80 hover:bg-white/10 hover:text-white ring-white/60 ring-offset-0'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 ring-slate-400/60 ring-offset-white'
    ].join(' ');
    const themeShellClass = isDark
        ? 'inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-1 py-1 shadow-sm shadow-black/30 backdrop-blur'
        : 'inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white/80 px-1 py-1 shadow-sm shadow-slate-200/70 backdrop-blur';
    const themeTabClass = (active) => [
        'px-2.5 py-1 text-xs font-semibold uppercase tracking-wide rounded-full flex items-center justify-center gap-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        active
            ? isDark
                ? 'bg-white text-slate-900 shadow-sm shadow-white/40 ring-white/70 ring-offset-0'
                : 'bg-slate-900 text-white shadow-sm shadow-slate-900/30 ring-slate-900/40 ring-offset-white'
            : isDark
                ? 'text-white/80 hover:bg-white/10 hover:text-white ring-white/60 ring-offset-0'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 ring-slate-400/60 ring-offset-white'
    ].join(' ');
    const linkClass = 'text-sm leading-6 text-inherit transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2';

    return (
        <section className="bg-inherit text-inherit">
            <div className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 text-sm text-inherit">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <div className={languageShellClass}>
                            <button
                                type="button"
                                onClick={() => changeLanguage('en')}
                                className={languageTabClass(currentLng === 'en')}
                                aria-pressed={currentLng === 'en'}
                            >
                                EN
                            </button>
                            <button
                                type="button"
                                onClick={() => changeLanguage('ko')}
                                className={languageTabClass(currentLng === 'ko')}
                                aria-pressed={currentLng === 'ko'}
                            >
                                KO
                            </button>
                        </div>
                    </div>
                    <span className="text-base leading-none opacity-50" aria-hidden="true">·</span>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <div className={themeShellClass}>
                            <button
                                type="button"
                                onClick={() => applyTheme('light')}
                                className={themeTabClass(theme !== 'dark')}
                                aria-pressed={theme !== 'dark'}
                            >
                                <SunIcon className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => applyTheme('dark')}
                                className={themeTabClass(theme === 'dark')}
                                aria-pressed={theme === 'dark'}
                            >
                                <MoonIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-inherit">
                    <button
                        type="button"
                        onClick={() => goTo('/feature')}
                        className={linkClass}
                    >
                        About
                    </button>
                    <span className="opacity-50">·</span>
                    <button
                        type="button"
                        onClick={() => goTo('/support')}
                        className={linkClass}
                    >
                        Contact
                    </button>
                    <span className="opacity-50">·</span>
                    <button
                        type="button"
                        onClick={() => goTo('/docs')}
                        className={linkClass}
                    >
                        Terms
                    </button>
                </div>

                <p className="mt-6 text-center text-xs leading-6 opacity-60">
                    © 2025 Gravifox Project. All rights reserved.
                </p>
            </div>
        </section>
    );
};
export default Footer;
