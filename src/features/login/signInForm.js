import React, { useState } from "react";

import LoginErrorMessage from "features/login/loginErrorMessage";
import SignInAPI from "features/login/api/signInAPI";
import GoogleLoginButton from "features/login/components/googleLoginButton";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import {
    rememberReturnCheckpoint,
} from "../../lib/returnCheckpoint/index.js";
import { CHECKPOINT_TYPES } from "../../lib/returnCheckpoint/constants.js";

export default function SignInForm() {
    const navigate = useNavigate();
    const { lng } = useParams();
    const location = useLocation();
    const localeMatch = location.pathname?.match(/^\/([a-zA-Z-]{2,5})(?=\/|$)/);
    const prefix = localeMatch ? `/${localeMatch[1]}` : "";
    const defaultPath = `${prefix}/analyze/upload`;
    const fromLocation = location.state?.from;
    const fromPath = fromLocation?.pathname || defaultPath;
    const fromSearch = fromLocation?.search || "";
    const returnPath = `${fromPath}${fromSearch}`;
    const localizedPath = (path) => {
        const prefix = lng ? `/${lng}` : "";
        if (path === "/" && prefix) {
            return prefix;
        }
        return `${prefix}${path}`;
    };

    // LoginErrorMessage에 전달하기 위한 에러 코드와 메세지
    const [errorStatus, setErrorStatus] = useState(null),
        [errorMessage, setErrorMessage] = useState(null),
        { signIn } = SignInAPI(),
        [formState, setFormState] = useState({
            userId: "",
            password: "",
        });
    /**
     * 로그인 폼 제출시 처리되는 함수입니다. 로그인 요청을 signIn으로 전달하며 입력값은 formstate 입니다.
     * @async
     * @param e - onSubmit에서 발생하는 event
     * @returns {Promise<void>} - 로그인 요청을 비동기로 처리합니다.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await signIn(formState);
        } catch (error) {
            if (error?.code === "EMAIL_NOT_VERIFIED") {
                navigate(localizedPath("/verify"), { state: { email: formState.userId } });
                return;
            }
            setErrorStatus(error.status);
            setErrorMessage(error.message);
        }
    };
    const handleChangeForm = () => {
        rememberReturnCheckpoint(CHECKPOINT_TYPES.AUTH, returnPath);
        navigate(localizedPath("/agree"));
    };

    /**
     * 입력 필드의 변경을 처리하는 함수입니다.
     *
     * 커링(Currying)된 형태로, 특정 입력 필드의 이름(`field`)을 받아 해당 필드의 값을 업데이트
     * 사용자 입력이 변경될 때마다 `formState`를 갱신, 이전 에러 메세지 초기화
     *
     * @param {String} field - 업데이트할 폼 필드의 이름 (ex -> 'email', 'password')
     * @returns {(event: React.ChangeEvent<HTMLInputElement>) => void} - 이벤트 핸들러 함수
     */
    const handleInputChange = (field) => (event) => {
        setFormState((prev) => ({
            ...prev,
            [field]: event.target.value,
        }));
        // 이전에 발생한 에러 메시지를 초기화하여, 폼을 다시 제출할 때 중복된 에러 메시지가 표시되지 않도록 합니다.
    };

    return (
        <div className="mx-auto w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900/70 px-6 py-10 text-slate-100 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.8)] sm:px-8">
            <div className="space-y-2 text-center">
                <h2 className="text-2xl font-semibold tracking-tight">계정으로 로그인</h2>
                <p className="text-sm text-slate-400">로그인하면 바로 이용할 수 있어요.</p>
            </div>
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="space-y-2">
                    <label htmlFor="userId" className="block text-sm font-medium text-slate-300">
                        이메일
                    </label>
                    <input
                        id="userId"
                        name="userId"
                        type="text"
                        autoComplete="email"
                        value={formState.userId}
                        onChange={handleInputChange("userId")}
                        placeholder="you@example.com"
                        className="block w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm font-medium text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-400/20"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                            비밀번호
                        </label>
                        <Link
                            to={localizedPath("/support")}
                            className="text-xs font-semibold text-indigo-300 transition hover:text-indigo-200"
                            onClick={() => rememberReturnCheckpoint(CHECKPOINT_TYPES.AUTH, returnPath)}
                        >
                            비밀번호 찾기
                        </Link>
                    </div>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        value={formState.password}
                        onChange={handleInputChange("password")}
                        placeholder="••••••••"
                        className="block w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm font-medium text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-400/20"
                    />
                </div>

                <button
                    type="submit"
                    className="flex w-full justify-center rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-400 to-sky-400 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_-22px_rgba(59,130,246,0.55)] transition active:scale-[0.99]"
                >
                    로그인
                </button>

                <div>
                    <LoginErrorMessage
                        status={errorStatus}
                        message={errorMessage}
                        onClose={() => {
                            setErrorStatus(null);
                            setErrorMessage(null);
                        }}
                    />
                </div>
            </form>

            <div className="relative mt-8 flex items-center">
                <span className="h-px flex-1 bg-slate-800" />
                <span className="px-3 text-xs font-semibold tracking-[0.25em] text-slate-500">OR</span>
                <span className="h-px flex-1 bg-slate-800" />
            </div>

            <div className="mt-6">
                <GoogleLoginButton variant="dark" returnPath={returnPath} />
            </div>

            <p className="mt-8 text-center text-sm text-slate-400">
                아직 멤버가 아니신가요?{' '}
                <button className="font-semibold text-indigo-300 transition hover:text-indigo-200" onClick={handleChangeForm}>
                    가입하기
                </button>
            </p>
        </div>
    );
}
