import React, { useMemo, useState } from "react";

import LoginErrorMessage from "features/login/loginErrorMessage";
import SignInAPI from "features/login/api/signInAPI";
import GoogleLoginButton from "features/login/components/googleLoginButton";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function SignInForm() {
    const navigate = useNavigate();
    const { lng } = useParams();
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
    };

    const fieldsetClass =
        'space-y-2 rounded-2xl border border-slate-800/80 bg-slate-900/40 px-4 py-4 shadow-[0_16px_36px_-24px_rgba(15,23,42,0.65)] transition hover:border-slate-600/60 focus-within:border-indigo-300/60 focus-within:shadow-[0_20px_40px_-26px_rgba(99,102,241,0.45)]';
    const labelClass = 'block text-sm font-semibold text-slate-200';
    const inputClass =
        'mt-1 block w-full rounded-xl border border-slate-700/80 bg-slate-900/60 px-4 py-3 text-sm font-medium text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-300/70 focus:ring-2 focus:ring-indigo-400/30 focus:ring-offset-2 focus:ring-offset-slate-950';

    const errorMessageId = useMemo(() => (errorStatus || errorMessage ? 'login-error-message' : undefined), [errorStatus, errorMessage]);

    return (
        <div className="mx-auto w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900/70 px-6 py-10 text-slate-100 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.8)] sm:px-8">
            <div className="space-y-2 text-center">
                <h2 className="text-2xl font-semibold tracking-tight">계정으로 로그인</h2>
                <p className="text-sm text-slate-400">로그인하면 바로 이용할 수 있어요.</p>
            </div>
            <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
                <fieldset className={fieldsetClass}>
                    <legend className="sr-only">로그인 정보</legend>
                    <label htmlFor="userId" className={labelClass}>
                        이메일
                    </label>
                    <input
                        id="userId"
                        name="userId"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        value={formState.userId}
                        onChange={handleInputChange('userId')}
                        placeholder="you@example.com"
                        className={inputClass}
                        aria-describedby={errorMessageId}
                        aria-invalid={Boolean(errorStatus)}
                        required
                        autoFocus
                    />
                </fieldset>

                <fieldset className={fieldsetClass}>
                    <legend className="sr-only">비밀번호 정보</legend>
                    <div className="flex items-center justify-between">
                        <label htmlFor="password" className={labelClass}>
                            비밀번호
                        </label>
                        <Link
                            to={localizedPath('/support')}
                            className="text-xs font-semibold text-indigo-300 transition hover:text-indigo-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-full px-2 py-1"
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
                        onChange={handleInputChange('password')}
                        placeholder="••••••••"
                        className={inputClass}
                        aria-describedby={errorMessageId}
                        aria-invalid={Boolean(errorStatus)}
                        required
                        minLength={8}
                    />
                </fieldset>

                <button
                    type="submit"
                    className="flex w-full justify-center rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-400 to-sky-400 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_-22px_rgba(59,130,246,0.55)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 active:scale-[0.99]"
                    aria-describedby={errorMessageId}
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

            <div className="relative mt-8 flex items-center" role="presentation">
                <span className="h-px flex-1 bg-slate-800" aria-hidden="true" />
                <span className="px-3 text-xs font-semibold tracking-[0.25em] text-slate-500" aria-hidden="true">
                    OR
                </span>
                <span className="h-px flex-1 bg-slate-800" aria-hidden="true" />
            </div>

            <div className="mt-6">
                <GoogleLoginButton variant="dark" />
            </div>

            <p className="mt-8 text-center text-sm text-slate-400">
                아직 멤버가 아니신가요?{' '}
                <button
                    type="button"
                    className="font-semibold text-indigo-300 transition hover:text-indigo-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                    onClick={handleChangeForm}
                >
                    가입하기
                </button>
            </p>
        </div>
    );
}
