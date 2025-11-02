import React from 'react';

import { HeaderStateProvider } from './context';
import HeaderContainer from './components/HeaderContainer';
import FloatingMenu from './components/FloatingMenu';

const Header = () => (
    <HeaderStateProvider>
        <HeaderContainer />
        <FloatingMenu />
    </HeaderStateProvider>
);

export default Header;
