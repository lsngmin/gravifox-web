import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import { useTranslation } from "react-i18next";

import {useAuth} from "providers/authProvider";
import AvatarButton from "./avatarButton";

export default function NavigationAuthButton() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { accessToken } = useAuth();
    const { t } = useTranslation('common');

    useEffect(() => {
        // 페이지 로드될 때 토큰 확인
        if (accessToken) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    }, [accessToken]);

    return (
        <div className="flex items-center justify-end gap-3">
            {isLoggedIn ? (
                <AvatarButton />
            ) : (
                <Link
                    to="/login"
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50"
                >
                    {t('navigation.actions.login')} <span aria-hidden="true">&rarr;</span>
                </Link>
            )}
        </div>
    );
}
