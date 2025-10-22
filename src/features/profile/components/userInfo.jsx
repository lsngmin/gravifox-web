import React from "react";
import ProfileCard from "./ProfileCard";
import PlanCard from "./PlanCard";
import SecurityCard from "./SecurityCard";
import { BellIcon, SwatchIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function UserInfo() {
  return (
    <div className="relative mx-auto mt-10 max-w-4xl px-6">
      <div className="pointer-events-none absolute -top-32 right-[-120px] h-64 w-64 rounded-full bg-sky-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-[-140px] h-72 w-72 rounded-full bg-emerald-400/12 blur-[140px]" />
      <div className="pointer-events-none absolute inset-0 mx-auto max-w-3xl rounded-[32px] bg-[radial-gradient(circle_at_20%_18%,rgba(99,102,241,0.18),transparent_60%),radial-gradient(circle_at_80%_12%,rgba(56,189,248,0.16),transparent_55%)] opacity-80 blur-3xl" />

      <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/88 px-6 py-10 shadow-[0_40px_80px_-40px_rgba(15,23,42,0.95)] backdrop-blur">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(129,140,248,0.12),transparent_58%),radial-gradient(circle_at_82%_14%,rgba(16,185,129,0.12),transparent_60%)] opacity-90" />

        <div className="relative space-y-8 text-slate-100">
          {/* Settings 헤더 */}
          <div className="mb-2">
            <h1 className="text-2xl font-semibold tracking-tight text-white">설정</h1>
            <p className="mt-2 text-sm text-slate-300/90">프로필과 이용 환경을 한 곳에서 관리해 보세요.</p>
          </div>

          {/* 프로필 카드 */}
          <ProfileCard />

          {/* 플랜 카드 */}
          <PlanCard />

          {/* 보안 카드 */}
          <SecurityCard />

          {/* 알림 */}
          <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_40px_-28px_rgba(15,23,42,0.9)] backdrop-blur">
            <div className="pointer-events-none absolute -top-24 -right-10 h-44 w-44 rounded-full bg-indigo-400/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-14 h-48 w-48 rounded-full bg-sky-400/16 blur-[120px]" />
            <div className="relative">
              <div className="flex items-center gap-2">
                <BellIcon className="h-6 w-6 text-indigo-300" />
                <h2 className="text-base font-semibold text-white">알림 설정</h2>
              </div>
              <p className="mt-1 text-sm text-slate-300/80">이메일과 푸시 알림 수신 방식을 자유롭게 구성하세요.</p>
              <div className="mt-3 h-px bg-white/5" />
            </div>
          </section>

          {/* 개인화 */}
          <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_40px_-28px_rgba(15,23,42,0.9)] backdrop-blur">
            <div className="pointer-events-none absolute -top-20 right-[-60px] h-52 w-52 rounded-full bg-emerald-400/16 blur-[120px]" />
            <div className="pointer-events-none absolute -bottom-16 left-[-48px] h-44 w-44 rounded-full bg-purple-400/12 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2">
                <SwatchIcon className="h-6 w-6 text-emerald-300" />
                <h2 className="text-base font-semibold text-white">개인화</h2>
              </div>
              <p className="mt-1 text-sm text-slate-300/80">테마와 언어, 접근성 옵션을 취향에 맞춰 조정하세요.</p>
              <div className="mt-3 h-px bg-white/5" />
            </div>
          </section>

          {/* Danger Zone */}
          <section className="relative overflow-hidden rounded-2xl border border-rose-500/40 bg-rose-500/[0.08] p-6 shadow-[0_24px_40px_-24px_rgba(244,63,94,0.7)] backdrop-blur">
            <div className="pointer-events-none absolute -top-32 right-[-56px] h-60 w-60 rounded-full bg-rose-400/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-40 left-[-32px] h-72 w-72 rounded-full bg-rose-500/20 blur-[140px]" />
            <div className="relative">
              <div className="mb-4 flex items-center gap-2">
                <TrashIcon className="h-6 w-6 text-rose-200" />
                <h2 className="text-base font-semibold text-rose-50">계정 완전 삭제</h2>
              </div>
              <p className="mb-4 text-xs text-rose-100/80">
                계정을 삭제하면 모든 이용 기록과 분석 데이터가 영구적으로 제거돼요. 삭제 후에는 되돌릴 수 없으니 반드시 다시 한 번 확인해주세요.
              </p>
              <button
                type="button"
                className="w-full rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-rose-500 py-2 text-sm font-semibold text-white shadow-[0_18px_34px_-20px_rgba(244,63,94,0.9)] transition hover:from-rose-500 hover:via-rose-500 hover:to-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200/80"
              >
                계정 삭제하기
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
