import React, { useMemo } from 'react';

import { useHeaderContext } from '../context';

import AccountControls from './AccountControls';
import HeaderBrand from './HeaderBrand';
import MenuToggleButton from './MenuToggleButton';
import PrimaryNav from './PrimaryNav';

const HeaderContainer = () => {
    const { shrinkValue, isMenuOpen } = useHeaderContext();

    const headerStyle = useMemo(() => {
        const lerp = (a, b, t) => a + (b - a) * t;
        const top = lerp(0, 20, shrinkValue);
        const side = lerp(0, 16, shrinkValue);
        const radius = lerp(0, 20, shrinkValue);
        const scale = lerp(1, 0.97, shrinkValue);
        const shadowStrength = lerp(0.18, 0.3, shrinkValue);

        const insetVisible = shrinkValue > 0.06;
        const sideInset = insetVisible ? side : 0;
        const radiusValue = radius ? `${radius}px` : undefined;

        return {
            left: sideInset ? `${sideInset}px` : '0px',
            right: sideInset ? `${sideInset}px` : '0px',
            top: `${top}px`,
            borderRadius: radiusValue,
            transform: `scale(${scale.toFixed(3)})`,
            boxShadow: `0 18px 36px -24px rgba(15, 23, 42, ${shadowStrength.toFixed(2)})`,
            zIndex: isMenuOpen ? 30 : 40,
        };
    }, [shrinkValue, isMenuOpen]);

    return (
        <header
            className="fixed inset-x-0 top-0 border border-slate-200/70 border-t-0 bg-white/95 backdrop-blur-lg transition-[padding,top,border-radius,transform,left,right] duration-400 ease-out text-gray-900 dark:border-slate-700/60 dark:border-t-0 dark:bg-slate-900/90 dark:text-slate-100"
            style={headerStyle}
        >
            <div className="relative">
                <nav
                    aria-label="Global"
                    className="mx-auto flex items-center justify-between px-6 py-4 lg:px-8"
                    style={{
                        paddingBlock: `${(16 - 6 * shrinkValue).toFixed(1)}px`,
                        paddingInline: `${(24 - 8 * shrinkValue).toFixed(1)}px`,
                    }}
                >
                    <div className="flex items-center gap-x-6 lg:gap-x-10 lg:flex-1">
                        <HeaderBrand />
                        <PrimaryNav />
                    </div>
                    <AccountControls />
                    <div className="flex items-center gap-3 lg:hidden relative z-20">
                        <MenuToggleButton />
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default HeaderContainer;
