import React, { createContext, useContext } from 'react';

import useHeaderState from './hooks/useHeaderState';

const HeaderStateContext = createContext(null);

export const HeaderStateProvider = ({ children }) => {
    const state = useHeaderState();
    return <HeaderStateContext.Provider value={state}>{children}</HeaderStateContext.Provider>;
};

export const useHeaderContext = () => {
    const context = useContext(HeaderStateContext);
    if (!context) {
        throw new Error('useHeaderContext는 HeaderStateProvider 내부에서만 사용할 수 있습니다.');
    }
    return context;
};

export default HeaderStateContext;
