import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../app/layout/Header";
import Footer from "../app/layout/Footer/Footer";
import axios from "axios";
import { EMAIL_ENDPOINTS } from "api/endPointRoute";
import { useAuth } from "providers/authProvider";

export default function EmailVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lng } = useParams();
  const { userInfo, isLoading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

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
  const [info, setInfo] = useState("");

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
      setInfo("이메일 정보를 확인할 수 없어요. 로그인 후 다시 시도해 주세요.");
      return;
    }
    try {
      setSubmitting(true);
      setInfo("");
      const { data } = await axios.post(EMAIL_ENDPOINTS.REQUEST, { email: initialEmail, purpose: "SIGNUP" });
      const wait = Number.isFinite(data?.resendAfter) ? data.resendAfter : 60;
      setSecondsLeft(wait);
      setInfo(data?.sent ? "인증 메일을 다시 보냈어요." : "잠시 후 다시 시도해 주세요.");
    } catch (e) {
      setInfo("재발송에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    '메일함을 열고 “[GraviFox] 이메일 인증” 메일을 확인해 주세요.',
    '메일 본문에서 ‘인증하기’ 버튼을 한 번 눌러 주세요.',
    '완료되면 로그인 화면으로 돌아가 다시 로그인하면 준비 끝이에요.',
  ];

  if (redirecting) {
    return (
      <div className="dark min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Header />
        <main className="flex-1 flex justify-center">
          <div className="w-full max-w-sm px-5 pt-24 pb-16 text-center space-y-4">
            <h2 className="text-xl font-semibold text-indigo-200">인증이 완료되었어요!</h2>
            <p className="text-sm text-slate-300">잠시 후 홈으로 이동합니다.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />
      <main className="flex-1 flex justify-center">
        <div className="w-full max-w-sm px-5 pt-24 pb-16">
          <header className="text-center mb-6">
            <h2
              onClick={() => navigate(localizedPath('/'))}
              translate="no"
              className="cursor-pointer select-none text-[clamp(22px,5vw,36px)] font-extrabold tracking-tight leading-none text-indigo-400 drop-shadow mb-2"
            >
              REKWIEM
            </h2>
            <p className="text-sm text-slate-300">가입을 마무리하려면 이메일을 확인해 주세요.</p>
          </header>

          <section className="rounded-3xl border border-slate-800/70 bg-slate-900/70 p-6 shadow-[0_24px_48px_-28px_rgba(15,23,42,0.85)] space-y-6">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-200">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M1.5 8.67v8.58A2.25 2.25 0 0 0 3.75 19.5h16.5A2.25 2.25 0 0 0 22.5 17.25V8.67l-8.69 5.25a3.75 3.75 0 0 1-3.62 0L1.5 8.67Z"/><path d="M22.5 6.75v-.375A2.25 2.25 0 0 0 20.25 4.125H3.75A2.25 2.25 0 0 0 1.5 6.375V6.75l9.19 5.55a2.25 2.25 0 0 0 2.12 0L22.5 6.75Z"/></svg>
              </span>
              <div className="space-y-2">
                <h1 className="text-lg font-semibold text-slate-100">이메일 인증을 완료해 주세요</h1>
                <p className="text-sm text-slate-300">회원가입 시 입력한 이메일로 인증 링크를 전송했어요.</p>
              </div>
            </div>

            <p className="text-sm text-slate-300">
              인증 메일의 ‘인증하기’만 한 번 눌러 주시면 가입이 완료됩니다.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleResend}
                disabled={secondsLeft > 0 || submitting}
                className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  secondsLeft > 0 || submitting
                    ? 'bg-slate-800/70 text-slate-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-500 via-indigo-400 to-sky-400 text-white shadow-[0_18px_36px_-22px_rgba(59,130,246,0.55)] active:scale-[0.99]'
                }`}
                aria-live="polite"
              >
                인증 메일 다시 보내기
              </button>
              {secondsLeft > 0 && (
                <p className="text-xs text-slate-400">{secondsLeft}초 후 재발송이 가능해요.</p>
              )}
              {info && <p className="text-xs text-indigo-200">{info}</p>}

              <button
                type="button"
                onClick={() => navigate(localizedPath('/login'))}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-indigo-400/50 hover:text-white"
              >
                로그인 화면으로 돌아가기
              </button>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
