import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import MainPage from "../app/features/main/MainPage";
import Login from "../app/features/login";
import FreeTrial from "pages/freeTrial";
import Issues from "pages/Issues";
import CustomErrorPage from "pages/CustomErrorPage";
import Docs from "pages/Docs";
import Profile from "../pages/Profile";
import Dashboard from "../pages/Dashboard";
import Pricing from "pages/Pricing";
import Feature from "pages/Feature";
import Agree from "../app/features/agree";
import Register from "../app/features/register";
import Support from "pages/Support";
import MediaAnalyze from "pages/MediaAnalyze";
import EmailVerification from "pages/EmailVerification";
import AnalyzeResult from "pages/AnalyzeResult";
import Blog from "../pages/Blog";
import BlogRoute from "../pages/BlogRoute";
import MobileAnalyzeStart from "../pages/MobileAnalyzeStart";
import MobileAnalyzeUpload from "../pages/MobileAnalyzeUpload";
import MobileAnalyzeResult from "../pages/MobileAnalyzeResult";
import BlogPost from "../pages/BlogPost";
import AdminHome from "../pages/AdminHome";
import AdminPreview from "../pages/AdminPreview";
import AdminMail from "../pages/AdminMail";
import AdminBlog from "../pages/AdminBlog";
import AdminIssueInbox from "../pages/AdminIssueInbox";
import AdminServiceHealth from "../pages/AdminServiceHealth";
import AdminUsers from "../pages/AdminUsers";
import AdminLatestAnalysis from "../pages/AdminLatestAnalysis";

const SUPPORTED_LOCALES = ['en', 'ko'];
const getLocaleFromPath = (pathname = '/') => {
    const match = pathname.match(/^\/([a-zA-Z-]{2,5})(?=\/|$)/);
    if (!match) return null;
    const candidate = match[1].toLowerCase();
    return SUPPORTED_LOCALES.includes(candidate) ? candidate : null;
};

// Create/update canonical link to point to language-prefixed URL
function CanonicalLink() {
    const loc = useLocation();
    const { t, i18n } = useTranslation(['home','common']);
    useEffect(() => {
        const origin = window.location.origin;
        let lng = (i18n.language || 'en').slice(0,2);
        if (!SUPPORTED_LOCALES.includes(lng)) lng = 'en';
        let path = loc.pathname || '/';
        if (!path.startsWith('/en') && !path.startsWith('/ko')) {
            path = '/' + lng + (path === '/' ? '' : path);
        }
        const href = origin + path + (loc.search || '') + (loc.hash || '');
        let link = document.querySelector('link[rel="canonical"]');
        if (!link) {
            link = document.createElement('link');
            link.setAttribute('rel','canonical');
            document.head.appendChild(link);
        }
        link.setAttribute('href', href);

        // Basic meta
        const title = t('meta.title', { ns: 'home', defaultValue: 'GraviFox — GenAI image authenticity API' });
        const desc = t('meta.description', { ns: 'home', defaultValue: 'Verify AI-generated images with a simple API. Fast, secure, and easy to integrate.' });
        const siteName = t('app.name', { ns: 'common', defaultValue: 'GraviFox' });
        document.title = title;
        const ensureMeta = (name, attr = 'name') => {
            let m = document.querySelector(`meta[${attr}="${name}"]`);
            if (!m) { m = document.createElement('meta'); m.setAttribute(attr, name); document.head.appendChild(m); }
            return m;
        };
        ensureMeta('description').setAttribute('content', desc);
        ensureMeta('og:title', 'property').setAttribute('content', title);
        ensureMeta('og:description', 'property').setAttribute('content', desc);
        ensureMeta('og:site_name', 'property').setAttribute('content', siteName);
        ensureMeta('og:url', 'property').setAttribute('content', href);
        const ogLocale = lng === 'ko' ? 'ko_KR' : 'en_US';
        ensureMeta('og:locale', 'property').setAttribute('content', ogLocale);
        ensureMeta('twitter:card').setAttribute('content', 'summary');
        ensureMeta('twitter:title').setAttribute('content', title);
        ensureMeta('twitter:description').setAttribute('content', desc);
        ensureMeta('og:image', 'property').setAttribute('content', origin + '/gravifox.ico');
        ensureMeta('twitter:image').setAttribute('content', origin + '/gravifox.ico');

        // JSON-LD
        const removeIfExists = (id) => { const n = document.getElementById(id); if (n) n.remove(); };
        removeIfExists('ld-org');
        removeIfExists('ld-app');
        const org = { '@context': 'https://schema.org', '@type': 'Organization', name: siteName, url: origin, logo: origin + '/gravifox.ico' };
        const app = { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: title, applicationCategory: 'AIApplication', operatingSystem: 'Web', url: href, description: desc };
        const s1 = document.createElement('script'); s1.type = 'application/ld+json'; s1.id = 'ld-org'; s1.text = JSON.stringify(org);
        const s2 = document.createElement('script'); s2.type = 'application/ld+json'; s2.id = 'ld-app'; s2.text = JSON.stringify(app);
        document.head.appendChild(s1); document.head.appendChild(s2);
    }, [i18n.language, loc.pathname, loc.search, loc.hash, t]);
    return null;
}

