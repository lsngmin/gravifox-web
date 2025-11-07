import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Icon from 'app/components/icons/Icon';

import { useHeaderContext } from '../context';

const LoginButton = ({ className = '', fullWidth = false, onClick }) => {
    const { t } = useTranslation('common');
    const { localePrefix } = useHeaderContext();

    const loginPath = localePrefix ? `${localePrefix}/login` : '/login';
    const widthClasses = fullWidth ? 'w-full' : '';

    return (
        <Link
            to={loginPath}
            onClick={onClick}
            className={`flex ${widthClasses} items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-base font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-400/60 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-200 dark:focus-visible:ring-offset-slate-900 ${className}`}
        >
            <Icon name="login" className="h-5 w-5" />
            {t('navigation.actions.login')} <span aria-hidden="true">&rarr;</span>
        </Link>
    );
};

export default LoginButton;
