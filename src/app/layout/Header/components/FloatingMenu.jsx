import React, { Fragment, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { createPortal } from 'react-dom';

import { useHeaderContext } from '../context';

import MenuAccountSection from './MenuAccountSection';
import MenuHeader from './MenuHeader';
import MenuNavigation from './MenuNavigation';
import MenuUserBadge from './MenuUserBadge';
import UsageSummary from './UsageSummary';

const FloatingMenu = () => {
    const { isMenuOpen, closeMenu, shouldReduceMotion } = useHeaderContext();

    useEffect(() => {
        if (!isMenuOpen) return undefined;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previous;
        };
    }, [isMenuOpen]);

    useEffect(() => {
        if (!isMenuOpen) return undefined;
        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                closeMenu();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isMenuOpen, closeMenu]);

    if (typeof document === 'undefined') {
        return null;
    }

    return createPortal(
        <Transition show={isMenuOpen} as={Fragment}>
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <Transition.Child
                    as={Fragment}
                    enter="transition-opacity duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div
                        className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm dark:bg-slate-900/80"
                        aria-hidden="true"
                        onClick={closeMenu}
                    />
                </Transition.Child>

                <Transition.Child
                    as={Fragment}
                    enter={shouldReduceMotion ? '' : 'transition duration-300 ease-out'}
                    enterFrom={shouldReduceMotion ? '' : 'translate-y-6 opacity-0'}
                    enterTo={shouldReduceMotion ? '' : 'translate-y-0 opacity-100'}
                    leave={shouldReduceMotion ? '' : 'transition duration-200 ease-in'}
                    leaveFrom={shouldReduceMotion ? '' : 'translate-y-0 opacity-100'}
                    leaveTo={shouldReduceMotion ? '' : 'translate-y-6 opacity-0'}
                >
                    <div className="relative w-full max-w-sm translate-y-0 overflow-auto max-h-[90vh] rounded-3xl border border-white/10 bg-white shadow-2xl focus:outline-none dark:border-slate-700 dark:bg-slate-900 lg:hidden mx-4">
                        <div className="flex flex-col">
                            <MenuHeader />
                            <MenuUserBadge onNavigate={closeMenu} />
                            <div className="px-5 mt-3">
                                <UsageSummary />
                            </div>
                            <div className="px-5 pb-6">
                                <MenuNavigation />
                                <div className="mt-5 space-y-4">
                                    <MenuAccountSection />
                                </div>
                            </div>
                        </div>
                    </div>
                </Transition.Child>
            </div>
        </Transition>,
        document.body
    );
};

export default FloatingMenu;
