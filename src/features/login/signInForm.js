import React, { useState } from "react";

import LoginErrorMessage from "features/login/loginErrorMessage";
import SignInAPI from "features/login/api/signInAPI";
import GoogleLoginButton from "features/login/components/googleLoginButton";
import { Link, useNavigate } from "react-router-dom";

export default function SignInForm() {
    const navigate = useNavigate();

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
                navigate("/verify", { state: { email: formState.userId } });
                return;
            }
            setErrorStatus(error.status);
            setErrorMessage(error.message);
        }
    };
    const handleChangeForm = () => {
        navigate("/agree");
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
        <div className="mx-auto w-full rounded-3xl border border-white/12 bg-slate-950/80 px-6 py-8 shadow-[0_24px_64px_-32px_rgba(15,23,42,0.8)] backdrop-blur-xl sm:px-10 sm:py-10">
            <div className="text-center text-white">
                <h2 className="text-2xl font-semibold sm:text-3xl">로그인</h2>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-indigo-200/70">Gravifox secure</p>
            </div>
            <form onSubmit={handleSubmit} className="mt-10 space-y-6">
                <div className="space-y-2">
                    <label htmlFor="userId" className="block text-sm font-medium text-slate-100">
                        Email address
                    </label>
                    <input
                            id="userId"
                            name="userId"
                            type="text"
                            autoComplete="email"
                            value={formState.userId}
                            onChange={handleInputChange("userId")}
                            className="block w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-300/80"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm font-medium text-slate-100">
                                Password
                            </label>
                            <Link to="/support" className="text-xs font-semibold text-indigo-200 transition hover:text-indigo-100">
                                Forgot password?
                            </Link>
                        </div>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            value={formState.password}
                            onChange={handleInputChange("password")}
                            className="block w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-300/80"
                        />
                    </div>

                    <button
                        type="submit"
                        className="flex w-full justify-center rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:from-indigo-400 hover:via-indigo-500 hover:to-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-200"
                    >
                        Sign in
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
                    <span className="h-px flex-1 bg-white/10" />
                    <span className="px-3 text-xs font-medium uppercase tracking-[0.3em] text-slate-200/80">or</span>
                    <span className="h-px flex-1 bg-white/10" />
                </div>

                <div className="mt-6">
                    <GoogleLoginButton />
                </div>

                <p className="mt-10 text-center text-sm text-slate-200/80">
                    아직 멤버가 아니신가요?{' '}
                    <button className="font-semibold text-indigo-200 transition hover:text-indigo-100" onClick={handleChangeForm}>
                        지금 가입하기
                    </button>
                </p>
        </div>
    );
}