// Keeps i18n language aligned with the current /:lng prefix so translations match the URL.
function LanguageSync() {
    const loc = useLocation();
    const { i18n } = useTranslation();
    useEffect(() => {
        const next = getLocaleFromPath(loc.pathname);
        if (!next) return;
        const current = (i18n.language || '').slice(0,2);
        if (current === next) return;
        i18n.changeLanguage(next);
        if (typeof window !== 'undefined') {
            try {
                window.localStorage.setItem('i18nextLng', next);
            } catch {}
        }
    }, [loc.pathname, i18n]);
    return null;
}

// Legacy (non-prefixed) route → detect language and redirect to prefixed
function LegacyToLocalized() {
    const nav = useNavigate();
    const loc = useLocation();
    useEffect(() => {
        const browser = (navigator.language || 'en').slice(0,2);
        const stored = (typeof localStorage !== 'undefined' && localStorage.getItem('i18nextLng')) || '';
        const pick = SUPPORTED_LOCALES.includes(stored)
            ? stored
            : (SUPPORTED_LOCALES.includes(browser) ? browser : 'en');
        const remapPath = (pathname) => {
            if (pathname.startsWith('/analyze/mobile/upload')) return '/analyze/upload';
            if (pathname.startsWith('/analyze/mobile/result')) return '/analyze/result';
            if (pathname.startsWith('/analyze/mobile')) return '/analyze';
            return pathname;
        };
        const nextPath = remapPath(loc.pathname);
        nav(`/${pick}${nextPath}${loc.search}${loc.hash}`, { replace: true, state: loc.state });
    }, [loc.hash, loc.pathname, loc.search, loc.state, nav]);
    return null;
}

function LangRedirect() {
    const nav = useNavigate();
    const loc = useLocation();
    useEffect(() => {
        const browser = (navigator.language || 'en').slice(0,2);
        const stored = (typeof localStorage !== 'undefined' && localStorage.getItem('i18nextLng')) || '';
        const pick = SUPPORTED_LOCALES.includes(stored)
            ? stored
            : (SUPPORTED_LOCALES.includes(browser) ? browser : 'en');
        const path = loc.pathname === '/' ? '' : loc.pathname;
        nav(`/${pick}${path}${loc.search}${loc.hash}`, { replace: true, state: loc.state });
    }, [loc.hash, loc.pathname, loc.search, loc.state, nav]);
    return null;
}

