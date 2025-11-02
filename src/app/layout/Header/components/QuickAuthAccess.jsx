import React from 'react';

import { useAuth } from 'providers/authProvider';

import { useHeaderContext } from '../context';
import LoginButton from './LoginButton';

const QuickAuthAccess = () => {
    const { userInfo } = useAuth();
    const { isMenuOpen } = useHeaderContext();

    if (isMenuOpen || userInfo) {
        return null;
    }

    return (
        <div className="lg:hidden">
            <LoginButton className="px-4 py-2 text-sm" />
        </div>
    );
};

export default QuickAuthAccess;
