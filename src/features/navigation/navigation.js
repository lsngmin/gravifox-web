import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PopoverGroup, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

import { useAuth } from 'providers/authProvider';
import NavigationAuthButton from 'features/navigation/components/navigationAuthButton';
import MobileNavigationAuthButton from 'features/navigation/components/mobileNavigationAuthButton';
import AvatarButton from 'features/navigation/components/avatarButton';

// PortalOverlay: forwards Transition props to a real element rendered into document.body
const PortalOverlay = React.forwardRef(function PortalOverlay({ className, ...props }, ref) {
    return createPortal(<div ref={ref} className={className} {...props} />, document.body);
});

// PortalPanel: portaled container for the mobile menu panel
const PortalPanel = React.forwardRef(function PortalPanel({ className, style, ...props }, ref) {
    return createPortal(<div ref={ref} className={className} style={style} {...props} />, document.body);
});

const Navigation = ({ variant = 'light' }) => {
    const { t } = useTranslation('common');
    const { userInfo } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [shrink, setShrink] = useState(0);
    const [reducedMotion, setReducedMotion] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const localeMatch = location.pathname.match(/^\/([a-zA-Z-]{2,5})(?=\/|$)/);
    const localePrefix = localeMatch ? `/${localeMatch[1]}` : '';

    const navItems = useMemo(
        () => [
            {
                key: 'analyze',
                labelKey: 'navigation.items.analyze',
                to: localePrefix ? `${localePrefix}/analyze/desktop` : '/analyze/desktop',
                path: '/analyze/desktop',
            },
            {
                key: 'features',
                labelKey: 'navigation.items.features',
                to: localePrefix ? `${localePrefix}/feature` : '/feature',
                path: '/feature',
            },
            {
                key: 'pricing',
                labelKey: 'navigation.items.pricing',
                to: localePrefix ? `${localePrefix}/pricing` : '/pricing',
                path: '/pricing',
            },
            {
                key: 'docs',
                labelKey: 'navigation.items.docs',
                to: localePrefix ? `${localePrefix}/docs` : '/docs',
                path: '/docs',
            },
            {
                key: 'blog',
                labelKey: 'navigation.items.blog',
                to: localePrefix ? `${localePrefix}/blog` : '/blog',
                path: '/blog',
                hash: '#blog',
            },
            {
                key: 'support',
                labelKey: 'navigation.items.support',
                to: localePrefix ? `${localePrefix}/support` : '/support',
                path: '/support',
            },
        ],
        [localePrefix]
    );

    useEffect(() => {
        let ticking = false;
        const max = 120;
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(() => {
                const y = window.scrollY || 0;
                const p = Math.max(0, Math.min(1, y / max));
                setShrink(p);
                ticking = false;
            });
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname, location.search]);

    // Respect prefers-reduced-motion and lock body scroll when menu is open
    useEffect(() => {
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        const onChange = () => setReducedMotion(media.matches);
        onChange();
        media.addEventListener?.('change', onChange);
        return () => media.removeEventListener?.('change', onChange);
    }, []);

    useEffect(() => {
        if (mobileMenuOpen) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = prev;
            };
        }
    }, [mobileMenuOpen]);

    // Close on ESC for accessibility
    useEffect(() => {
        if (!mobileMenuOpen) return;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') setMobileMenuOpen(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [mobileMenuOpen]);

    const isDark = variant === 'dark';

    const headerStyle = useMemo(() => {
        const lerp = (a, b, t) => a + (b - a) * t;
        const top = lerp(0, 20, shrink);
        const side = lerp(0, 16, shrink);
        const radius = lerp(0, 20, shrink);
        const scale = lerp(1, 0.95, shrink);
        const backgroundOpacity = lerp(isDark ? 0.9 : 0.98, isDark ? 0.86 : 0.94, shrink);
        const shadowStrength = lerp(isDark ? 0.4 : 0.18, isDark ? 0.2 : 0.12, shrink);
        const borderAlpha = lerp(isDark ? 0.35 : 0.55, isDark ? 0.2 : 0.3, shrink);

        const insetVisible = shrink > 0.06;
        const sideInset = insetVisible ? side : 0;
        const radiusValue = radius ? `${radius}px` : undefined;

        const baseColor = isDark ? [15, 23, 42] : [255, 255, 255];
        const shadowColor = isDark ? [8, 11, 24] : [15, 23, 42];
        const borderColor = isDark ? [51, 65, 85] : [226, 232, 240];

        return {
            left: sideInset ? `${sideInset}px` : '0px',
            right: sideInset ? `${sideInset}px` : '0px',
            top: `${top}px`,
            borderRadius: radiusValue,
            transform: `scale(${scale.toFixed(3)})`,
            backgroundColor: `rgba(${baseColor[0]},${baseColor[1]},${baseColor[2]},${backgroundOpacity.toFixed(2)})`,
            boxShadow: `0 18px 32px -24px rgba(${shadowColor[0]},${shadowColor[1]},${shadowColor[2]},${shadowStrength.toFixed(2)})`,
            border: `1px solid rgba(${borderColor[0]}, ${borderColor[1]}, ${borderColor[2]}, ${borderAlpha.toFixed(2)})`,
            willChange: 'left,right,top,border-radius,box-shadow,transform,background-color,border',
        };
    }, [shrink, isDark]);

    const composedHeaderStyle = useMemo(() => {
        if (!mobileMenuOpen) {
            return { ...headerStyle, zIndex: 40 };
        }
        // Keep existing transform/scale so header doesn't "grow" on open.
        return { ...headerStyle, zIndex: 60 };
    }, [headerStyle, mobileMenuOpen]);

    const normalizePath = useCallback(
        (path) => {
            if (!path) return '/';
            const [clean] = path.split(/[?#]/);
            if (!clean) return '/';
            const withoutLocale =
                localePrefix && clean.startsWith(localePrefix)
                    ? clean.slice(localePrefix.length) || '/'
                    : clean;
            let normalized = withoutLocale.startsWith('/') ? withoutLocale : `/${withoutLocale}`;
            if (normalized.length > 1) {
                while (normalized.length > 1 && normalized.endsWith('/')) {
                    normalized = normalized.slice(0, -1);
                }
            }
            return normalized || '/';
        },
        [localePrefix]
    );

    const currentPath = normalizePath(location.pathname);
    const currentHash = location.hash || '';

    const activeItemKey = useMemo(() => {
        const match = navItems.find((item) => {
            const normalizedItemPath = normalizePath(item.path);
            if (normalizedItemPath !== currentPath) {
                return false;
            }
            if (item.hash) {
                return currentHash === item.hash;
            }
            return true;
        });
        return match?.key || null;
    }, [navItems, currentPath, currentHash, normalizePath]);

    const highlightStrength = useMemo(() => {
        const eased = Math.max(0, Math.min(1, (shrink - 0.1) / 0.9));
        return Number.isFinite(eased) ? eased : 0;
    }, [shrink]);

    const isLoggedIn = Boolean(userInfo);
    const displayName = userInfo?.nickname || userInfo?.userId || '';
    const displayEmail = userInfo?.userId || '';
    const userInitials = useMemo(() => {
        const src = displayName || displayEmail || 'U';
        const trimmed = (src || '').trim();
        if (!trimmed) return 'U';
        const letters = trimmed.replace(/[^A-Za-z0-9가-힣]/g, '');
        return letters.slice(0, 1).toUpperCase() || 'U';
    }, [displayName, displayEmail]);

    const loginPath = localePrefix ? `${localePrefix}/login` : '/login';
    const settingsPath = localePrefix ? `${localePrefix}/settings` : '/settings';

    const buildLinkTarget = (item) => {
        if (item.hash) {
            return { pathname: item.to, hash: item.hash };
        }
        return item.to;
    };

    return (
        <header
            className={`fixed inset-x-0 top-0 z-40 transition-[padding,top,border-radius,transform,background,backdrop-filter,box-shadow,left,right] duration-400 ease-out ${
                isDark ? 'text-slate-100' : ''
            }`}
            style={composedHeaderStyle}
        >
            <div className="relative">
                <nav
                    aria-label="Global"
                    className={`mx-auto flex items-center justify-between px-6 py-4 lg:px-8 ${isDark ? 'text-slate-100' : ''}`}
                    style={{ paddingBlock: `${(16 - 6 * shrink).toFixed(1)}px`, paddingInline: `${(24 - 8 * shrink).toFixed(1)}px` }}
                >
                    <div className="flex items-center gap-x-6 lg:gap-x-10 lg:flex-1">
                        <a href="/" className="-m-1.5 p-1.5 relative z-20 mr-4 lg:mr-6">
                            <span className="sr-only">gravifox</span>
                            <div className="flex justify-center">
                                <h1
                                    onClick={() => navigate('/')}
                                    translate="no"
                                    className="cursor-pointer select-none text-[clamp(16px,3vw,28px)] font-extrabold tracking-tight leading-none text-indigo-500 drop-shadow-md"
                                >
                                    GRAVIFOX.
                                </h1>
                            </div>
                        </a>
                        <PopoverGroup className="hidden lg:flex lg:gap-x-8 pt-0.5">
                            {navItems.map((item) => {
                                const isActive = activeItemKey === item.key;
                                const highlightLevel = isActive ? highlightStrength : 0;
                                const showHighlight = highlightLevel > 0;
                                const linkClasses = `group relative inline-flex text-[1.05rem] font-bold tracking-wide transition-colors duration-200 ${
                                    isDark
                                        ? isActive
                                            ? 'text-indigo-200'
                                            : 'text-slate-300 hover:text-white'
                                        : isActive
                                              ? 'text-indigo-600'
                                              : 'text-gray-700 hover:text-gray-900'
                                }`;
                                const pillClasses = `inline-flex items-center justify-center rounded-full border px-3.5 py-1.5 text-current transition-all duration-300 leading-tight ${
                                    showHighlight
                                        ? isDark
                                            ? 'bg-indigo-500/15 border-indigo-400/50'
                                            : 'bg-indigo-50/90 border-indigo-200'
                                        : isDark
                                            ? 'border-slate-700/70 group-hover:border-indigo-500/40 group-hover:bg-indigo-500/10'
                                            : 'border-transparent group-hover:border-indigo-100 group-hover:bg-indigo-50/70'
                                }`;
                                const highlightStyle = showHighlight
                                    ? isDark
                                        ? {
                                              boxShadow: `0 12px 28px -18px rgba(99, 102, 241, ${(0.28 + 0.15 * highlightLevel).toFixed(2)})`,
                                              borderColor: `rgba(99, 102, 241, ${(0.55 + 0.25 * highlightLevel).toFixed(2)})`,
                                              backgroundColor: `rgba(76, 81, 191, ${(0.18 + 0.1 * highlightLevel).toFixed(2)})`,
                                          }
                                        : {
                                              boxShadow: `0 12px 28px -18px rgba(79, 70, 229, ${(0.35 + 0.2 * highlightLevel).toFixed(2)})`,
                                              borderColor: `rgba(129, 140, 248, ${(0.6 + 0.25 * highlightLevel).toFixed(2)})`,
                                              backgroundColor: `rgba(238, 242, 255, ${(0.9 + 0.08 * highlightLevel).toFixed(2)})`,
                                          }
                                    : undefined;
                                const label = t(item.labelKey);

                                return (
                                    <Link key={item.key} to={buildLinkTarget(item)} className={linkClasses}>
                                        <span className={pillClasses} style={highlightStyle}>
                                            {label}
                                        </span>
                                    </Link>
                                );
                            })}
                        </PopoverGroup>
                    </div>
                    <div className="flex items-center gap-3 lg:hidden relative z-20">
                        {!mobileMenuOpen && !isLoggedIn && (
                            <Link
                                to={loginPath}
                                className="inline-flex items-center justify-center gap-1 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                            >
                                {t('navigation.actions.login')}
                            </Link>
                        )}
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen((prev) => !prev)}
                            className={`-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 transition ${
                                isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800/80' : 'text-gray-700'
                            }`}
                            aria-expanded={mobileMenuOpen}
                            aria-controls="mobile-main-menu"
                            aria-label={mobileMenuOpen ? t('navigation.closeMenu') : t('navigation.openMenu')}
                        >
                            <span className="sr-only">{mobileMenuOpen ? t('navigation.closeMenu') : t('navigation.openMenu')}</span>
                            {mobileMenuOpen ? (
                                <XMarkIcon aria-hidden="true" className="size-6" />
                            ) : (
                                <Bars3Icon aria-hidden="true" className="size-6" />
                            )}
                        </button>
                    </div>
                    <div className="hidden lg:flex lg:flex-1 lg:justify-end">
                        <NavigationAuthButton />
                    </div>
                </nav>

                {(() => {
                    const enterBase = reducedMotion
                        ? 'transition-none'
                        : 'transform-gpu transition-all duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)]';
                    const leaveBase = reducedMotion
                        ? 'transition-none'
                        : 'transform-gpu transition-all duration-[1000ms] ease-[cubic-bezier(0.4,0,0.2,1)]';
                    const enterFrom = reducedMotion ? 'opacity-0' : 'opacity-0 -translate-y-2';
                    const enterTo = 'opacity-100 translate-y-0';
                    const leaveFrom = 'opacity-100 translate-y-0';
                    const leaveTo = reducedMotion ? 'opacity-0' : 'opacity-0 -translate-y-1';
                    return (
                        <Transition show={mobileMenuOpen} as={Fragment} appear>
                            <Transition.Child
                                as={PortalOverlay}
                                enter={reducedMotion ? 'transition-none' : 'transition-opacity duration-[700ms] ease-out'}
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave={reducedMotion ? 'transition-none' : 'transition-opacity duration-[600ms] ease-in'}
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                                className="fixed inset-0 z-[70] bg-slate-900/35 backdrop-blur-[2px]"
                                onClick={() => setMobileMenuOpen(false)}
                            />
                            <Transition.Child
                                as={PortalPanel}
                                enter={enterBase}
                                enterFrom={enterFrom}
                                enterTo={enterTo}
                                leave={leaveBase}
                                leaveFrom={leaveFrom}
                                leaveTo={leaveTo}
                                className="fixed inset-0 lg:hidden z-[80] flex items-center justify-center px-6"
                                id="mobile-main-menu"
                                role="dialog"
                                aria-modal="true"
                                aria-label="Mobile menu"
                                style={{ willChange: 'transform, opacity' }}
                            >
                                <div className="w-full max-w-lg py-6">
                                    <div
                                        className={`w-full relative rounded-3xl border px-5 pb-8 pt-4 sm:px-6 ${
                                            isDark
                                                ? 'border-slate-700/60 bg-slate-900/95 text-slate-100 shadow-[0_28px_48px_-24px_rgba(8,11,24,0.65)]'
                                                : 'border-slate-200 bg-white text-slate-900 shadow-[0_22px_48px_-22px_rgba(15,23,42,0.32)]'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                {isLoggedIn ? (
                                                    <div
                                                        className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
                                                            isDark
                                                                ? 'bg-indigo-500/15 text-indigo-100'
                                                                : 'bg-indigo-50/70 text-slate-700'
                                                        }`}
                                                    >
                                                        <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs sm:text-sm font-semibold text-white">
                                                            {userInitials}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p
                                                                className={`text-sm font-semibold whitespace-normal break-words ${
                                                                    isDark ? 'text-slate-100' : 'text-slate-900'
                                                                }`}
                                                            >
                                                                {displayName || t('navigation.welcomeBack')}
                                                            </p>
                                                            {displayEmail && (
                                                                <p
                                                                    className={`text-xs break-all whitespace-normal ${
                                                                        isDark ? 'text-slate-400' : 'text-slate-500'
                                                                    }`}
                                                                >
                                                                    {displayEmail}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <Link
                                                            to={settingsPath}
                                                            onClick={() => setMobileMenuOpen(false)}
                                                            aria-label={t('navigation.actions.settings', 'Settings')}
                                                            className={`ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition active:scale-95 ${
                                                                isDark
                                                                    ? 'text-indigo-100 hover:bg-indigo-500/30 hover:text-white'
                                                                    : 'text-indigo-500 hover:bg-indigo-100/80 hover:text-indigo-600'
                                                            }`}
                                                        >
                                                            <Cog6ToothIcon aria-hidden="true" className="size-5" />
                                                        </Link>
                                                    </div>
                                                ) : (
                                                    <div
                                                        className={`rounded-2xl px-4 py-2.5 text-[13px] font-medium leading-tight ${
                                                            isDark ? 'bg-slate-800/80 text-slate-200' : 'bg-slate-50 text-slate-600'
                                                        }`}
                                                    >
                                                        <span className="block whitespace-normal break-words">{t('navigation.ctaGuest')}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {!isLoggedIn && (
                                                    <Link
                                                        to={settingsPath}
                                                        onClick={() => setMobileMenuOpen(false)}
                                                        aria-label={t('navigation.actions.settings', 'Settings')}
                                                        className={`-m-2 flex h-10 w-10 items-center justify-center rounded-md transition active:scale-95 ${
                                                            isDark
                                                                ? 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                                                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                                                        }`}
                                                    >
                                                        <Cog6ToothIcon aria-hidden="true" className="size-6" />
                                                    </Link>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    aria-label={t('navigation.closeMenu')}
                                                    className={`-m-2 flex h-10 w-10 items-center justify-center rounded-md transition active:scale-95 ${
                                                        isDark
                                                            ? 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                                                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                                                    }`}
                                                >
                                                    <XMarkIcon aria-hidden="true" className="size-6" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            <nav aria-label={t('navigation.mobileMenuLabel', '주요 내비게이션')}>
                                                <ul className="flex flex-col gap-2">
                                                    {navItems.map((item) => {
                                                        const isActive = activeItemKey === item.key;
                                                        return (
                                                            <li key={item.key}>
                                                                <Link
                                                                    to={buildLinkTarget(item)}
                                                                    onClick={() => setMobileMenuOpen(false)}
                                                                    aria-current={isActive ? 'page' : undefined}
                                                                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-base font-semibold transition-all duration-200 ${
                                                                        isActive
                                                                            ? isDark
                                                                                ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-100 shadow-sm'
                                                                                : 'border-indigo-200 bg-indigo-50 text-indigo-600 shadow-sm'
                                                                            : isDark
                                                                                  ? 'border-slate-700/70 bg-slate-900/70 text-slate-200 hover:border-indigo-500/40 hover:bg-indigo-500/15 hover:text-indigo-100'
                                                                                  : 'border-slate-200/60 bg-white text-slate-700 hover:border-indigo-100 hover:bg-indigo-50/70 hover:text-indigo-600'
                                                                    }`}
                                                                >
                                                                    <span>{t(item.labelKey)}</span>
                                                                    <span
                                                                        aria-hidden="true"
                                                                        className={`text-sm font-medium transition-transform duration-200 ${
                                                                            isActive
                                                                                ? isDark
                                                                                    ? 'translate-x-0 text-indigo-300'
                                                                                    : 'translate-x-0 text-indigo-500'
                                                                                : isDark
                                                                                      ? 'translate-x-1 text-slate-500'
                                                                                      : 'translate-x-1 text-slate-400'
                                                                        }`}
                                                                    >
                                                                        →
                                                                    </span>
                                                                </Link>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </nav>
                                        </div>
                                        <div
                                            className={`mt-6 border-t pt-6 ${
                                                isDark ? 'border-slate-700/60' : 'border-slate-200'
                                            }`}
                                        >
                                            <MobileNavigationAuthButton
                                                localePrefix={localePrefix}
                                                onNavigate={() => setMobileMenuOpen(false)}
                                                variant={variant}
                                            />
                                        </div>
                                        </div>
                                    </div>
                            </Transition.Child>
                        </Transition>
                    );
                })()}
            </div>
        </header>
    );
};

export default Navigation;
