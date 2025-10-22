import React from 'react';
import { CreditCardIcon } from '@heroicons/react/24/outline';

export default function PlanCard() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-slate-100 shadow-[0_28px_44px_-30px_rgba(15,23,42,0.9)] backdrop-blur">
      <div className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-indigo-400/18 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-purple-500/14 blur-[160px]" />

      <div className="relative flex items-center gap-2">
        <CreditCardIcon className="h-6 w-6 text-indigo-300" />
        <h2 className="text-base font-semibold text-white">플랜 및 결제</h2>
      </div>
      <p className="relative mt-1 text-sm text-slate-300/80">구독 상태와 결제 정보를 확인하고 관리하세요.</p>
      <div className="relative mt-4 h-px bg-white/5" />

      {/* 임시 비노출 영역 */}
      {/*
        <div className="relative mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/40 bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold text-emerald-100 uppercase tracking-wide">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              이용 중
            </span>
            <span className="hidden text-xs text-slate-300/70 md:inline">자동 갱신 활성화</span>
          </div>
          <button
            type="button"
            className="rounded-lg border border-white/10 bg-white/[0.08] px-3 py-1.5 text-sm font-semibold text-white shadow-[0_16px_30px_-24px_rgba(79,70,229,0.85)] transition hover:bg-white/[0.12] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200/70"
          >
            관리하기
          </button>
        </div>

        <div className="relative mt-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[12px] font-medium tracking-wide text-slate-300/70">현재 플랜</div>
            <div className="mt-1 flex items-baseline gap-2">
              <p className="text-xl font-semibold text-white">Pro</p>
              <span className="text-sm text-slate-300/70">· 월간</span>
            </div>
          </div>
          <span className="inline-flex items-center rounded-full border border-indigo-300/40 bg-indigo-400/15 px-2.5 py-1 text-xs font-semibold text-indigo-100">
            D-45
          </span>
        </div>

        <div className="relative mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.05] p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium tracking-wide text-slate-300/70">다음 갱신일</span>
            </div>
            <p className="mt-1 tabular-nums text-sm font-semibold text-white">2025-10-31</p>
            <p className="mt-0.5 text-xs text-slate-400/75">한국 표준시 (KST)</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.05] p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium tracking-wide text-slate-300/70">결제 수단</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-white">Visa •••• 4242</p>
            <p className="mt-0.5 text-xs text-slate-400/75">자동 결제 예약됨</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.05] p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium tracking-wide text-slate-300/70">사용량</span>
            </div>
            <div className="mt-2">
              <div className="h-2 w-full rounded-full bg-white/10">
                <div className="h-2 w-1/2 rounded-full bg-indigo-400 shadow-[0_10px_16px_-12px_rgba(129,140,248,0.8)]" />
              </div>
              <p className="mt-2 tabular-nums text-xs text-slate-300/80">50 / 100 크레딧</p>
            </div>
          </div>
        </div>
      */}
    </section>
  );
}
