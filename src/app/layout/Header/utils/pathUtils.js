const SUPPORTED_LOCALES = ['en', 'ko'];

export const extractLocalePrefix = (pathname = '/') => {
    const match = pathname.match(/^\/([a-zA-Z-]{2,5})(?=\/|$)/);
    if (!match) {
        return { prefix: '', locale: null };
    }
    const locale = match[1];
    if (!SUPPORTED_LOCALES.includes(locale)) {
        return { prefix: '', locale: null };
    }
    return { prefix: `/${locale}`, locale };
};

export const stripLocaleFromPath = (pathname = '/') => {
    const { prefix } = extractLocalePrefix(pathname);
    if (!prefix) return pathname || '/';

    const stripped = pathname.slice(prefix.length) || '/';
    return stripped.startsWith('/') ? stripped : `/${stripped}`;
};

export const normalizePathname = (pathname = '/', localePrefix = '') => {
    const [clean] = (pathname || '/').split(/[?#]/);
    const basePath =
        localePrefix && clean.startsWith(localePrefix)
            ? clean.slice(localePrefix.length) || '/'
            : stripLocaleFromPath(clean);

    let normalized = basePath.startsWith('/') ? basePath : `/${basePath}`;
    while (normalized.length > 1 && normalized.endsWith('/')) {
        normalized = normalized.slice(0, -1);
    }
    return normalized || '/';
};

export const buildLocalizedPath = (locale, pathname = '/', search = '', hash = '') => {
    const stripped = stripLocaleFromPath(pathname);
    const prefix = locale ? `/${locale}` : '';
    const suffix = stripped === '/' ? '' : stripped;
    return `${prefix}${suffix}${search || ''}${hash || ''}`;
};

export default SUPPORTED_LOCALES;