function AnimatedRoutes() {
    const location = useLocation();

    return (
        <>
            <CanonicalLink />
            <LanguageSync />
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                {/* Root -> language prefixed redirect */}
                <Route path="/" element={<LangRedirect />} />
                {/* Language-prefixed duplicates */}
                <Route path=":lng" element={<motion.div><MainPage /></motion.div>} />
                <Route path=":lng/login" element={<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}><Login /></motion.div>} />
                <Route path=':lng/free-trial' element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}><FreeTrial /></motion.div>} />
                <Route path=':lng/settings' element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}><Profile /></motion.div>} />
                <Route path=':lng/dashboard' element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}><Dashboard /></motion.div>} />
                <Route path=":lng/issue" element={<motion.div><Issues /></motion.div>} />
                <Route path=":lng/docs" element={<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}><Docs /></motion.div>} />
                <Route path=":lng/agree" element={<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}><Agree /></motion.div>} />
                <Route path=":lng/register" element={<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}><Register /></motion.div>} />
                <Route path=":lng/verify" element={<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}><EmailVerification /></motion.div>} />
                <Route path=":lng/analyze/desktop" element={<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}><MediaAnalyze /></motion.div>} />
                <Route path=":lng/analyze/desktop/result" element={<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}><AnalyzeResult /></motion.div>} />
                <Route path=":lng/analyze" element={<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}><MobileAnalyzeStart /></motion.div>} />
                <Route path=":lng/analyze/upload" element={<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}><MobileAnalyzeUpload /></motion.div>} />
                <Route path=":lng/analyze/result" element={<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}><MobileAnalyzeResult /></motion.div>} />
                <Route path=":lng/pricing" element={<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}><Pricing /></motion.div>} />
                <Route path=":lng/feature" element={<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}><Feature /></motion.div>} />
                <Route path=":lng/support" element={<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}><Support /></motion.div>} />
                <Route path=":lng/blog" element={<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}><BlogRoute /></motion.div>} />
                <Route path=":lng/blog/:slug" element={<motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3, ease: "easeOut" }}><BlogPost /></motion.div>} />
                <Route path=":lng/admin" element={<motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35, ease: "easeOut" }}><AdminHome /></motion.div>} />
                <Route path=":lng/admin/preview" element={<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4, ease: "easeOut" }}><AdminPreview /></motion.div>} />
                <Route path=":lng/admin/analysis" element={<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4, ease: "easeOut" }}><AdminLatestAnalysis /></motion.div>} />
                <Route path=":lng/admin/mail" element={<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35, ease: "easeOut" }}><AdminMail /></motion.div>} />
                <Route path=":lng/admin/blog" element={<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35, ease: "easeOut" }}><AdminBlog /></motion.div>} />
                <Route path=":lng/admin/issues" element={<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35, ease: "easeOut" }}><AdminIssueInbox /></motion.div>} />
                <Route path=":lng/admin/service-health" element={<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4, ease: "easeOut" }}><AdminServiceHealth /></motion.div>} />
                <Route path=":lng/admin/users" element={<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35, ease: "easeOut" }}><AdminUsers /></motion.div>} />

                {/* Legacy non-prefixed routes → redirect to localized */}
                <Route path="/login" element={<LegacyToLocalized />} />
                <Route path="/free-trial" element={<LegacyToLocalized />} />
                <Route path="/settings" element={<LegacyToLocalized />} />
                <Route path="/dashboard" element={<LegacyToLocalized />} />
                <Route path="/issue" element={<LegacyToLocalized />} />
                <Route path="/docs" element={<LegacyToLocalized />} />
                <Route path="/agree" element={<LegacyToLocalized />} />
                <Route path="/register" element={<LegacyToLocalized />} />
                <Route path="/verify" element={<LegacyToLocalized />} />
                <Route path="/analyze" element={<LegacyToLocalized />} />
                <Route path="/analyze/mobile" element={<LegacyToLocalized />} />
                <Route path="/analyze/mobile/upload" element={<LegacyToLocalized />} />
                <Route path="/analyze/mobile/result" element={<LegacyToLocalized />} />
                <Route path="/analyze/upload" element={<LegacyToLocalized />} />
                <Route path="/analyze/result" element={<LegacyToLocalized />} />
                <Route path="/analyze/desktop" element={<LegacyToLocalized />} />
                <Route path="/analyze/desktop/result" element={<LegacyToLocalized />} />
                <Route path="/pricing" element={<LegacyToLocalized />} />
                <Route path="/support" element={<LegacyToLocalized />} />
                <Route path="/feature" element={<LegacyToLocalized />} />
                <Route path="/blog" element={<LegacyToLocalized />} />
                <Route path="/blog/:slug" element={<LegacyToLocalized />} />
                <Route path="/admin" element={<LegacyToLocalized />} />
                <Route path="/admin/preview" element={<LegacyToLocalized />} />
                <Route path="/admin/analysis" element={<LegacyToLocalized />} />
                <Route path="/admin/mail" element={<LegacyToLocalized />} />
                <Route path="/admin/blog" element={<LegacyToLocalized />} />
                <Route path="/admin/issues" element={<LegacyToLocalized />} />
                <Route path="/admin/service-health" element={<LegacyToLocalized />} />
                <Route path="/admin/users" element={<LegacyToLocalized />} />

                <Route path="/*" element={<motion.div><CustomErrorPage status={"404"} /></motion.div>} />
                </Routes>
            </AnimatePresence>
        </>
    );
}

export default AnimatedRoutes;
