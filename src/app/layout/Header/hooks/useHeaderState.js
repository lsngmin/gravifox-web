import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { getNavItems } from '../data/navItems';
import {
    buildLocalizedPath,
    extractLocalePrefix,
    normalizePathname,
    stripLocaleFromPath,
} from '../utils/pathUtils';

const SUPPORTED_LOCALES = ['en', 'ko'];
const MAX_SCROLL_SHRINK = 120;

const useHeaderState = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [{ prefix: localePrefix, locale: currentLocale }, setLocaleState] = useState(() =>
        extractLocalePrefix(location.pathname || '/')
    );

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [shrinkValue, setShrinkValue] = useState(0);
    const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

    useEffect(() => {
        const { prefix, locale } = extractLocalePrefix(location.pathname || '/');
        setLocaleState({ prefix, locale });
    }, [location.pathname]);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname, location.search]);

    useEffect(() => {
        let ticking = false;
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(() => {
                const y = window.scrollY || 0;
                const progress = Math.max(0, Math.min(1, y / MAX_SCROLL_SHRINK));
                setShrinkValue(progress);
                ticking = false;
            });
        };

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setShouldReduceMotion(media.matches);
        update();
        media.addEventListener?.('change', update);
        return () => media.removeEventListener?.('change', update);
    }, []);

    const navItems = useMemo(() => getNavItems(localePrefix), [localePrefix]);

    const pathWithoutLocale = useMemo(
        () => stripLocaleFromPath(location.pathname || '/'),
        [location.pathname]
    );

    const normalizedPath = useMemo(
        () => normalizePathname(location.pathname || '/', localePrefix),
        [location.pathname, localePrefix]
    );

    const activeItemKey = useMemo(() => {
        const currentHash = location.hash || '';
        const match = navItems.find((item) => {
            const normalizedItem = normalizePathname(item.path, localePrefix);
            if (normalizedItem !== normalizedPath) return false;
            if (item.hash) {
                return currentHash === item.hash;
            }
            return true;
        });
        return match?.key || null;
    }, [navItems, localePrefix, normalizedPath, location.hash]);

    const openMenu = useCallback(() => setIsMenuOpen(true), []);
    const closeMenu = useCallback(() => setIsMenuOpen(false), []);
    const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), []);

    const highlightStrength = useMemo(() => {
        const eased = Math.max(0, Math.min(1, (shrinkValue - 0.1) / 0.9));
        return Number.isFinite(eased) ? eased : 0;
    }, [shrinkValue]);

    const navigateWithLocale = useCallback(
        (locale) => {
            const nextLocale = SUPPORTED_LOCALES.includes(locale) ? locale : SUPPORTED_LOCALES[0];
            const target = buildLocalizedPath(
                nextLocale,
                location.pathname || '/',
                location.search || '',
                location.hash || ''
            );
            if (target !== `${location.pathname}${location.search || ''}${location.hash || ''}`) {
                navigate(target, { replace: true });
            }
        },
        [location.pathname, location.search, location.hash, navigate]
    );

    return {
        isMenuOpen,
        openMenu,
        closeMenu,
        toggleMenu,
        shrinkValue,
        highlightStrength,
        navItems,
        activeItemKey,
        localePrefix,
        currentLocale,
        normalizedPath,
        pathWithoutLocale,
        shouldReduceMotion,
        navigateWithLocale,
    };
};

export default useHeaderState;
