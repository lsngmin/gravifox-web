import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = ({ transparent = false, inline = false, variant = 'light', showLinks = true }) => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const currentLng = useMemo(() => (i18n.language || 'en').slice(0,2), [i18n.language]);

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

    const isDark = variant === 'dark';

    return (
        <section className={transparent ? "bg-transparent" : isDark ? "bg-slate-950" : "bg-white"}>
            <div className="max-w-screen-xl px-4 py-12 mx-auto space-y-6 overflow-hidden sm:px-6 lg:px-8">
                <nav className={`${inline ? 'flex flex-nowrap overflow-x-auto whitespace-nowrap' : 'flex flex-wrap'} items-center justify-center gap-x-6 gap-y-4 text-sm`}>
                    {showLinks && (
                        <div className={`${inline ? 'flex flex-nowrap' : 'flex flex-wrap'} items-center justify-center gap-x-4 gap-y-2 text-sm`}>
                            <button
                                type="button"
                                onClick={() => goTo('/feature')}
                                className={`text-sm leading-6 ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                About
                            </button>
                            <span className={isDark ? 'text-slate-600' : 'text-gray-300'}>·</span>
                            <button
                                type="button"
                                onClick={() => goTo('/support')}
                                className={`text-sm leading-6 ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                Contact
                            </button>
                            <span className={isDark ? 'text-slate-600' : 'text-gray-300'}>·</span>
                            <button
                                type="button"
                                onClick={() => goTo('/docs')}
                                className={`text-sm leading-6 ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                Terms
                            </button>
                        </div>
                    )}
                    <div className={`${inline ? 'flex flex-nowrap' : 'flex flex-wrap'} items-center justify-center gap-2`}>
                        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Language</span>
                        <div className={`inline-flex overflow-hidden rounded-md ring-1 ${isDark ? 'ring-slate-700' : 'ring-gray-200'}`}>
                            <button
                                type="button"
                                onClick={() => changeLanguage('en')}
                                className={`px-3 py-1.5 text-sm font-medium ${currentLng === 'en' ? 'bg-indigo-600 text-white' : isDark ? 'bg-slate-900/70 text-slate-300 hover:bg-slate-800/70' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                            >
                                EN
                            </button>
                            <button
                                type="button"
                                onClick={() => changeLanguage('ko')}
                                className={`px-3 py-1.5 text-sm font-medium ${currentLng === 'ko' ? 'bg-indigo-600 text-white' : isDark ? 'bg-slate-900/70 text-slate-300 hover:bg-slate-800/70' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                            >
                                KO
                            </button>
                        </div>
                    </div>
                </nav>
                <p className={`mt-6 text-xs leading-6 text-center ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                    © 2025 Gravifox Project. All rights reserved.
                </p>
            </div>
        </section>
    );
};
export default Footer;
