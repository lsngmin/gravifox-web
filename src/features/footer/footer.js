import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = ({ transparent = false }) => {
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

    return (
        <section className={transparent ? "bg-transparent" : "bg-white"}>
            <div className="max-w-screen-xl px-4 py-12 mx-auto space-y-6 overflow-hidden sm:px-6 lg:px-8">
                <nav className="flex flex-wrap items-center justify-center gap-4 text-sm">
                    <button
                        type="button"
                        onClick={() => goTo('/feature')}
                        className="text-sm leading-6 text-gray-500 hover:text-gray-900"
                    >
                        About
                    </button>
                    <span className="text-gray-300">·</span>
                    <button
                        type="button"
                        onClick={() => goTo('/support')}
                        className="text-sm leading-6 text-gray-500 hover:text-gray-900"
                    >
                        Contact
                    </button>
                    <span className="text-gray-300">·</span>
                    <button
                        type="button"
                        onClick={() => goTo('/docs')}
                        className="text-sm leading-6 text-gray-500 hover:text-gray-900"
                    >
                        Terms
                    </button>
                    <span className="text-gray-300">·</span>
                    <div className="inline-flex items-center gap-2">
                        <span className="text-sm text-gray-500">Language</span>
                        <div className="inline-flex rounded-md ring-1 ring-gray-200 overflow-hidden">
                            <button
                                type="button"
                                onClick={() => changeLanguage('en')}
                            className={`px-3 py-1.5 text-sm font-medium ${currentLng === 'en' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                            >
                                EN
                            </button>
                            <button
                                type="button"
                                onClick={() => changeLanguage('ko')}
                            className={`px-3 py-1.5 text-sm font-medium ${currentLng === 'ko' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                            >
                                KO
                            </button>
                        </div>
                    </div>
                </nav>
                <p className="mt-6 text-xs leading-6 text-center text-gray-400">
                    © 2025 Gravifox Project. All rights reserved.
                </p>
            </div>
        </section>
    );
};
export default Footer;
