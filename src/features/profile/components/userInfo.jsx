import React from "react";
import ProfileCard from "./ProfileCard";
import PlanCard from "./PlanCard";
import SecurityCard from "./SecurityCard";
import { BellIcon, SwatchIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function UserInfo() {
  return (
    <div className="mt-10 max-w-4xl mx-auto px-6 py-8 space-y-8">
      {/* Settings 헤더 */}
      <div className="mb-2">
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-600">Manage your profile and preferences.</p>
      </div>

      {/* 프로필 카드 */}
      <ProfileCard />

      {/* 플랜 카드 */}
      <PlanCard />

      {/* 보안 카드 */}
      <SecurityCard />

      {/* 알림 */}
      <section className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm rounded-2xl p-6">
        <div className="flex items-center gap-2">
          <BellIcon className="w-6 h-6 text-indigo-500" />
          <h2 className="text-base font-semibold text-gray-900">Notifications</h2>
        </div>
        <p className="mt-1 text-sm text-gray-500">Manage your email and push notifications.</p>
        <div className="mt-3 h-px bg-gray-200" />
      </section>

      {/* 개인화 */}
      <section className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm rounded-2xl p-6">
        <div className="flex items-center gap-2">
          <SwatchIcon className="w-6 h-6 text-indigo-500" />
          <h2 className="text-base font-semibold text-gray-900">Preferences</h2>
        </div>
        <p className="mt-1 text-sm text-gray-500">Choose your theme and language preferences.</p>
        <div className="mt-3 h-px bg-gray-200" />
      </section>

      {/* Danger Zone */}
      <section className="bg-red-50 border border-red-200 shadow-sm rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrashIcon className="w-6 h-6 text-red-500" />
          <h2 className="text-base font-semibold text-red-700">Delete Account</h2>
        </div>
        <p className="text-xs text-red-600 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          type="button"
          className="w-full rounded-lg bg-red-500 text-white text-sm font-semibold py-2 hover:bg-red-600 transition"
        >
          Delete My Account
        </button>
      </section>
    </div>
  );
}

