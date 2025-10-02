import React, {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";

import {useAuth} from "providers/authProvider";
import avatar from "assets/1.jpg";
import AvatarButton from "./avatarButton";

export default function NavigationAuthButton() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { accessToken, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // 페이지 로드될 때 토큰 확인
        if (accessToken) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    }, [accessToken]);

    return (
        <nav className="flex justify-end gap-4 p-4">
            {isLoggedIn ? (
                    <AvatarButton />
            ) : (
                <Link
                    to="/login"
                    className="block px-3 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition"
                >
                    Log in <span aria-hidden="true">&rarr;</span>
                </Link>
            )}
        </nav>
    );
}
