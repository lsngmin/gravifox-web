import React from 'react';
import { CreditCardIcon } from '@heroicons/react/24/outline';

export default function PlanCard({ theme = 'dark' }) {
  const isDark = theme === 'dark';

  const containerClass = isDark
    ? 'relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-slate-100 shadow-[0_28px_44px_-30px_rgba(15,23,42,0.9)] backdrop-blur'
    : 'rounded-2xl border border-gray-200 bg-white p-6 text-gray-900 shadow-sm';

  return (
    <section className={containerClass}>
      {isDark && (
        <>
          <div className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-indigo-400/18 blur-[140px]" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-purple-500/14 blur-[160px]" />
        </>
      )}

      <div className="relative flex items-center gap-2">
        <CreditCardIcon className={`h-6 w-6 ${isDark ? 'text-indigo-300' : 'text-indigo-500'}`} />
        <h2 className="text-base font-semibold">플랜 및 결제</h2>
      </div>
      <p className={`relative mt-1 text-sm ${isDark ? 'text-slate-300/80' : 'text-gray-500'}`}>
        구독 상태와 결제 정보를 확인하고 관리하세요.
      </p>
      <div className={`relative mt-4 h-px ${isDark ? 'bg-white/5' : 'bg-gray-200'}`} />

      {/* TODO: 구체적인 플랜 정보가 준비되면 아래 섹션을 다시 노출 */}
    </section>
  );
}
