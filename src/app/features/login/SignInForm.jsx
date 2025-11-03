import React, { useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import SignInAPI from "./api/signInAPI";
import GoogleLoginButton from "features/login/components/googleLoginButton";
import { rememberReturnCheckpoint } from "../../../lib/returnCheckpoint/index.js";
import { CHECKPOINT_TYPES } from "../../../lib/returnCheckpoint/constants.js";
import { useTranslation } from 'react-i18next';

// no-props error UI; handled inline within SignInForm

export default function SignInForm() {
    const { t } = useTranslation('common');
    const navigate = useNavigate();
    const { lng } = useParams();
    const location = useLocation();
    const localeMatch = location.pathname?.match(/^\/([a-zA-Z-]{2,5})(?=\/|$)/);
    const prefix = localeMatch ? `/${localeMatch[1]}` : "";
    const defaultPath = `${prefix}/analyze/upload`;
    const fromLocation = location.state?.from;
    const fromPath = fromLocation?.pathname || defaultPath;
    const fromSearch = fromLocation?.search || "";
    const returnPath = `${fromPath}${fromSearch}`;

    const localizedPath = (path) => {
        const pref = lng ? `/${lng}` : "";
        if (path === "/" && pref) {
            return pref;
        }
        return `${pref}${path}`;
    };

    const [errorStatus, setErrorStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const { signIn } = SignInAPI();
    const [formState, setFormState] = useState({ userId: "", password: "" });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await signIn(formState);
        } catch (error) {
            if (error?.code === "EMAIL_NOT_VERIFIED") {
                navigate(localizedPath("/verify"), { state: { email: formState.userId } });
                return;
            }
            setErrorStatus(error.status);
            setErrorMessage(error.message);
        }
    };

    const handleChangeForm = () => {
        rememberReturnCheckpoint(CHECKPOINT_TYPES.AUTH, returnPath);
        navigate(localizedPath("/agree"));
    };

    const handleInputChange = (field) => (event) => {
        setFormState((prev) => ({ ...prev, [field]: event.target.value }));
    };

    return (
        <div className="mx-auto w-full max-w-sm rounded-3xl border border-slate-200 bg-white px-6 py-10 text-slate-900 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.2)] sm:px-8 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-100 dark:shadow-[0_24px_48px_-24px_rgba(15,23,42,0.8)]">
            <div className="space-y-2 text-center">
                <h2 className="text-2xl font-semibold tracking-tight">{t('mobileAnalyze.loginPage.title', 'Sign in to your account')}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('mobileAnalyze.loginPage.subtitle', 'Access your features right away after signing in.')}</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="space-y-2">
                    <label htmlFor="userId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        {t('mobileAnalyze.loginPage.emailLabel', 'Email')}
                    </label>
                    <input
                        id="userId"
                        name="userId"
                        type="text"
                        autoComplete="email"
                        value={formState.userId}
                        onChange={handleInputChange("userId")}
                        placeholder={t('mobileAnalyze.loginPage.placeholders.email', 'you@example.com')}
                        className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-400/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder-slate-500"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            {t('mobileAnalyze.loginPage.passwordLabel', 'Password')}
                        </label>
                        <Link
                            to={localizedPath("/support")}
                            className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200"
                            onClick={() => rememberReturnCheckpoint(CHECKPOINT_TYPES.AUTH, returnPath)}
                        >
                            {t('mobileAnalyze.loginPage.forgotPassword', 'Forgot password')}
                        </Link>
                    </div>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        value={formState.password}
                        onChange={handleInputChange("password")}
                        placeholder={t('mobileAnalyze.loginPage.placeholders.password', '••••••••')}
                        className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-400/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder-slate-500"
                    />
                </div>

                <button
                    type="submit"
                    className="flex w-full justify-center rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-400 to-sky-400 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_-22px_rgba(59,130,246,0.55)] transition active:scale-[0.99]"
                >
                    {t('mobileAnalyze.loginPage.submit', 'Sign in')}
                </button>

                {(errorStatus || errorMessage) ? (
                    <div className="mb-4 flex items-center rounded-lg bg-red-50 p-4 text-red-800 dark:bg-gray-800 dark:text-red-400" role="alert">
                        <svg className="h-4 w-4 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                        </svg>
                        <div className="ms-3 text-sm font-medium">
                            {errorMessage || (
                                errorStatus === 422
                                    ? t('mobileAnalyze.loginPage.errors.oops', "Oops! Something doesn’t match.")
                                    : errorStatus === 401
                                    ? t('mobileAnalyze.loginPage.errors.invalid', 'Invalid credentials.')
                                    : errorStatus === 400
                                    ? t('mobileAnalyze.loginPage.errors.mismatch', 'Something doesn’t match.')
                                    : t('mobileAnalyze.loginPage.errors.unexpected', 'Unexpected error occurred.')
                            )}
                        </div>
                        <button
                            type="button"
                            className="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 p-1.5 text-red-500 hover:bg-red-200 focus:ring-2 focus:ring-red-400 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700"
                            aria-label="Close"
                            onClick={() => { setErrorStatus(null); setErrorMessage(null); }}
                        >
                            <svg className="h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                            </svg>
                        </button>
                    </div>
                ) : null}
            </form>

            <div className="relative mt-8 flex items-center">
                <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                <span className="px-3 text-xs font-semibold tracking-[0.25em] text-slate-500">{t('mobileAnalyze.loginPage.or', 'OR')}</span>
                <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="mt-6">
                <GoogleLoginButton />
            </div>

            <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                {t('mobileAnalyze.loginPage.signupPrompt', 'Need an account?')}{" "}
                <button className="font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200" onClick={handleChangeForm}>
                    {t('mobileAnalyze.loginPage.signupAction', 'Sign up')}
                </button>
            </p>
        </div>
    );
}
