import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useHeaderContext } from '../context';

const PrimaryNav = () => {
    const { navItems, activeItemKey, highlightStrength } = useHeaderContext();
    const { t } = useTranslation('common');

    if (!navItems?.length) {
        return null;
    }

    return (
        <nav aria-label={t('navigation.aria.primary', '주요 메뉴')} className="hidden lg:flex lg:gap-x-8 pt-0.5">
            {navItems.map((item) => {
                const isActive = activeItemKey === item.key;
                const highlightLevel = isActive ? highlightStrength : 0;
                const linkClasses =
                    'group relative inline-flex text-[1.05rem] font-bold tracking-wide transition-colors duration-200 text-gray-700 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white';

                const basePillClasses =
                    'inline-flex items-center justify-center rounded-full border px-3.5 py-1.5 leading-tight transition-all duration-300 border-transparent bg-transparent group-hover:border-emerald-100 group-hover:bg-emerald-50/70 dark:group-hover:border-emerald-500/40 dark:group-hover:bg-emerald-500/10';

                const activeClasses = isActive
                    ? 'text-emerald-600 dark:text-emerald-200 border-emerald-200 dark:border-emerald-400/50 bg-emerald-50/80 dark:bg-emerald-500/15 shadow-[0_12px_28px_-18px_rgba(16,185,129,0.35)]'
                    : '';

                const emphasisStyle =
                    highlightLevel > 0
                        ? {
                              boxShadow: `0 12px 28px -18px rgba(16, 185, 129, ${(0.22 + 0.28 * highlightLevel).toFixed(2)})`,
                          }
                        : undefined;

                const label = t(item.labelKey);

                return (
                    <Link key={item.key} to={item.to} className={linkClasses}>
                        <span className={`${basePillClasses} ${activeClasses}`} style={emphasisStyle}>
                            {label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
};

export default PrimaryNav;
