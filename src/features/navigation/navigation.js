import React, {Fragment} from 'react';
import {Link, useNavigate} from "react-router-dom";
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

    const handleClick = () => {
        if (userInfo) {
            alert(`환영합니다. ${userInfo.userId}`);
            setClicked(true);
        }
    };

    return (
        <header className="relative inset-x-0 top-0 z-10 bg-white/70 backdrop-blur-sm shadow-[0_1px_3px_0_rgb(0,0,0,0.05)]">
            <nav aria-label="Global" className="mx-auto flex items-center justify-between px-6 lg:px-8">
                <div className="flex items-center gap-x-10 lg:flex-1">
                    <a href="/" className="-m-1.5 p-1.5 relative z-20">
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
                    <PopoverGroup className="hidden lg:flex lg:gap-x-8">
                        <Link className="text-xs font-bold text-indigo-600 hover:text-indigo-500 relative z-20" to="/free-trial">Free Trial</Link>
                        <Link className="text-xs font-semibold text-gray-600 hover:text-gray-900 relative z-20" to="/pricing">Pricing</Link>
                        <Link className="text-xs font-semibold text-gray-600 hover:text-gray-900 relative z-20" to="/api-docs">Docs</Link>
                        <Link className="text-xs font-semibold text-gray-600 hover:text-gray-900 relative z-20" to="/support">Support</Link>
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
