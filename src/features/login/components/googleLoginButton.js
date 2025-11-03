import React from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import {AUTH_ENDPOINTS} from "../../../api/endPointRoute";
import {
    rememberReturnCheckpoint,
} from "../../../lib/returnCheckpoint/index.js";
import { CHECKPOINT_TYPES } from "../../../lib/returnCheckpoint/constants.js";

const GoogleLoginButton = ({ variant = 'dark' }) => {
    const { t } = useTranslation('common');
    const location = useLocation();
    const googleLoginHandler = () => {
        // Compute a sensible return path (previous or default), not the login page
        // Default to site root when no previous path exists
        const defaultPath = "/";
        const fromLocation = location.state?.from;
        const fromPath = fromLocation?.pathname || defaultPath;
        const fromSearch = fromLocation?.search || "";
        const target = `${fromPath}${fromSearch}`;
        rememberReturnCheckpoint(CHECKPOINT_TYPES.AUTH, target);
        window.location.href = AUTH_ENDPOINTS.GOOGLE;
    };
    // Auto style via Tailwind dark: variants (no prop needed)
    const base = "flex h-14 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition hover:bg-slate-50 focus:ring-2 focus:ring-indigo-400/30 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-indigo-400/60 dark:hover:bg-indigo-500/10 dark:focus:ring-indigo-400/30 dark:focus:ring-offset-0";
    return (
        <button onClick={googleLoginHandler} className={base}>
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-[18px] w-[18px]" />
            {t('loginModal.googleButton', 'Google로 계속하기')}
        </button>
    )
}
export default GoogleLoginButton;
