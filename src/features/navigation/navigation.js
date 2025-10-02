import React, {Fragment, useEffect, useMemo} from 'react';
import {Link, useLocation, useNavigate} from "react-router-dom";
import { useState } from 'react';
import { ChevronDownIcon, PhoneIcon, PlayCircleIcon } from '@heroicons/react/20/solid'
import {
    Dialog,
    DialogPanel,
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
    Popover,
    PopoverButton,
    PopoverGroup,
    PopoverPanel, Transition,
} from '@headlessui/react'
import {
    ArrowPathIcon,
    Bars3Icon,
    ChartPieIcon,
    CursorArrowRaysIcon,
    FingerPrintIcon,
    SquaresPlusIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline'

import {useAuth} from "providers/authProvider";
import Logo from "assets/logo.svg";
import NavigationAuthButton from "features/navigation/components/navigationAuthButton";
import MobileNavigationAuthButton from "features/navigation/components/mobileNavigationAuthButton";


const products = [
    { name: 'Analytics', description: 'Get a better understanding of your traffic', href: '#', icon: ChartPieIcon },
    { name: 'Engagement', description: 'Speak directly to your customers', href: '#', icon: CursorArrowRaysIcon },
    { name: 'Security', description: 'Your customers\' data will be safe and secure', href: '#', icon: FingerPrintIcon },
    { name: 'Integrations', description: 'Connect with third-party tools', href: '#', icon: SquaresPlusIcon },
    { name: 'Automations', description: 'Build strategic funnels that will convert', href: '#', icon: ArrowPathIcon },
]
const callsToAction = [
    { name: 'Watch demo', href: '#', icon: PlayCircleIcon },
    { name: 'Contact sales', href: '#', icon: PhoneIcon },
]

const Navigation = () => {
    const { userInfo, logout, loading} = useAuth();
    const [clicked, setClicked] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const navigate = useNavigate();
    const location = useLocation();
    const localeMatch = location.pathname.match(/^\/([a-zA-Z-]{2,5})(?=\/|$)/);
    const localePrefix = localeMatch ? `/${localeMatch[1]}` : '';
    const navItems = useMemo(() => ([
        { key: 'analyze', label: 'Analyze', to: `${localePrefix}/analyze`, path: '/analyze' },
        { key: 'features', label: 'Features', to: `${localePrefix}/feature`, path: '/feature' },
        { key: 'pricing', label: 'Pricing', to: `${localePrefix}/pricing`, path: '/pricing' },
        { key: 'docs', label: 'Docs', to: `${localePrefix}/docs`, path: '/docs' },
        { key: 'blog', label: 'Blog', to: `${localePrefix}/blog`, path: '/blog', hash: '#blog' },
        { key: 'support', label: 'Support', to: `${localePrefix}/support`, path: '/support' },
    ]), [localePrefix]);

    const handleClick = () => {
        if (userInfo) {
            alert(`환영합니다. ${userInfo.userId}`);
            setClicked(true);
        }
    };
    const [scrolled, setScrolled] = useState(false);
    const [shrink, setShrink] = useState(0); // 0 ~ 1
    useEffect(() => {
        let ticking = false;
        const max = 120; // px range to fully shrink
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(() => {
                const y = window.scrollY || 0;
                const p = Math.max(0, Math.min(1, y / max));
                setShrink(p);
                setScrolled(p > 0.02);
                ticking = false;
            });
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const headerStyle = useMemo(() => {
        const lerp = (a, b, t) => a + (b - a) * t;
        const top = lerp(0, 20, shrink);
        const side = lerp(0, 16, shrink);
        const radius = lerp(0, 20, shrink);
        const scale = lerp(1, 0.95, shrink);
        const backgroundOpacity = lerp(0.98, 0.94, shrink);
        const shadowStrength = lerp(0.18, 0.12, shrink);
        const borderAlpha = lerp(0.55, 0.3, shrink);

        return {
            left: side ? `${side}px` : undefined,
            right: side ? `${side}px` : undefined,
            top: `${top}px`,
            borderRadius: radius ? `${radius}px` : undefined,
            transform: `scale(${scale.toFixed(3)})`,
            backgroundColor: `rgba(255,255,255,${backgroundOpacity.toFixed(2)})`,
            boxShadow: `0 18px 32px -24px rgba(15,23,42,${shadowStrength.toFixed(2)})`,
            border: `1px solid rgba(226, 232, 240, ${borderAlpha.toFixed(2)})`,
            willChange: 'left,right,top,border-radius,box-shadow,transform,background-color,border',
        };
    }, [shrink]);

    const normalizePath = (path) => {
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
    };

    const getTargetPath = (to) => {
        if (typeof to === 'string') {
            return to.split(/[?#]/)[0] || '/';
        }
        if (to && typeof to === 'object') {
            const candidate = to.pathname || '/';
            return candidate.split(/[?#]/)[0] || '/';
        }
        return '/';
    };

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
    }, [navItems, currentPath, currentHash]);

    const highlightStrength = useMemo(() => {
        const eased = Math.max(0, Math.min(1, (shrink - 0.1) / 0.9));
        return Number.isFinite(eased) ? eased : 0;
    }, [shrink]);

    return (
        <header
            className={`fixed inset-x-0 top-0 z-30 transition-[padding,top,border-radius,transform,background,backdrop-filter,box-shadow,left,right] duration-400 ease-out`}
            style={headerStyle}
        >
            <nav aria-label="Global" className={`mx-auto flex items-center justify-between px-6 lg:px-8 py-3`} style={{ paddingBlock: `${(12 - 8*shrink).toFixed(1)}px`, paddingInline: `${(24 - 8*shrink).toFixed(1)}px` }}>
                <div className="flex items-center gap-x-10 lg:flex-1">
                    <a href="/" className="-m-1.5 p-1.5 relative z-20 mr-6">
                        <span className="sr-only">gravifox</span>
                        <div className="flex justify-center">
                            <h1
                                onClick={() => navigate("/")}
                                translate="no"
                                className="cursor-pointer select-none text-[clamp(14px,2.8vw,26px)] font-extrabold tracking-tight leading-none text-indigo-500 drop-shadow-md"
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
                                <Link key={item.key} to={item.to} className={linkClasses}>
                                    <span className={pillClasses} style={highlightStyle}>
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </PopoverGroup>
                </div>
                <div className="flex lg:hidden relative z-20">
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(true)}
                        className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
                    >
                        <span className="sr-only">Open main menu</span>
                        <Bars3Icon aria-hidden="true" className="size-6"/>
                    </button>
                </div>
                <div className="hidden lg:flex lg:flex-1 lg:justify-end">
                    <NavigationAuthButton/>
                </div>
            </nav>
            <Transition show={mobileMenuOpen} as={Fragment}>
                <Dialog onClose={setMobileMenuOpen} className="lg:hidden z-30" static>
                    <Transition.Child
                        as={Fragment}
                        enter="transition-opacity duration-300 ease-out"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity duration-200 ease-in"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 z-10 bg-black/25"/>
                    </Transition.Child>

                    <Transition.Child
                        as={Fragment}
                        enter="transition ease-out duration-1000 transform"
                        enterFrom="translate-x-full"
                        enterTo="translate-x-0"
                        leave="transition ease-in duration-1000 transform"
                        leaveFrom="translate-x-0"
                        leaveTo="translate-x-full"
                    >
                        <DialogPanel
                            className=" fixed inset-y-0 right-0 z-30 w-full bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 overflow-y-auto overscroll-none">
                            <div className="flex items-center justify-between">
                                <a href="/" className="-m-1.5 p-1.5">
                                    <span className="sr-only">gravifox</span>
                                    <img className="h-6 w-auto" src={Logo} alt="gravifox"/>
                                </a>
                                <button
                                    type="button"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="-m-2.5 rounded-md p-2.5 text-gray-700"
                                >
                                    <span className="sr-only">Close menu</span>
                                    <XMarkIcon aria-hidden="true" className="size-6"/>
                                </button>
                            </div>
                            <div className="mt-6 flow-root">
                                <div className="-my-6 divide-y divide-gray-500/10">
                                    <div className="space-y-2 py-6">
                                        <Disclosure as="div" className="-mx-3">
                                            <DisclosureButton
                                                className="group flex w-full items-center justify-between rounded-lg py-2 pr-3.5 pl-3 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">
                                                Product
                                                <ChevronDownIcon aria-hidden="true"
                                                                 className="size-5 flex-none group-data-open:rotate-180"/>
                                            </DisclosureButton>
                                            <DisclosurePanel className="mt-2 space-y-2">
                                                {[...products, ...callsToAction].map((item) => (
                                                    <DisclosureButton
                                                        key={item.name}
                                                        as="a"
                                                        href={item.href}
                                                        className="block rounded-lg py-2 pr-3 pl-6 text-sm/7 font-semibold text-gray-900 hover:bg-gray-50"
                                                    >
                                                        {item.name}
                                                    </DisclosureButton>
                                                ))}
                                            </DisclosurePanel>
                                        </Disclosure>
                                        <Link
                                            className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                                            to="/free-trial">Free Trial</Link>
                                        <Link
                                            className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                                            to="/pricing">Pricing</Link>
                                        <Link
                                            className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                                            to="/api-docs">Docs</Link>
                                        <Link
                                            className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                                            to="/support">Support</Link>
                                    </div>
                                    <div className="py-8">
                                        <MobileNavigationAuthButton/>
                                    </div>
                                </div>
                            </div>
                        </DialogPanel>
                    </Transition.Child>
                </Dialog>
            </Transition>
        </header>
    );
}

export default Navigation;
