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
import { fetchQuotaSummary } from 'features/analyze/api/quotaSummary';

// PortalOverlay: forwards Transition props to a real element rendered into document.body
const PortalOverlay = React.forwardRef(function PortalOverlay({ className, ...props }, ref) {
    return createPortal(<div ref={ref} className={className} {...props} />, document.body);
});

// PortalPanel: portaled container for the mobile menu panel
const PortalPanel = React.forwardRef(function PortalPanel({ className, style, ...props }, ref) {
    return createPortal(<div ref={ref} className={className} style={style} {...props} />, document.body);
});

const Navigation = ({ variant = 'light' }) => {
    const { t, i18n } = useTranslation('common');
    const { userInfo } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [shrink, setShrink] = useState(0);
    const [reducedMotion, setReducedMotion] = useState(false);
    const [quotaSummary, setQuotaSummary] = useState(null);
    const [quotaLoading, setQuotaLoading] = useState(false);
    const [quotaError, setQuotaError] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();
    const localeMatch = location.pathname.match(/^\/([a-zA-Z-]{2,5})(?=\/|$)/);
    const localePrefix = localeMatch ? `/${localeMatch[1]}` : '';
    const userAuthenticated = Boolean(userInfo);

    const navItems = useMemo(
        () => [
            {
                key: 'analyze',
                labelKey: 'navigation.items.analyze',
                to: localePrefix ? `${localePrefix}/analyze` : '/analyze',
                path: '/analyze',
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
        if (!mobileMenuOpen) return;
        if (!userAuthenticated) return;
        if (quotaSummary || quotaLoading) return;

        let cancelled = false;

        const loadQuota = async () => {
            try {
                setQuotaError(null);
                setQuotaLoading(true);
                const summary = await fetchQuotaSummary();
                if (!cancelled) {
                    setQuotaSummary(summary);
                }
            } catch (error) {
                if (!cancelled) {
                    setQuotaError(t('navigation.usage.errorFallback', '사용량 정보를 불러오는 중 문제가 발생했어요.'));
                }
            } finally {
                if (!cancelled) {
                    setQuotaLoading(false);
                }
            }
        };

        loadQuota();

        return () => {
            cancelled = true;
        };
    }, [mobileMenuOpen, userAuthenticated, quotaSummary, quotaLoading, t]);

    useEffect(() => {
        if (userAuthenticated) {
            return;
        }
        setQuotaSummary(null);
        setQuotaError(null);
        setQuotaLoading(false);
    }, [userAuthenticated]);

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

    const quotaFormatter = useMemo(
        () => new Intl.NumberFormat(i18n?.language || undefined),
        [i18n?.language]
    );
    const quotaLimit = Number.isFinite(quotaSummary?.limit) ? Math.max(0, quotaSummary.limit) : null;
    const quotaRemaining = Number.isFinite(quotaSummary?.remaining) ? Math.max(0, quotaSummary.remaining) : null;
    const quotaUsed = quotaLimit != null && quotaRemaining != null ? Math.max(0, quotaLimit - quotaRemaining) : null;
    const quotaPercent =
        quotaLimit != null && quotaLimit > 0 && quotaUsed != null
            ? Math.min(100, Math.max(0, (quotaUsed / quotaLimit) * 100))
            : quotaUsed != null && quotaLimit === 0
                  ? 100
                  : null;
    const quotaSummaryText = useMemo(() => {
        if (quotaLimit != null && quotaUsed != null) {
            return t('navigation.usage.summary', {
                defaultValue: '총 {{limit}}회 중 {{used}}회 사용',
                limit: quotaFormatter.format(quotaLimit),
                used: quotaFormatter.format(quotaUsed),
            });
        }
        if (quotaRemaining != null) {
            return t('navigation.usage.remainingOnly', {
                defaultValue: '남은 분석 {{count}}회',
                count: quotaFormatter.format(quotaRemaining),
            });
        }
        return null;
    }, [quotaLimit, quotaUsed, quotaRemaining, quotaFormatter, t]);
    const quotaRemainingLabel = useMemo(() => {
        if (quotaRemaining != null && quotaLimit != null) {
            return t('navigation.usage.remainingShort', {
                defaultValue: '잔여 {{count}}회',
                count: quotaFormatter.format(quotaRemaining),
            });
        }
        return null;
    }, [quotaRemaining, quotaLimit, quotaFormatter, t]);
    const quotaHasData = Boolean(quotaSummary) && (quotaLimit != null || quotaRemaining != null);

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

    const displayName = userInfo?.nickname || userInfo?.userId || '';
    const displayEmail = userInfo?.userId || '';
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
                            <span className="sr-only">REKWIEM</span>
                            <div className="flex justify-center">
                                <h1
                                    onClick={() => navigate('/')}
                                    translate="no"
                                    className={`cursor-pointer select-none text-[clamp(18px,5.5vw,32px)] md:text-[clamp(24px,4vw,38px)] font-extrabold tracking-tight leading-none ${
                                        isDark
                                            ? 'drop-shadow-[0_18px_36px_rgba(249,115,22,0.32)]'
                                            : 'drop-shadow-[0_18px_34px_rgba(99,102,241,0.26)]'
                                    }`}
                                >
                                    <span className="bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent transition-all duration-300">
                                        REKWIEM
                                    </span>
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
                                            ? 'text-emerald-200'
                                            : 'text-slate-300 hover:text-white'
                                        : isActive
                                              ? 'text-emerald-600'
                                              : 'text-gray-700 hover:text-gray-900'
                                }`;
                                const pillClasses = `inline-flex items-center justify-center rounded-full border px-3.5 py-1.5 text-current transition-all duration-300 leading-tight ${
                                    showHighlight
                                        ? isDark
                                            ? 'bg-emerald-500/15 border-emerald-400/50'
                                            : 'bg-emerald-50/90 border-emerald-200'
                                        : isDark
                                            ? 'border-slate-700/70 group-hover:border-emerald-500/40 group-hover:bg-emerald-500/10'
                                            : 'border-transparent group-hover:border-emerald-100 group-hover:bg-emerald-50/70'
                                }`;
                                const highlightStyle = showHighlight
                                    ? isDark
                                        ? {
                                              boxShadow: `0 12px 28px -18px rgba(16, 185, 129, ${(0.28 + 0.15 * highlightLevel).toFixed(2)})`,
                                              borderColor: `rgba(52, 211, 153, ${(0.55 + 0.25 * highlightLevel).toFixed(2)})`,
                                              backgroundColor: `rgba(6, 95, 70, ${(0.22 + 0.1 * highlightLevel).toFixed(2)})`,
                                          }
                                        : {
                                              boxShadow: `0 12px 28px -18px rgba(16, 185, 129, ${(0.35 + 0.2 * highlightLevel).toFixed(2)})`,
                                              borderColor: `rgba(110, 231, 183, ${(0.6 + 0.25 * highlightLevel).toFixed(2)})`,
                                              backgroundColor: `rgba(236, 253, 245, ${(0.9 + 0.08 * highlightLevel).toFixed(2)})`,
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
                        {!mobileMenuOpen && !userAuthenticated && (
                            <Link
                                to={loginPath}
                                className="inline-flex items-center justify-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:shadow-emerald-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
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
                                                {userAuthenticated ? (
                                                    <div
                                                        className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
                                                            isDark
                                                                ? 'bg-emerald-500/15 text-emerald-100'
                                                                : 'bg-emerald-50/70 text-slate-700'
                                                        }`}
                                                    >
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
                                                                    ? 'text-emerald-100 hover:bg-emerald-500/30 hover:text-white'
                                                                    : 'text-emerald-500 hover:bg-emerald-100/80 hover:text-emerald-600'
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
                                                {!userAuthenticated && (
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

                                        <div className="mt-6 space-y-6">
                                            <div
                                                className={`rounded-2xl border px-4 py-4 transition-colors ${
                                                    isDark
                                                        ? 'border-emerald-500/40 bg-emerald-500/12 text-emerald-100'
                                                        : 'border-emerald-200 bg-emerald-50/80 text-emerald-700'
                                                }`}
                                            >
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <p className="text-xs font-semibold uppercase tracking-[0.14em]">
                                                            {t('navigation.usage.title', '현재 분석 사용량')}
                                                        </p>
                                                        {quotaRemainingLabel && quotaHasData && (
                                                            <span className="text-[11px] font-semibold">{quotaRemainingLabel}</span>
                                                        )}
                                                    </div>
                                                    {quotaLoading ? (
                                                        <div className="space-y-2">
                                                            <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-500/15">
                                                                <div
                                                                    className={`h-full w-1/3 rounded-full ${
                                                                        isDark ? 'bg-emerald-300/70' : 'bg-emerald-400/80'
                                                                    } animate-pulse`}
                                                                    aria-hidden="true"
                                                                />
                                                            </div>
                                                            <p className={`text-[11px] ${isDark ? 'text-emerald-100/75' : 'text-emerald-700/70'}`}>
                                                                {t('navigation.usage.loading', '사용량을 불러오는 중이에요…')}
                                                            </p>
                                                        </div>
                                                    ) : quotaError ? (
                                                        <p className={`text-[11px] ${isDark ? 'text-rose-200/85' : 'text-rose-500/80'}`}>
                                                            {quotaError}
                                                        </p>
                                                    ) : quotaHasData ? (
                                                        quotaPercent != null ? (
                                                            <div className="space-y-2">
                                                                <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-500/15">
                                                                    <div
                                                                        className={`h-full rounded-full ${
                                                                            isDark ? 'bg-emerald-300/90' : 'bg-emerald-500'
                                                                        } transition-all duration-500 ease-out`}
                                                                        style={{ width: `${quotaPercent}%` }}
                                                                        aria-hidden="true"
                                                                    />
                                                                </div>
                                                                {quotaSummaryText && (
                                                                    <p className={`text-[11px] ${isDark ? 'text-emerald-100/80' : 'text-emerald-700/80'}`}>
                                                                        {quotaSummaryText}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            quotaSummaryText && (
                                                                <p className={`text-[11px] ${isDark ? 'text-emerald-100/80' : 'text-emerald-700/80'}`}>
                                                                    {quotaSummaryText}
                                                                </p>
                                                            )
                                                        )
                                                    ) : userAuthenticated ? (
                                                        <p className={`text-[11px] ${isDark ? 'text-emerald-100/75' : 'text-emerald-700/70'}`}>
                                                            {t('navigation.usage.empty', '사용량 정보가 아직 준비되지 않았어요. 잠시 후 다시 확인해 주세요.')}
                                                        </p>
                                                    ) : (
                                                        <p className={`text-[11px] ${isDark ? 'text-emerald-100/75' : 'text-emerald-700/70'}`}>
                                                            {t('navigation.usage.loginPrompt', '로그인하면 이번 달 분석 사용량을 확인할 수 있어요.')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <nav
                                                aria-label={t('navigation.mobileMenuLabel', '주요 내비게이션')}
                                                className={`border-t pt-6 ${isDark ? 'border-slate-700/60' : 'border-slate-200'}`}
                                            >
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
                                                                                ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-100 shadow-sm'
                                                                                : 'border-emerald-200 bg-emerald-50 text-emerald-600 shadow-sm'
                                                                            : isDark
                                                                                  ? 'border-slate-700/70 bg-slate-900/70 text-slate-200 hover:border-emerald-500/40 hover:bg-emerald-500/15 hover:text-emerald-100'
                                                                                  : 'border-slate-200/60 bg-white text-slate-700 hover:border-emerald-100 hover:bg-emerald-50/70 hover:text-emerald-600'
                                                                   }`}
                                                               >
                                                                    <span>{t(item.labelKey)}</span>
                                                                    <span
                                                                        aria-hidden="true"
                                                                        className={`text-sm font-medium transition-transform duration-200 ${
                                                                            isActive
                                                                                ? isDark
                                                                                    ? 'translate-x-0 text-emerald-300'
                                                                                    : 'translate-x-0 text-emerald-500'
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
