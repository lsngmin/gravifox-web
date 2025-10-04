import React from "react";
import {
    UserCircleIcon,
    KeyIcon,
    ShieldCheckIcon,
    DevicePhoneMobileIcon,
    ArrowDownTrayIcon,
    TrashIcon,
    BellIcon,
    SwatchIcon,
    GlobeAltIcon,
} from "@heroicons/react/24/outline";
import SidebarItem from "./SidebarItem";

export default function ProfileSidebar() {
    return (
        <aside className="w-64 min-h-screen bg-white/60 backdrop-blur-sm border-r border-gray-200 p-6">
            {/* 상단 브랜드 */}
            <div className="mb-8">
                <h1 className="text-xl font-extrabold tracking-tight text-indigo-600">
                    Account
                </h1>
                <p className="text-xs text-gray-500">Manage your personal settings</p>
            </div>

            {/* 내비게이션 */}
            <nav className="space-y-2">
                <SidebarItem to="/profile/info" icon={UserCircleIcon} label="Profile Info" />
                <SidebarItem to="/profile/password" icon={KeyIcon} label="Change Password" />
                <SidebarItem to="/profile/security" icon={ShieldCheckIcon} label="Security & 2FA" />
                <SidebarItem to="/profile/devices" icon={DevicePhoneMobileIcon} label="Login Devices" />

                <div className="mt-6 pt-4 border-t border-gray-200">
                    <SidebarItem to="/profile/notifications" icon={BellIcon} label="Notifications" />
                    <SidebarItem to="/profile/preferences" icon={SwatchIcon} label="Theme & Preferences" />
                    <SidebarItem to="/profile/language" icon={GlobeAltIcon} label="Language" />
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                    <SidebarItem to="/profile/export" icon={ArrowDownTrayIcon} label="Export Data" />
                    <SidebarItem to="/profile/delete" icon={TrashIcon} label="Delete Account" />
                </div>
            </nav>
        </aside>
    );
}
