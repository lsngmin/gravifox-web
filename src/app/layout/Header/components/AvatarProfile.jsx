import React, { useMemo } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';

import Icon from 'app/components/icons/Icon';
import { useAuth } from 'providers/authProvider';

import LocaleSelector from './LocaleSelector';

const BUTTON_DIMENSIONS = {
    sm: {
        button: 'w-9 h-9 sm:w-10 sm:h-10',
        icon: 'w-5 h-5 sm:w-6 sm:h-6',
    },
    md: {
        button: 'w-10 h-10 sm:w-12 sm:h-12',
        icon: 'w-6 h-6 sm:w-7 sm:h-7',
    },
};

const AvatarProfile = ({ size = 'md' }) => {
    const { logout, userInfo } = useAuth();
    const navigate = useNavigate();

    const dimensions = BUTTON_DIMENSIONS[size] || BUTTON_DIMENSIONS.md;
    const displayName = userInfo?.nickname || userInfo?.userId || 'User';
    const displayEmail = userInfo?.userId || '';

    const actions = useMemo(
        () => [
            {
                key: 'settings',
                label: 'Settings',
                icon: 'gear',
                onClick: () => navigate('/settings'),
            },
            {
                key: 'dashboard',
                label: 'Dashboard',
                icon: 'dashboard',
                onClick: () => navigate('/dashboard'),
            },
            {
                key: 'billing',
                label: 'Billing',
                icon: 'credit-card',
                href: '/billing',
            },
        ],
        [navigate]
    );

    return (
        <Menu as="div" className="relative">
            <MenuButton
                type="button"
                className={`relative inline-flex items-center justify-center ${dimensions.button} -my-1 rounded-full border-2 border-indigo-500/80 bg-indigo-500 text-white hover:bg-indigo-600 hover:border-indigo-600 transition-colors duration-200`}
            >
                <Icon name="user" className={dimensions.icon} aria-hidden="true" />
            </MenuButton>

            <MenuItems
                transition
                className="absolute right-0 z-50 mt-2 w-64 origin-top-right divide-y divide-gray-100 rounded-xl bg-white text-gray-700 shadow-xl ring-1 ring-black/5 transition data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-150 data-[leave]:duration-100 data-[enter]:ease-out data-[leave]:ease-in dark:divide-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700/70"
            >
                <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{displayName}</p>
                            {displayEmail && <p className="text-xs text-gray-500 dark:text-slate-400">{displayEmail}</p>}
                        </div>
                    </div>
                </div>

                <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 space-y-3">
                    <button
                        type="button"
                        onClick={() => navigate('/analyze')}
                        className="w-full rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-600"
                    >
                        + New Analysis
                    </button>
                    <button
                        type="button"
                        className="w-full rounded-md bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-2 text-sm font-semibold text-white shadow hover:opacity-90"
                    >
                        Upgrade to Pro 🚀
                    </button>
                </div>

                <div className="py-1">
                    {actions.map((action) => (
                        <MenuItem key={action.key}>
                            {({ active }) =>
                                action.href ? (
                                    <a
                                        href={action.href}
                                        className={`${
                                            active
                                                ? 'bg-gray-100 text-gray-900 dark:bg-slate-800 dark:text-slate-100'
                                                : 'text-gray-700 dark:text-slate-300'
                                        } flex w-full items-center gap-3 px-4 py-2 text-sm font-medium`}
                                    >
                                        <Icon name={action.icon} className="h-5 w-5 text-indigo-500" />
                                        {action.label}
                                    </a>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={action.onClick}
                                        className={`${
                                            active
                                                ? 'bg-gray-100 text-gray-900 dark:bg-slate-800 dark:text-slate-100'
                                                : 'text-gray-700 dark:text-slate-300'
                                        } flex w-full items-center gap-3 px-4 py-2 text-sm font-medium`}
                                    >
                                        <Icon name={action.icon} className="h-5 w-5 text-indigo-500" />
                                        {action.label}
                                    </button>
                                )
                            }
                        </MenuItem>
                    ))}
                </div>

                <LocaleSelector variant="menu" />

                <div className="py-1">
                    <MenuItem>
                        {({ active }) => (
                            <button
                                type="button"
                                onClick={logout}
                                className={`${
                                    active
                                        ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-200'
                                        : 'text-red-600 dark:text-red-300'
                                } flex w-full items-center gap-3 px-4 py-2 text-sm font-semibold`}
                            >
                                <Icon name="logout" className="w-5 h-5" />
                                Sign out
                            </button>
                        )}
                    </MenuItem>
                </div>

                <div className="px-4 py-3 flex items-center gap-2 bg-green-50 border-b border-green-100 text-green-700 text-xs dark:border-green-900/50 dark:bg-green-500/10 dark:text-green-200">
                    <span className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-300" />
                    All systems operational
                </div>

                <div className="px-4 py-3 border-b border-gray-100 text-xs text-gray-500 dark:border-slate-700 dark:text-slate-400">
                    <p className="text-base font-bold text-indigo-600 dark:text-indigo-400">GRAVIFOX</p>
                    <p>AI-powered media detection</p>
                </div>
            </MenuItems>
        </Menu>
    );
};

export default AvatarProfile;
