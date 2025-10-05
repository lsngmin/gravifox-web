import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { EMAIL_ENDPOINTS } from "api/endPointRoute";

export default function EmailVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lng } = useParams();
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
  const navigateToHome = () => navigate(localizedPath("/"));

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

  return (
    <div className="p-6 md:p-12 lg:p-20">
      {/* 상단 브랜드 */}
      <div className="mt-8 md:mt-14">
        <div className="flex justify-center items-center">
          <h2
            onClick={navigateToHome}
            translate="no"
            className="cursor-pointer select-none text-[clamp(28px,5vw,60px)] font-extrabold tracking-tight leading-none text-indigo-500 drop-shadow-md mb-10"
          >
            GRAVIFOX.
          </h2>
        </div>

        {/* 본문 카드 */}
        <div className="flex justify-center items-center">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-sm p-6 md:p-8">
            {/* 헤더 */}
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                {/* mail icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M1.5 8.67v8.58A2.25 2.25 0 0 0 3.75 19.5h16.5A2.25 2.25 0 0 0 22.5 17.25V8.67l-8.69 5.25a3.75 3.75 0 0 1-3.62 0L1.5 8.67Z"/><path d="M22.5 6.75v-.375A2.25 2.25 0 0 0 20.25 4.125H3.75A2.25 2.25 0 0 0 1.5 6.375V6.75l9.19 5.55a2.25 2.25 0 0 0 2.12 0L22.5 6.75Z"/></svg>
              </span>
              <div>
                <h1 className="text-base md:text-lg font-semibold text-slate-900">이메일 인증 안내</h1>
                <p className="text-xs md:text-sm text-slate-600">가입한 이메일로 인증 링크를 보냈습니다.</p>
              </div>
            </div>

            {/* 구분선 */}
            <div className="h-px w-full bg-slate-100 mb-6" />

            {/* 안내 1: 인증 방법 */}
            <div className="space-y-3 mb-6">
              <h2 className="text-sm font-medium text-slate-900">인증 방법</h2>
              <ol className="space-y-2">
                {[
                  '메일함에서 “[GraviFox] 이메일 인증 요청”을 엽니다.',
                  '메일 본문에서 ‘인증하기’ 버튼을 클릭합니다.',
                  '완료 후 로그인 화면으로 돌아가 다시 로그인합니다.',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* 안내 2: 메일 미수신 시 */}
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-slate-900">메일이 오지 않았나요?</h2>
              <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                <li>스팸/프로모션/광고함을 확인해 주세요.</li>
                <li>1–2분 기다렸다가 새로고침해 주세요.</li>
                <li>가입한 이메일 주소가 맞는지 확인해 주세요.</li>
              </ul>
              <p className="text-xs text-slate-500">재발송은 보안을 위해 약 60초 간격으로 제한됩니다.</p>
            </div>

            {/* 액션 */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="inline-flex">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={secondsLeft > 0 || submitting}
                  className={
                    `inline-flex items-center justify-center rounded-md px-3.5 py-2 text-sm
                     font-semibold text-white shadow-sm transition-colors
                     bg-indigo-600 hover:bg-indigo-500
                     disabled:bg-indigo-300 disabled:hover:bg-indigo-300
                     disabled:text-white disabled:opacity-100 disabled:cursor-default`
                  }
                  aria-live="polite"
                >
                  인증 메일 다시 보내기
                </button>
              </div>
              <button
                type="button"
                onClick={() => navigate(localizedPath('/login'))}
                className="inline-flex items-center justify-center rounded-md px-3.5 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                로그인으로 돌아가기
              </button>
            </div>
            {secondsLeft > 0 && (
              <p className="mt-2 text-xs text-slate-700">{secondsLeft}초 후 재발송 가능</p>
            )}
            {info && (
              <p className="mt-1 text-xs text-slate-600">{info}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
