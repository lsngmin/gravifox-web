import React from "react";
import { useTranslation } from "react-i18next";
import {AUTH_ENDPOINTS} from "../../../api/endPointRoute";
import {
    rememberReturnCheckpoint,
} from "../../../lib/returnCheckpoint/index.js";
import { CHECKPOINT_TYPES } from "../../../lib/returnCheckpoint/constants.js";

const GoogleLoginButton = ({ variant = 'light', returnPath }) => {
    const { t } = useTranslation('common');
    const googleLoginHandler = () => {
        let target = returnPath;
        if (!target && typeof window !== 'undefined') {
            target = `${window.location.pathname}${window.location.search}`;
        }
        rememberReturnCheckpoint(CHECKPOINT_TYPES.AUTH, target);
        window.location.href = AUTH_ENDPOINTS.GOOGLE;
    };
    const isDark = variant === 'dark';
    const base = isDark
        ? "flex h-14 w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-4 text-sm font-medium text-slate-100 outline-none transition hover:border-indigo-400/60 hover:bg-indigo-500/10 focus:ring-2 focus:ring-indigo-400/30"
        : "flex h-14 w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white p-2 text-sm font-medium text-black outline-none focus:ring-2 focus:ring-[#333] focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60";
    return (
        <button onClick={googleLoginHandler} className={base}>
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-[18px] w-[18px]" />
            {t('loginModal.googleButton', 'Google로 계속하기')}
        </button>
    )
}
export default GoogleLoginButton;
