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
                    className="inline-flex items-center justify-center gap-1 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                    {t('navigation.actions.login')} <span aria-hidden="true">&rarr;</span>
                </Link>
            )}
        </div>
    );
}
