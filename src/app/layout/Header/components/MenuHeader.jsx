import React from 'react';

import Icon from 'app/components/icons/Icon';

import { useHeaderContext } from '../context';
import HeaderBrand from './HeaderBrand';

const MenuHeader = () => {
    const { closeMenu } = useHeaderContext();

    return (
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/60 dark:border-slate-800">
            <HeaderBrand onClick={closeMenu} />
            <button
                type="button"
                onClick={closeMenu}
                className="rounded-full p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white dark:focus-visible:ring-offset-slate-900"
                aria-label="Close menu"
            >
                <Icon name="close" className="h-6 w-6" />
            </button>
        </div>
    );
};

export default MenuHeader;
