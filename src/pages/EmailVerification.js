import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "../app/layout/Header";
import Footer from "../app/layout/Footer/Footer";
import axios from "axios";
import { EMAIL_ENDPOINTS } from "api/endPointRoute";
import { useAuth } from "providers/authProvider";

export default function EmailVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lng } = useParams();
  const supportedLangs = ['ko', 'en'];
  const preferredLang = supportedLangs.includes((lng || '').toLowerCase())
    ? (lng || '').toLowerCase()
    : 'ko';
  const { userInfo, isLoading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);
  const { t } = useTranslation("common");

  const localizedPath = (path) => {
    const prefix = lng ? `/${lng}` : "";
    if (path === "/" && prefix) {
      return prefix;
    }
    return `${prefix}${path}`;
  };

  const initialEmail = useMemo(() => location?.state?.email || "", [location?.state]);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [infoKey, setInfoKey] = useState("");

  useEffect(() => {
    try { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); } catch (_) { window.scrollTo(0, 0); }
  }, []);

  useEffect(() => {
    if (isLoading || !userInfo?.userNo) return;
    setRedirecting(true);
    const target = lng ? `/${lng}` : "/";
    navigate(target, { replace: true });
  }, [isLoading, userInfo?.userNo, navigate, lng]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  const handleResend = async () => {
    if (secondsLeft > 0 || submitting) return;
    if (!initialEmail) {
      setInfoKey("emailVerification.messages.missingEmail");
      return;
    }
    try {
      setSubmitting(true);
      setInfoKey("");
      const { data } = await axios.post(EMAIL_ENDPOINTS.REQUEST, { email: initialEmail, purpose: "SIGNUP", lang: preferredLang });
      const wait = Number.isFinite(data?.resendAfter) ? data.resendAfter : 60;
      setSecondsLeft(wait);
      setInfoKey(data?.sent ? "emailVerification.messages.resendSuccess" : "emailVerification.messages.resendPending");
    } catch (e) {
      setInfoKey("emailVerification.messages.resendFailed");
    } finally {
      setSubmitting(false);
    }
  };

  const checklistSteps = t("emailVerification.checklist.steps", { returnObjects: true });
  const steps = Array.isArray(checklistSteps) ? checklistSteps : [];
  const infoMessage = infoKey ? t(infoKey) : "";

  if (redirecting) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col">
        <Header />
        <main className="flex-1 flex justify-center px-4 pt-24 pb-16 md:pt-28">
          <div className="w-full max-w-lg px-6 py-10 text-center space-y-4 rounded-3xl border border-slate-200 bg-white/90 shadow-xl shadow-slate-900/5 dark:border-slate-800/80 dark:bg-slate-900/70">
            <h2 className="text-xl font-semibold text-indigo-600 dark:text-indigo-200">
              {t("emailVerification.redirect.title", "Verification complete!")}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {t("emailVerification.redirect.message", "You'll be redirected home shortly.")}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col">
      <Header />
      <main className="flex-1 flex justify-center px-4 pt-24 pb-10 md:pt-28 md:pb-16">
        <div className="w-full max-w-4xl">
          <header className="text-center mb-10">
            <h2
              onClick={() => navigate(localizedPath('/'))}
              translate="no"
              className="cursor-pointer select-none text-[clamp(22px,5vw,40px)] font-extrabold tracking-tight leading-none text-indigo-600 drop-shadow-sm dark:text-indigo-400 mb-3"
            >
              REKWIEM
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300">
              {t("emailVerification.page.subtitle", "Check your inbox to finish signing up.")}
            </p>
          </header>

          <div className="grid gap-6 lg:gap-8 lg:grid-cols-2">
            <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_48px_-28px_rgba(15,23,42,0.3)] backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/70 space-y-6">
              <div className="flex items-start gap-4">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-200">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M1.5 8.67v8.58A2.25 2.25 0 0 0 3.75 19.5h16.5A2.25 2.25 0 0 0 22.5 17.25V8.67l-8.69 5.25a3.75 3.75 0 0 1-3.62 0L1.5 8.67Z"/><path d="M22.5 6.75v-.375A2.25 2.25 0 0 0 20.25 4.125H3.75A2.25 2.25 0 0 0 1.5 6.375V6.75l9.19 5.55a2.25 2.25 0 0 0 2.12 0L22.5 6.75Z"/></svg>
                </span>
                <div className="space-y-2">
                  <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                    {t("emailVerification.hero.title", "Please complete your email verification")}
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {t("emailVerification.hero.description", "We sent a confirmation link to the email you used during sign-up.")}
                  </p>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {t("emailVerification.hero.helper", "Tap the \"Verify\" button in that email once and you're good to go.")}
              </p>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={secondsLeft > 0 || submitting}
                  className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold shadow transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 ${
                    secondsLeft > 0 || submitting
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800/70 dark:text-slate-300'
                      : 'bg-gradient-to-r from-indigo-500 via-indigo-400 to-sky-400 text-white shadow-[0_18px_36px_-22px_rgba(59,130,246,0.55)] active:scale-[0.99]'
                  }`}
                  aria-live="polite"
                >
                  {t("emailVerification.actions.resend", "Resend verification email")}
                </button>
                {secondsLeft > 0 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t("emailVerification.messages.cooldown", {
                      count: secondsLeft,
                      defaultValue: "{{count}} seconds left before you can resend.",
                    })}
                  </p>
                )}
                {infoMessage && (
                  <p className="text-xs text-indigo-600 dark:text-indigo-200" aria-live="polite">
                    {infoMessage}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => navigate(localizedPath('/login'))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-indigo-400/50 dark:hover:text-white"
                >
                  {t("emailVerification.actions.login", "Back to login")}
                </button>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.25)] dark:border-slate-800/70 dark:bg-slate-900/60">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-300">
                  {t("emailVerification.checklist.label", "Checklist")}
                </p>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                  {t("emailVerification.checklist.title", "How to confirm your email")}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {t("emailVerification.checklist.description", "Follow the steps below to finish verification quickly.")}
                </p>
              </div>
              <ol className="mt-6 space-y-4">
                {steps.map((step, index) => (
                  <li key={step} className="flex items-start gap-4 text-sm text-slate-600 dark:text-slate-300">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold dark:bg-indigo-500/20 dark:text-indigo-200">{index + 1}</span>
                    <p className="leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
              {initialEmail && (
                <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/80 px-4 py-3 text-sm text-slate-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-slate-100">
                  <p className="text-xs uppercase tracking-[0.3em] text-indigo-500 dark:text-indigo-200">
                    {t("emailVerification.checklist.sentLabel", "Email sent to")}
                  </p>
                  <p className="mt-2 font-medium break-all">{initialEmail}</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
