import React from 'react';
import { Link } from 'react-router-dom';

import { useHeaderContext } from '../context';

const HeaderBrand = ({ onClick }) => {
    const { localePrefix } = useHeaderContext();
    const homePath = localePrefix || '/';

    return (
        <Link
            to={homePath}
            onClick={onClick}
            className="-m-1.5 p-1.5 relative z-20 mr-4 lg:mr-6 flex items-center"
        >
            <span className="sr-only">REKWIEM</span>
            <div className="flex justify-center">
                <h1
                    translate="no"
                    className="cursor-pointer select-none text-[clamp(14px,4.5vw,26px)] md:text-[clamp(20px,3.5vw,32px)] font-extrabold tracking-tight leading-none text-gray-900 transition-colors duration-300 dark:text-slate-100"
                >
                    <span className="bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent transition-colors duration-300">
                        REKWIEM
                    </span>
                </h1>
            </div>
        </Link>
    );
};

export default HeaderBrand;
