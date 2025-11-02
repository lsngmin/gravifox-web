const NAV_CONFIG = [
    {
        key: 'analyze',
        labelKey: 'navigation.items.analyze',
        path: '/analyze',
    },
    {
        key: 'blog',
        labelKey: 'navigation.items.blog',
        path: '/blog',
        hash: '#blog',
    },
    {
        key: 'support',
        labelKey: 'navigation.items.support',
        path: '/support',
    },
];

export const getNavItems = (localePrefix = '') =>
    NAV_CONFIG.map((item) => {
        const target = localePrefix ? `${localePrefix}${item.path}` : item.path;
        return {
            ...item,
            to: item.hash ? { pathname: target, hash: item.hash } : target,
        };
    });

export default NAV_CONFIG;
