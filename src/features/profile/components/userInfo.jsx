import React from "react";
import ProfileCard from "./ProfileCard";
import PlanCard from "./PlanCard";
import SecurityCard from "./SecurityCard";
import { BellIcon, SwatchIcon, TrashIcon } from "@heroicons/react/24/outline";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";

export default function UserInfo({ theme = "dark", onThemeChange }) {
  const { i18n } = useTranslation();
  const isDark = theme === "dark";
  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    if (typeof onThemeChange === "function") onThemeChange(next);
  };
  const supportedLanguages = [
    { code: "ko", label: "한국어" },
    { code: "en", label: "English" },
  ];
  const currentLang = (i18n.language || "en").slice(0, 2);
  const handleLanguageChange = (lng) => {
    const target = supportedLanguages.find(({ code }) => code === lng) ? lng : "en";
    if (target === currentLang) return;
    i18n.changeLanguage(target);
    try {
      window?.localStorage?.setItem("i18nextLng", target);
    } catch {}
  };

  return (
    <div
      className={`relative mt-10 w-full ${
        isDark ? "text-slate-100" : "text-gray-900"
      }`}
    >
      {isDark ? (
        <>
          <div className="pointer-events-none absolute -top-40 right-[-160px] h-72 w-72 rounded-full bg-sky-400/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 left-[-160px] h-80 w-80 rounded-full bg-emerald-400/12 blur-[140px]" />
        </>
      ) : (
        <>
          <div className="pointer-events-none absolute -top-32 right-[-160px] h-72 w-72 rounded-full bg-emerald-200/40 blur-[120px]" />
          <div className="pointer-events-none absolute -bottom-32 left-[-160px] h-80 w-80 rounded-full bg-sky-200/35 blur-[120px]" />
        </>
      )}

      <div className="relative space-y-10">
        {/* Settings 헤더 */}
        <div className="max-w-2xl">
          <h1 className={`text-3xl font-semibold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>설정</h1>
          <p className={`mt-2 text-sm ${isDark ? "text-slate-300/90" : "text-gray-600"}`}>
            프로필과 이용 환경을 한 곳에서 관리해 보세요.
          </p>
        </div>

        {/* 프로필 카드 */}
        <ProfileCard theme={theme} />

        {/* 플랜 카드 */}
        <PlanCard theme={theme} />

        {/* 보안 카드 */}
        <SecurityCard theme={theme} />

        {/* 알림 */}
        <section
          className={
            isDark
              ? "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_40px_-28px_rgba(15,23,42,0.9)] backdrop-blur"
              : "rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          }
        >
          {isDark && (
            <>
              <div className="pointer-events-none absolute -top-24 -right-10 h-44 w-44 rounded-full bg-indigo-400/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-14 h-48 w-48 rounded-full bg-sky-400/16 blur-[120px]" />
            </>
          )}
          <div className="relative">
            <div className="flex items-center gap-2">
              <BellIcon className={`h-6 w-6 ${isDark ? "text-indigo-300" : "text-indigo-500"}`} />
              <h2 className="text-base font-semibold">알림 설정</h2>
            </div>
            <p className={`mt-1 text-sm ${isDark ? "text-slate-300/80" : "text-gray-600"}`}>
              이메일과 푸시 알림 수신 방식을 자유롭게 구성하세요.
            </p>
            <div className={`mt-3 h-px ${isDark ? "bg-white/5" : "bg-gray-200"}`} />
            <div
              className={`mt-4 rounded-xl border border-dashed ${
                isDark ? "border-white/15 bg-white/[0.03]" : "border-gray-300 bg-gray-50"
              } p-5`}
            >
              <p className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-gray-800"}`}>
                아직 제공되지 않는 기능이에요.
              </p>
              <p className={`mt-1 text-sm leading-6 ${isDark ? "text-slate-300/80" : "text-gray-500"}`}>
                알림 설정은 준비 중입니다. 알림 채널을 직접 선택할 수 있는 기능이 열리면 대시보드와 이메일로 먼저 알려드릴게요.
              </p>
            </div>
          </div>
        </section>

        {/* 개인화 */}
        <section
          className={
            isDark
              ? "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_40px_-28px_rgba(15,23,42,0.9)] backdrop-blur"
              : "rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          }
        >
          {isDark && (
            <>
              <div className="pointer-events-none absolute -top-20 right-[-60px] h-52 w-52 rounded-full bg-emerald-400/16 blur-[120px]" />
              <div className="pointer-events-none absolute -bottom-16 left-[-48px] h-44 w-44 rounded-full bg-purple-400/12 blur-3xl" />
            </>
          )}
          <div className="relative">
            <div className="flex items-center gap-2">
              <SwatchIcon className={`h-6 w-6 ${isDark ? "text-emerald-300" : "text-emerald-500"}`} />
              <h2 className="text-base font-semibold">개인화</h2>
            </div>
            <p className={`mt-1 text-sm ${isDark ? "text-slate-300/80" : "text-gray-600"}`}>
              테마와 언어, 접근성 옵션을 취향에 맞춰 조정하세요.
            </p>
            <div className={`mt-3 h-px ${isDark ? "bg-white/5" : "bg-gray-200"}`} />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>테마 전환</p>
                <p className={`text-xs ${isDark ? "text-slate-300/75" : "text-gray-500"}`}>
                  인터페이스를 라이트·다크 모드 중에서 선택하세요.
                </p>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                aria-pressed={isDark}
                className={`relative grid h-11 w-56 grid-cols-2 items-stretch overflow-hidden rounded-full text-xs font-semibold uppercase tracking-wide transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/80 ${
                  isDark
                    ? "border border-white/15 bg-white/[0.05] text-slate-300 hover:bg-white/[0.08]"
                    : "border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                <span className="sr-only">테마 토글</span>
                <span
                  className={`relative flex items-center justify-center gap-2 px-0 py-0 transition-colors ${
                    isDark ? "text-white" : "text-slate-400/80"
                  }`}
                >
                  <span
                    className={`absolute inset-0 rounded-full transition-all duration-300 ease-out ${
                      isDark
                        ? "bg-gradient-to-r from-emerald-500/85 via-teal-400/80 to-emerald-400/75 shadow-[0_16px_30px_-20px_rgba(16,185,129,0.75)] opacity-100 scale-100"
                        : "opacity-0 scale-95"
                    }`}
                  />
                  <span className="relative z-10 flex items-center gap-2 px-4 py-2">
                    <MoonIcon className="h-4 w-4" />
                    <span className="min-w-[3.5rem] text-center">Dark</span>
                  </span>
                </span>
                <span
                  className={`relative flex items-center justify-center gap-2 px-0 py-0 transition-colors ${
                    isDark ? "text-slate-400/80" : "text-emerald-900"
                  }`}
                >
                  <span
                    className={`absolute inset-0 rounded-full transition-all duration-300 ease-out ${
                      isDark
                        ? "opacity-0 scale-95"
                        : "bg-gradient-to-r from-emerald-300/90 via-emerald-400/80 to-emerald-500/80 shadow-[0_16px_30px_-20px_rgba(45,212,191,0.55)] opacity-100 scale-100"
                    }`}
                  />
                  <span className="relative z-10 flex items-center gap-2 px-4 py-2">
                    <SunIcon className="h-4 w-4" />
                    <span className="min-w-[3.5rem] text-center">Light</span>
                  </span>
                </span>
              </button>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>언어 설정</p>
                <p className={`text-xs ${isDark ? "text-slate-300/75" : "text-gray-500"}`}>
                  사용 언어를 선택하면 전체 서비스 언어가 변경돼요.
                </p>
              </div>
              <div
                className={`relative inline-grid h-11 w-56 grid-cols-2 items-stretch overflow-hidden rounded-full text-xs font-semibold uppercase tracking-wide transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/80 ${
                  isDark ? "border border-white/15 bg-white/[0.05] text-slate-300" : "border border-gray-200 bg-white text-gray-600 shadow-sm"
                }`}
                role="group"
                aria-label="언어 선택"
              >
                {supportedLanguages.map(({ code, label }, idx) => {
                  const active = currentLang === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => handleLanguageChange(code)}
                      className={`relative flex items-center justify-center px-4 py-2 transition ${
                        active
                          ? isDark
                            ? "bg-gradient-to-r from-emerald-500/80 to-teal-400/80 text-white shadow-[0_12px_22px_-18px_rgba(16,185,129,0.65)]"
                            : "bg-emerald-200 text-emerald-900"
                          : isDark
                          ? "hover:bg-white/10"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section
          className={
            isDark
              ? "relative overflow-hidden rounded-2xl border border-rose-500/40 bg-rose-500/[0.08] p-6 shadow-[0_24px_40px_-24px_rgba(244,63,94,0.7)] backdrop-blur"
              : "rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm"
          }
        >
          {isDark && (
            <>
              <div className="pointer-events-none absolute -top-32 right-[-56px] h-60 w-60 rounded-full bg-rose-400/30 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-40 left-[-32px] h-72 w-72 rounded-full bg-rose-500/20 blur-[140px]" />
            </>
          )}
          <div className="relative">
            <div className="mb-4 flex items-center gap-2">
              <TrashIcon className={`h-6 w-6 ${isDark ? 'text-rose-200' : 'text-rose-500'}`} />
              <h2 className={`text-base font-semibold ${isDark ? 'text-rose-50' : 'text-rose-600'}`}>계정 완전 삭제</h2>
            </div>
            <p className={`mb-4 text-xs ${isDark ? 'text-rose-100/80' : 'text-rose-600'}`}>
              계정을 삭제하면 모든 이용 기록과 분석 데이터가 영구적으로 제거돼요. 삭제 후에는 되돌릴 수 없으니 반드시 다시 한 번 확인해주세요.
            </p>
            <button
              type="button"
              className={`w-full rounded-xl py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200/80 ${
                isDark
                  ? 'bg-gradient-to-r from-rose-500 via-rose-600 to-rose-500 text-white shadow-[0_18px_34px_-20px_rgba(244,63,94,0.9)] hover:from-rose-500 hover:via-rose-500 hover:to-rose-600'
                  : 'bg-rose-500 text-white shadow-sm hover:bg-rose-600'
              }`}
            >
              계정 삭제하기
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
