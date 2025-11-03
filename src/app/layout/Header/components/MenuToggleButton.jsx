import React from 'react';

import Icon from 'app/components/icons/Icon';
import { useTranslation } from 'react-i18next';

import { useHeaderContext } from '../context';

const MenuToggleButton = () => {
    const { isMenuOpen, toggleMenu } = useHeaderContext();
    const { t } = useTranslation('common');

    return (
        <button
            type="button"
            onClick={toggleMenu}
            className={`-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 transition text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/80`}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? t('navigation.closeMenu', 'Close main menu') : t('navigation.openMenu', 'Open main menu')}
        >
            <Icon name={isMenuOpen ? 'close' : 'menu'} className="h-6 w-6" />
        </button>
    );
};

export default MenuToggleButton;
