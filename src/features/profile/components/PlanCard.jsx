import React from 'react';
import { CreditCardIcon } from '@heroicons/react/24/outline';

export default function PlanCard() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm p-6 ring-1 ring-black/5">
      {/* subtle glow */}
      <div className="pointer-events-none absolute -top-16 -right-10 h-48 w-48 rounded-full bg-indigo-300/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-8 h-56 w-56 rounded-full bg-indigo-200/20 blur-3xl" />

      <div className="flex items-center gap-2">
        <CreditCardIcon className="w-6 h-6 text-indigo-500" />
        <h2 className="text-base font-semibold text-gray-900">Plan</h2>
      </div>
      <p className="mt-1 text-sm text-gray-500">Manage your subscription, renewal, and billing preferences.</p>
      <div className="mt-3 h-px bg-gray-200" />

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/10">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
          <span className="hidden text-xs text-gray-500 md:inline">Auto-renew ON</span>
        </div>
        <button
          type="button"
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Manage
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[13px] uppercase tracking-wide text-gray-500">Current</div>
          <div className="mt-1 flex items-baseline gap-2">
            <p className="text-xl font-semibold text-gray-900">Pro</p>
            <span className="text-sm text-gray-500">· Monthly</span>
          </div>
        </div>
        <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-600/10">
          D-45
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-gray-500">Renews</span>
          </div>
          <p className="mt-1 tabular-nums text-sm font-medium text-gray-900">2025-10-31</p>
          <p className="mt-0.5 text-xs text-gray-500">KST</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-gray-500">Payment</span>
          </div>
          <p className="mt-1 text-sm font-medium text-gray-900">Visa •••• 4242</p>
          <p className="mt-0.5 text-xs text-gray-500">Auto-renew ON</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-gray-500">Quota</span>
          </div>
          <div className="mt-2">
            <div className="h-2 w-full rounded-full bg-gray-100">
              <div className="h-2 w-1/2 rounded-full bg-indigo-500" />
            </div>
            <p className="mt-2 tabular-nums text-xs text-gray-600">50 / 100 credits</p>
          </div>
        </div>
      </div>
    </section>
  );
}

