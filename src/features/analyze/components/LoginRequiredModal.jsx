import React, { useEffect, useMemo, useState } from "react";
import axios from "../../../api/http";
import { AUTH_ENDPOINTS } from "../../../api/endPointRoute";
import { useAuth } from "providers/authProvider";
import { useTranslation } from "react-i18next";
import {rememberReturnCheckpoint} from "../../../lib/returnCheckpoint";
import {CHECKPOINT_TYPES} from "../../../lib/returnCheckpoint/constants";
const overlayClass =
  "fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm";

export default function LoginRequiredModal({
  open,
  onClose,
  onSuccess,
  onNeedEmailVerification,
  defaultEmail = "",
  returnPath = "/analyze/upload",
  onNavigateSignup,
  onNavigateForgot,
}) {
  const { setAccessToken, retryBootstrap } = useAuth();
  const { t } = useTranslation('common');
  const [form, setForm] = useState({ userId: defaultEmail, password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setError(null);
      setLoading(false);
      setForm((prev) => ({
        userId: defaultEmail || prev.userId || "",
        password: "",
      }));
      const onKey = (e) => {
        if (e.key === "Escape") {
          onClose?.();
        }
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [open, defaultEmail, onClose]);

  const disabled = useMemo(
    () => loading || !form.userId || !form.password,
    [loading, form]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (disabled) return;
    setLoading(true);
    setError(null);
    try {
      rememberReturnCheckpoint(CHECKPOINT_TYPES.UPLOAD, returnPath);
      const response = await axios.post(
        AUTH_ENDPOINTS.SIGNIN,
        {
          user: { userId: form.userId },
          password: { password: form.password },
        },
        { withCredentials: true }
      );
      const token = response?.data?.accessToken;
      if (!token) {
        throw new Error("액세스 토큰을 받지 못했어요.");
      }
      if (typeof setAccessToken === "function") {
        setAccessToken(token);
      }
      if (typeof retryBootstrap === "function") {
        await retryBootstrap();
      }
      setForm({ userId: "", password: "" });
      onSuccess?.();
      onClose?.();
    } catch (err) {
      const resp = err?.response;
      const payload = resp?.data;
      const code = payload?.code || payload?.error;
      const message =
        payload?.message ||
        payload?.error ||
        err?.message ||
        "로그인에 실패했어요.";
      if (code === "EMAIL_NOT_VERIFIED") {
        onNeedEmailVerification?.(form.userId);
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleGoogleLogin = () => {
    rememberReturnCheckpoint(CHECKPOINT_TYPES.UPLOAD, returnPath);
    window.location.href = AUTH_ENDPOINTS.GOOGLE;
  };

  if (!open) return null;

  return (
    <div className={overlayClass} role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/95 p-8 text-slate-100 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{t('loginModal.title', '로그인이 필요해요')}</h2>
            <p className="text-sm text-slate-400">
              {t('loginModal.subtitle', '이메일 또는 Google 계정으로 로그인해 주세요.')}
            </p>
          </div>
          <button
            type="button"
            className="rounded-full bg-slate-800/60 p-2 text-slate-300 transition hover:text-white"
            onClick={onClose}
            aria-label="닫기"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6l12 12M18 6L6 18"
              />
            </svg>
          </button>
        </div>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label htmlFor="modal-userId" className="text-xs text-slate-400">
              이메일
            </label>
            <input
              id="modal-userId"
              type="email"
              autoComplete="email"
              value={form.userId}
              onChange={handleChange("userId")}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="modal-password" className="text-xs text-slate-400">
              비밀번호
            </label>
            <input
              id="modal-password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange("password")}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
              placeholder="••••••••"
            />
          </div>
          {error && (
            <p className="text-xs text-rose-300">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={disabled}
            className={`mt-2 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-400 to-sky-400 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_-22px_rgba(59,130,246,0.55)] transition ${
              disabled ? "opacity-60" : "active:scale-[0.99]"
            }`}
          >
            {loading ? t('loginModal.loading', '로그인 중…') : t('loginModal.emailButton', '이메일로 로그인')}
          </button>
        </form>

        <div className="relative mt-6 flex items-center">
          <span className="h-px flex-1 bg-slate-800" />
          <span className="px-3 text-[11px] font-semibold tracking-[0.25em] text-slate-500">
            OR
          </span>
          <span className="h-px flex-1 bg-slate-800" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-4 text-sm font-medium text-slate-100 transition hover:border-indigo-400/60 hover:bg-indigo-500/10"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt=""
            className="h-5 w-5"
          />
          {t('loginModal.googleButton', 'Google로 계속하기')}
        </button>

        <div className="mt-6 space-y-3 text-sm text-slate-300">
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-400">{t('loginModal.signupPrompt', '아직 계정이 없으신가요?')}</span>
            <button
              type="button"
              onClick={() => onNavigateSignup?.()}
              className="text-indigo-300 transition hover:text-indigo-200"
            >
              {t('loginModal.signupAction', '회원가입')}
            </button>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-400">{t('loginModal.forgotPrompt', '비밀번호를 잊으셨나요?')}</span>
            <button
              type="button"
              onClick={() => onNavigateForgot?.()}
              className="text-indigo-300 transition hover:text-indigo-200"
            >
              {t('loginModal.forgotAction', '도움 요청')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
