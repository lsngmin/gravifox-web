import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useHeaderContext } from '../context';

const LoginButton = ({ className = '', fullWidth = false, onClick }) => {
    const { t } = useTranslation('common');
    const { localePrefix } = useHeaderContext();

    const loginPath = localePrefix ? `${localePrefix}/login` : '/login';
    const layoutClasses = fullWidth ? 'w-full justify-center' : 'justify-center';

    return (
        <Link
            to={loginPath}
            onClick={onClick}
            className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 ${layoutClasses} ${className}`}
        >
            {t('navigation.actions.login')} <span aria-hidden="true">&rarr;</span>
        </Link>
    );
};

export default LoginButton;
