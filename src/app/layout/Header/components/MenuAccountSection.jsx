import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Icon from 'app/components/icons/Icon';
import { useAuth } from 'providers/authProvider';

import { useHeaderContext } from '../context';
import LoginButton from './LoginButton';

const MenuAccountSection = () => {
    const { accessToken, logout } = useAuth();
    const { localePrefix, closeMenu } = useHeaderContext();
    const { t } = useTranslation('common');
    const navigate = useNavigate();

    const dashboardPath = localePrefix ? `${localePrefix}/dashboard` : '/dashboard';

    if (!accessToken) {
        return (
            <div className="space-y-2">
                <LoginButton fullWidth onClick={closeMenu} />
            </div>
        );
    }

    const handleDashboard = () => {
        closeMenu();
        navigate(dashboardPath);
    };

    const handleLogout = () => {
        closeMenu();
        logout();
    };

    return (
        <div className="space-y-3">
            <button
                type="button"
                onClick={handleDashboard}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-base font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-100 dark:border-indigo-500/40 dark:bg-indigo-500/20 dark:text-indigo-100 dark:hover:bg-indigo-500/30"
            >
                <Icon name="dashboard" className="h-5 w-5" />
                {t('navigation.actions.viewDashboard')}
            </button>
            <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-base font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-rose-500/60 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
            >
                <Icon name="logout" className="h-5 w-5" />
                {t('navigation.actions.logout')} <span aria-hidden="true">&rarr;</span>
            </button>
        </div>
    );
};

export default MenuAccountSection;
