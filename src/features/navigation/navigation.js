import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PopoverGroup, Transition } from '@headlessui/react';
import { Bars3Icon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';

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

const Navigation = () => {
    const { userInfo } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [shrink, setShrink] = useState(0);
    const [reducedMotion, setReducedMotion] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const localeMatch = location.pathname.match(/^\/([a-zA-Z-]{2,5})(?=\/|$)/);
    const localePrefix = localeMatch ? `/${localeMatch[1]}` : '';

    const navItems = useMemo(() => ([
        { key: 'analyze', label: 'Analyze', to: localePrefix ? `${localePrefix}/analyze` : '/analyze', path: '/analyze' },
        { key: 'features', label: 'Features', to: localePrefix ? `${localePrefix}/feature` : '/feature', path: '/feature' },
        { key: 'pricing', label: 'Pricing', to: localePrefix ? `${localePrefix}/pricing` : '/pricing', path: '/pricing' },
        { key: 'docs', label: 'Docs', to: localePrefix ? `${localePrefix}/docs` : '/docs', path: '/docs' },
        { key: 'blog', label: 'Blog', to: localePrefix ? `${localePrefix}/blog` : '/blog', path: '/blog', hash: '#blog' },
        { key: 'support', label: 'Support', to: localePrefix ? `${localePrefix}/support` : '/support', path: '/support' },
    ]), [localePrefix]);

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

    const headerStyle = useMemo(() => {
        const lerp = (a, b, t) => a + (b - a) * t;
        const top = lerp(0, 20, shrink);
        const side = lerp(0, 16, shrink);
        const radius = lerp(0, 20, shrink);
        const scale = lerp(1, 0.95, shrink);
        const backgroundOpacity = lerp(0.98, 0.94, shrink);
        const shadowStrength = lerp(0.18, 0.12, shrink);
        const borderAlpha = lerp(0.55, 0.3, shrink);

        const insetVisible = shrink > 0.06;
        const sideInset = insetVisible ? side : 0;
        const radiusValue = radius ? `${radius}px` : undefined;

        return {
            left: sideInset ? `${sideInset}px` : '0px',
            right: sideInset ? `${sideInset}px` : '0px',
            top: `${top}px`,
            borderRadius: radiusValue,
            transform: `scale(${scale.toFixed(3)})`,
            backgroundColor: `rgba(255,255,255,${backgroundOpacity.toFixed(2)})`,
            boxShadow: `0 18px 32px -24px rgba(15,23,42,${shadowStrength.toFixed(2)})`,
            border: `1px solid rgba(226, 232, 240, ${borderAlpha.toFixed(2)})`,
            willChange: 'left,right,top,border-radius,box-shadow,transform,background-color,border',
        };
    }, [shrink]);

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
    const freeTrialPath = localePrefix ? `${localePrefix}/free-trial` : '/free-trial';

    const buildLinkTarget = (item) => {
        if (item.hash) {
            return { pathname: item.to, hash: item.hash };
        }
        return item.to;
    };

    return (
        <header
            className="fixed inset-x-0 top-0 z-40 transition-[padding,top,border-radius,transform,background,backdrop-filter,box-shadow,left,right] duration-400 ease-out"
            style={composedHeaderStyle}
        >
            <div className="relative">
                <nav
                    aria-label="Global"
                    className="mx-auto flex items-center justify-between px-6 py-4 lg:px-8"
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
                                const linkClasses = `group relative inline-flex text-[1.05rem] font-bold tracking-wide transition-colors duration-200 ${isActive ? 'text-indigo-600' : 'text-gray-700 hover:text-gray-900'}`;
                                const pillClasses = `inline-flex items-center justify-center rounded-full border px-3.5 py-1.5 text-current transition-all duration-300 leading-tight ${showHighlight ? 'bg-indigo-50/90 border-indigo-200' : 'border-transparent group-hover:border-indigo-100 group-hover:bg-indigo-50/70'}`;
                                const highlightStyle = showHighlight
                                    ? {
                                          boxShadow: `0 12px 28px -18px rgba(79, 70, 229, ${(0.35 + 0.2 * highlightLevel).toFixed(2)})`,
                                          borderColor: `rgba(129, 140, 248, ${(0.6 + 0.25 * highlightLevel).toFixed(2)})`,
                                          backgroundColor: `rgba(238, 242, 255, ${(0.9 + 0.08 * highlightLevel).toFixed(2)})`,
                                      }
                                    : undefined;

                                return (
                                    <Link key={item.key} to={buildLinkTarget(item)} className={linkClasses}>
                                        <span className={pillClasses} style={highlightStyle}>
                                            {item.label}
                                        </span>
                                    </Link>
                                );
                            })}
                        </PopoverGroup>
                    </div>
                    <div className="flex items-center gap-3 lg:hidden relative z-20">
                        {isLoggedIn ? (
                            <AvatarButton size="sm" />
                        ) : (
                            <Link
                                to={loginPath}
                                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50"
                            >
                                Log in
                            </Link>
                        )}
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen((prev) => !prev)}
                            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
                            aria-expanded={mobileMenuOpen}
                            aria-controls="mobile-main-menu"
                            aria-label={mobileMenuOpen ? 'Close main menu' : 'Open main menu'}
                        >
                            <span className="sr-only">{mobileMenuOpen ? 'Close main menu' : 'Open main menu'}</span>
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
                                className="fixed inset-x-0 top-0 lg:hidden origin-top z-[80]"
                                id="mobile-main-menu"
                                role="dialog"
                                aria-modal="true"
                                aria-label="Mobile menu"
                                style={{ willChange: 'transform, opacity' }}
                            >
                                <div className="mx-auto px-6 pb-8 pt-2">
                                        <div className="w-full relative rounded-3xl border border-slate-200 bg-white px-5 pb-8 pt-6 shadow-[0_22px_48px_-22px_rgba(15,23,42,0.32)] sm:px-6">
                                            <button
                                                type="button"
                                                onClick={() => setMobileMenuOpen(false)}
                                                aria-label="Close menu"
                                                className="absolute right-3 top-3 -m-2 p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 active:scale-95 transition"
                                            >
                                                <XMarkIcon aria-hidden="true" className="size-6" />
                                            </button>
                                            {isLoggedIn ? (
                                                <div className="flex items-center gap-3 rounded-2xl bg-indigo-50/70 px-4 py-3 text-slate-700">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-sm font-semibold text-white">
                                                        {userInitials}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold text-slate-900">{displayName || 'Welcome back'}</p>
                                                        {displayEmail && (
                                                            <p className="truncate text-xs text-slate-500">{displayEmail}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                                                    지금 가입하고 분석 결과를 한곳에 모아 보세요.
                                                </div>
                                            )}

                                            <nav className="mt-5 space-y-2">
                                                {navItems.map((item, idx) => {
                                                    const isActive = activeItemKey === item.key;
                                                    const linkClasses = `group flex items-center justify-between gap-4 rounded-2xl px-5 py-3.5 text-base font-semibold transition ${
                                                        isActive
                                                            ? 'bg-indigo-50/95 text-indigo-600 shadow-[0_18px_36px_-24px_rgba(79,70,229,0.5)] ring-1 ring-inset ring-indigo-100'
                                                            : 'text-slate-700 hover:bg-slate-50/95 hover:text-slate-900 hover:ring-1 hover:ring-inset hover:ring-slate-200'
                                                    }`;
                                                    const itemAnimBase = reducedMotion
                                                        ? ''
                                                        : 'transform-gpu transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]';
                                                    return (
                                                        <Link
                                                            key={item.key}
                                                            to={buildLinkTarget(item)}
                                                            onClick={() => setMobileMenuOpen(false)}
                                                            className={`${linkClasses} ${mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                                                            style={{ transitionDelay: reducedMotion ? undefined : `${Math.min(idx * 120, 600)}ms` }}
                                                            data-open={mobileMenuOpen ? '' : undefined}
                                                        >
                                                            <span className={`${itemAnimBase} truncate text-left`}>{item.label}</span>
                                                            <span className={`flex items-center gap-2 text-sm font-medium ${itemAnimBase}`}>
                                                                {isActive && (
                                                                    <span className="inline-flex items-center rounded-full bg-indigo-100/90 px-2 py-0.5 text-[11px] font-medium text-indigo-600 shadow-sm">
                                                                        현재
                                                                    </span>
                                                                )}
                                                                <ChevronRightIcon aria-hidden="true" className="size-4 text-slate-300 transition-colors group-hover:text-indigo-300" />
                                                            </span>
                                                        </Link>
                                                    );
                                                })}
                                            </nav>

                                            <div className="mt-6">
                                                <Link
                                                    to={freeTrialPath}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-3 text-base font-semibold text-white shadow-md transition hover:from-indigo-600 hover:to-purple-600"
                                                >
                                                    Free Trial
                                                </Link>
                                            </div>

                                            <div className="mt-6 border-t border-slate-200 pt-6">
                                                <MobileNavigationAuthButton
                                                    localePrefix={localePrefix}
                                                    onNavigate={() => setMobileMenuOpen(false)}
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
