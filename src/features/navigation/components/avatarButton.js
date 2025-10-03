import React, { useEffect, useMemo, useState } from "react";
import {Menu, MenuButton, MenuItem, MenuItems} from "@headlessui/react";
import { UserIcon } from "@heroicons/react/24/outline";
import { useAuth } from "providers/authProvider";
import { useLocation, useNavigate } from "react-router-dom";
import {
    CreditCardIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon
} from "@heroicons/react/24/outline";
import LanguageMenu from "./LanguageMenu";
import { useTranslation } from 'react-i18next';

const BUTTON_DIMENSIONS = {
    sm: {
        button: "w-10 h-10",
        icon: "w-7 h-7",
    },
    md: {
        button: "w-12 h-12",
        icon: "w-8 h-8",
    },
};

export default function AvatarButton({ size = "md" }) {
    const { logout, userInfo } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { i18n } = useTranslation();

    // 언어 상태 관리 (i18n과 동기화)
    const [language, setLanguage] = useState(() => (i18n.language || 'en').slice(0,2));
    useEffect(() => {
        const lng = (i18n.language || 'en').slice(0,2);
        setLanguage(lng);
    }, [i18n.language]);

    const changeLanguage = (next) => {
        const supported = ['en','ko'];
        const lng = supported.includes(next) ? next : 'en';
        try { i18n.changeLanguage(lng); } catch {}
        try { localStorage.setItem('i18nextLng', lng); } catch {}

        const stripLang = (path) => {
            if (path === '/en' || path === '/ko') return '/';
            if (path.startsWith('/en/')) return path.substring(3);
            if (path.startsWith('/ko/')) return path.substring(3);
            return path;
        };
        const pathNoLng = stripLang(location.pathname || '/');
        const nextPath = `/${lng}${pathNoLng === '/' ? '' : pathNoLng}${location.search || ''}${location.hash || ''}`;
        navigate(nextPath, { replace: true });
    };

    const initials = useMemo(() => {
        const src = userInfo?.nickname || userInfo?.userId || "U";
        const s = (src || "U").trim();
        if (!s) return "U";
        const letters = s.replace(/[^A-Za-z0-9가-힣]/g, "");
        return letters.slice(0, 1).toUpperCase();
    }, [userInfo]);

    const displayName = userInfo?.nickname || userInfo?.userId || "User";
    const displayEmail = userInfo?.userId || "";

    const { button: buttonSizeClass, icon: iconSizeClass } = BUTTON_DIMENSIONS[size] || BUTTON_DIMENSIONS.md;

    return (
        <Menu as="div" className="relative">
            <div>
                <MenuButton>
                    <button
                        type="button"
                        className={`relative inline-flex items-center justify-center ${buttonSizeClass} -my-1
             rounded-full border-2 border-gray-300 bg-indigo-500
             text-white hover:bg-indigo-600 hover:border-indigo-600
             transition-colors duration-200`}
                    >
                        <UserIcon className={iconSizeClass} aria-hidden="true" />
                    </button>
                </MenuButton>
            </div>

            <MenuItems
                transition
                className="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-xl
             bg-white shadow-lg ring-1 ring-black/5 divide-y divide-gray-100
             transition transform data-[closed]:scale-95 data-[closed]:opacity-0
             data-[enter]:duration-150 data-[leave]:duration-100
             data-[enter]:ease-out data-[leave]:ease-in"
            >
                {/* 로그인 사용자 정보 */}
                <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        {/* 아바타 */}
                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
                            {initials}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                            {displayEmail && (
                              <p className="text-xs text-gray-500">{displayEmail}</p>
                            )}
{/*                            <span className="inline-flex items-center px-2 py-0.5 rounded-full*/}
{/*    text-[10px] font-semibold text-white*/}
{/*    bg-gradient-to-r from-yellow-400 to-orange-500 shadow-sm">*/}
{/*    Pro*/}

{/*</span>                            /!*<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 shadow-sm"> Pro Plan </span>*!/*/}

                        </div>
                    </div>
                </div>
                {/* 상단 CTA */}
                <div className="px-4 py-3 border-b border-gray-100">
                    <button
                        onClick={() => navigate("/analyze")}
                        className="w-full rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-600"
                    >
                        + New Analysis
                    </button>
                    <button className="mt-3 w-full rounded-md bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-2 text-sm font-semibold text-white shadow hover:opacity-90">
                        Upgrade to Pro 🚀
                    </button>
                </div>

                {/* 사용량 */}
                <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs text-gray-500">Analysis credits this month</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                            className="bg-indigo-500 h-2 rounded-full"
                            style={{ width: "45%" }}
                        ></div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                        <p className="text-[10px] text-gray-500">45 / 100 credits</p>
                        <a
                            href="/pricing"
                            className="text-[10px] font-medium text-indigo-600 hover:underline"
                        >
                            Upgrade
                        </a>
                    </div>
                </div>

                {/* 주요 메뉴 */}
                <div className="py-1">
                    {/* Settings */}
                    <MenuItem>
                        {({ active }) => (
                            <button
                                type="button"
                                onClick={() => navigate('/settings')}
                                className={`${
                                    active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                                } flex w-full items-center gap-3 px-4 py-2 text-sm font-medium text-left`}
                            >
                                <Cog6ToothIcon className="w-5 h-5 text-indigo-500" />
                                Settings
                            </button>
                        )}
                    </MenuItem>

                    {/* Dashboard */}
                    <MenuItem>
                        {({ active }) => (
                            <button
                                type="button"
                                onClick={() => navigate("/dashboard")}
                                className={`${
                                    active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                                } flex w-full items-center gap-3 px-4 py-2 text-sm font-medium text-left`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg"
                                     fill="none" viewBox="0 0 24 24"
                                     strokeWidth={1.8} stroke="currentColor"
                                     className="w-5 h-5 text-indigo-500">
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                          d="M3 7.5l9 6 9-6M3 12.75l9 6 9-6" />
                                </svg>
                                Dashboard
                            </button>
                        )}
                    </MenuItem>

                    {/* Billing */}
                    <MenuItem>
                        {({ active }) => (
                            <a
                                href="/billing"
                                className={`${
                                    active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                                } flex items-center gap-3 px-4 py-2 text-sm font-medium cursor-pointer`}
                            >
                                <CreditCardIcon className="w-5 h-5 text-indigo-500" />
                                Billing
                            </a>
                        )}
                    </MenuItem>



                    <LanguageMenu language={language} changeLanguage={changeLanguage} />
                </div>

                {/* 로그아웃 */}
                <div className="py-1">
                    <MenuItem>
                        {({ active }) => (
                            <button
                                type="button"
                                onClick={logout}
                                className={`${
                                    active ? "bg-red-100 text-red-700" : "text-red-600"
                                } flex w-full items-center gap-3 px-4 py-2 text-sm font-semibold text-left`}
                            >
                                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                Sign out
                            </button>
                        )}
                    </MenuItem>
                </div>

                {/* 시스템 상태 */}
                <div className="px-4 py-3 flex items-center gap-2 bg-green-50 border-b border-green-100">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <p className="text-xs text-green-700">All systems operational</p>
                </div>

                {/* 브랜드 푸터 */}
                <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-base font-bold text-indigo-600">GRAVIFOX</p>
                    <p className="text-xs text-gray-500">AI-powered media detection</p>
                </div>
            </MenuItems>
        </Menu>
    );
}
