import React from 'react';
import { useNavigate } from 'react-router-dom';

import Icon from 'app/components/icons/Icon';
import { useAuth } from 'providers/authProvider';

import { useHeaderContext } from '../context';

const MenuUserBadge = ({ onNavigate }) => {
    const { userInfo } = useAuth();
    const { localePrefix } = useHeaderContext();
    const navigate = useNavigate();

    if (!userInfo) {
        return null;
    }

    const displayName = userInfo?.nickname || userInfo?.userId || '';
    const displayEmail = userInfo?.userId || '';

    const goSettings = () => {
        const settingsPath = localePrefix ? `${localePrefix}/settings` : '/settings';
        navigate(settingsPath);
        if (typeof onNavigate === 'function') {
            onNavigate();
        }
    };

    return (
        <div className="flex items-center justify-between gap-4 border-b border-slate-200/70 px-4 py-4 dark:border-slate-800">
            <div className="text-left">
                <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{displayName}</p>
                {displayEmail ? (
                    <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">{displayEmail}</p>
                ) : null}
            </div>
            <button
                type="button"
                onClick={goSettings}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/70 bg-white/80 text-gray-600 shadow-sm transition hover:border-slate-300 hover:bg-white hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-white dark:focus-visible:ring-offset-slate-900"
                aria-label="Settings"
            >
                <Icon name="settings" className="h-[18px] w-[18px]" />
            </button>
        </div>
    );
};

export default MenuUserBadge;
