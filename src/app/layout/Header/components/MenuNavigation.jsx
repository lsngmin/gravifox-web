import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useHeaderContext } from '../context';

const MenuNavigation = () => {
    const { navItems, activeItemKey, closeMenu } = useHeaderContext();
    const { t } = useTranslation('common');

    if (!navItems?.length) {
        return null;
    }

    return (
        <div className="mt-4 space-y-2">
            {navItems.map((item) => {
                const isActive = activeItemKey === item.key;

                return (
                    <Link
                        key={item.key}
                        to={item.to}
                        onClick={closeMenu}
                        className={`block rounded-2xl border px-4 py-3 text-base font-semibold transition ${
                            isActive
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200'
                                : 'border-transparent bg-white/60 text-gray-700 hover:border-gray-200 hover:bg-white dark:border-slate-700/40 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800/80'
                        }`}
                    >
                        {t(item.labelKey)}
                    </Link>
                );
            })}
        </div>
    );
};

export default MenuNavigation;
