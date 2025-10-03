import React, { useState, useEffect } from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import signupAPI from "../../login/api/signupAPI";

const RegisterBox = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const termsCookieParam = searchParams.get("termsCookie");
    const termsMarketingParam = searchParams.get("termsMarketing");

    const [showPassword, setShowPassword] = useState(false);

    const [formState, setFormState] = useState({
        email: "",
        password: "",
        name: "",
        dob: "",
        termsCookie: "",
        termsMarketing: "",
    });
    const [errors, setErrors] = useState({
        email: null,
        password: null,
        name: null,
        dob: null,
    });
    const [canSubmit, setCanSubmit] = useState(false);

    useEffect(() => {
        if (termsCookieParam == null && termsMarketingParam == null) {
            navigate("/agree", { replace: true });
            return;
        }
        setFormState((prev) => ({
            ...prev,
            termsCookie: termsCookieParam ?? "",
            termsMarketing: termsMarketingParam ?? "",
        }));
    }, [termsCookieParam, termsMarketingParam, navigate]);

    const { signup } = signupAPI();

    // ─── 유효성 검사 함수들 ─────────────────────────────────────────────────────

    const validateEmail = (value) => {
        if (!value) return "Email is required.";
        // 아주 간단한 이메일 정규식 예시 (운영 시 더 정교하게 교체)
        const re = /^\S+@\S+\.\S+$/;
        return re.test(value) ? null : "Invalid email format.";
    };

    const validatePassword = (value) => {
        if (!value) return "Password is required.";
        return value.length >= 8
            ? null
            : "Password must be at least 8 characters.";
    };

    const validateName = (value) => {
        return value.trim() ? null : "Name is required.";
    };

    const validateDob = (value) => {
        // YYYY-MM-DD 형식 체크 (simple)
        if (!value) return "Date of Birth is required.";
        // 최소한 “YYYY-MM-DD” 체크
        const re = /^\d{8}$/;
        return re.test(value) ? null : "Use YYYYMMDD format.";
    };

    // ─── onChange 핸들러 (필드마다 검증) ───────────────────────────────────────────

    const handleInputChange = (field) => (e) => {
        const newValue = e.target.value;
        // 1) 값 갱신
        setFormState((prev) => ({ ...prev, [field]: newValue }));

        // 2) 해당 필드 검증
        let errorMsg = null;
        switch (field) {
            case "email":
                errorMsg = validateEmail(newValue);
                break;
            case "password":
                errorMsg = validatePassword(newValue);
                // 패스워드가 바뀌면 confirmPassword도 재검증
                setErrors((prev) => ({
                    ...prev,
                    password: errorMsg,
                }));
                return; // 이미 에러 상태를 한 번에 처리했으니 return
            case "name":
                errorMsg = validateName(newValue);
                break;
            case "dob":
                errorMsg = validateDob(newValue);
                break;
            default:
                errorMsg = null;
        }
        setErrors((prev) => ({ ...prev, [field]: errorMsg }));
    };

    // ─── 전체 제출 가능 여부 계산(useEffect) ────────────────────────────────────

    useEffect(() => {
        // errors 중 하나라도 존재하면 제출 불가
        const hasError = Object.values(errors).some((msg) => msg !== null);
        // 모든 필수 필드가 채워졌는지 확인
        const allFilled =
            formState.email &&
            formState.password &&
            formState.name &&
            formState.dob;
        setCanSubmit(!hasError && allFilled);
    }, [errors, formState]);

    // ─── 폼 제출 핸들러 ─────────────────────────────────────────────────────────

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        console.log(formState);
        try {
            // 예시: signIn 대신 회원가입 API 호출로 교체
            await signup(formState);
        } catch (error) {
            // 서버 에러 처리
            console.error(error);
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto mb-14">
            <form onSubmit={handleSubmit} className="space-y-6 px-10 w-[32rem]">
                {/* ───────── Required Information ──────────────────────────────────── */}
                <div className="pt-2">
                    <div className="inline-block select-none whitespace-nowrap rounded-lg bg-blue-500 py-2 px-3.5 font-sans text-xs font-bold uppercase text-white">
                        <div className="mt-px">Required Information</div>
                    </div>
                </div>

                {/* Email */}
                <div className="relative">
                    <input
                        type="email"
                        id="email"
                        value={formState.email}
                        onChange={handleInputChange("email")}
                        className="block rounded-t-lg px-2.5 pb-2.5 pt-5 w-full text-sm text-gray-900 bg-gray-50 border-0 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                        placeholder=" "
                    />
                    <label
                        htmlFor="email"
                        className="absolute text-sm text-gray-500 transform -translate-y-4 scale-75 top-4 origin-[0] start-2.5 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4"
                    >
                        *Email Address
                    </label>
                    {errors.email && (
                        <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                    )}
                </div>

                {/* Password */}
                <div className="relative h-14">
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={formState.password}
                        onChange={handleInputChange("password")}
                        className="
        block w-full
        rounded-t-lg px-2.5 pb-2.5 pt-5 pr-10   /* pr-10으로 아이콘 공간 확보 */
        text-sm text-gray-900 bg-gray-50
        border-0 border-b-2 border-gray-300 appearance-none
        focus:outline-none focus:ring-0 focus:border-blue-600
        peer
      "
                        placeholder=" "
                    />

                    <label
                        htmlFor="password"
                        className="
        absolute left-2 top-4
        text-sm text-gray-500
        transform -translate-y-4 scale-75 origin-[0]
        peer-focus:text-blue-600
        peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100
        peer-focus:scale-75 peer-focus:-translate-y-4
      "
                    >
                        *Password
                    </label>

                    {/* 2) 아이콘만 이 wrapper 내부에서 절대 위치 */}
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="
        absolute right-2 top-1/2 transform -translate-y-1/2
        text-gray-500 hover:text-gray-700 focus:outline-none
      "
                    >
                        {showPassword ? (
                            /* 눈 감긴 아이콘 */
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.99902 3L20.999 21M9.8433 9.91364C9.32066 10.4536 8.99902 11.1892 8.99902 12C8.99902 13.6569 10.3422 15 11.999 15C12.8215 15 13.5667 14.669 14.1086 14.133M6.49902 6.64715C4.59972 7.90034 3.15305 9.78394 2.45703 12C3.73128 16.0571 7.52159 19 11.9992 19C13.9881 19 15.8414 18.4194 17.3988 17.4184M10.999 5.04939C11.328 5.01673 11.6617 5 11.9992 5C16.4769 5 20.2672 7.94291 21.5414 12C21.2607 12.894 20.8577 13.7338 20.3522 14.5" stroke="#3e3e3e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        ) : (
                            /* 열린 눈 아이콘 */
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.0007 12C15.0007 13.6569 13.6576 15 12.0007 15C10.3439 15 9.00073 13.6569 9.00073 12C9.00073 10.3431 10.3439 9 12.0007 9C13.6576 9 15.0007 10.3431 15.0007 12Z" stroke="#3e3e3e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M12.0012 5C7.52354 5 3.73326 7.94288 2.45898 12C3.73324 16.0571 7.52354 19 12.0012 19C16.4788 19 20.2691 16.0571 21.5434 12C20.2691 7.94291 16.4788 5 12.0012 5Z" stroke="#3e3e3e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        )}
                    </button>
                    {errors.password && (
                        <div>
                            <p className="mt-1 text-xs text-red-500">{errors.password}</p></div>
                    )}
                </div>


                {/* ───────── Consent Information ───────────────────────────────────── */}
                {/*<div className="pt-6">*/}
                {/*    <div className="inline-block select-none whitespace-nowrap rounded-lg bg-amber-500 py-2 px-3.5 font-sans text-xs font-bold uppercase text-black">*/}
                {/*        <div className="mt-px">Consent Information</div>*/}
                {/*    </div>*/}
                {/*</div>*/}

                {/* Name */}
                <div className="relative">
                    <input
                        type="text"
                        id="name"
                        value={formState.name}
                        onChange={handleInputChange("name")}
                        className="block rounded-t-lg px-2.5 pb-2.5 pt-5 w-full text-sm text-gray-900 bg-gray-50 border-0 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                        placeholder=" "
                    />
                    <label
                        htmlFor="name"
                        className="absolute text-sm text-gray-500 transform -translate-y-4 scale-75 top-4 origin-[0] start-2.5 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4"
                    >
                        *Name
                    </label>
                    {errors.name && (
                        <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                    )}
                </div>

                {/* Date of Birth */}
                <div className="relative">
                    <input
                        type="text"
                        id="dob"
                        value={formState.dob}
                        onChange={handleInputChange("dob")}
                        maxLength={8}
                        className="block rounded-t-lg px-2.5 pb-2.5 pt-5 w-full text-sm text-gray-900 bg-gray-50 border-0 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                        placeholder=""
                    />
                    <label
                        htmlFor="dob"
                        className="absolute text-sm text-gray-500 transform -translate-y-4 scale-75 top-4 origin-[0] start-2.5 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4"
                    >
                        Date of Birth (YYYYMMDD)
                    </label>
                    {errors.dob && (
                        <p className="mt-1 text-xs text-red-500">{errors.dob}</p>
                    )}
                </div>

                {/* Submit Button */}
                <div>
                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className={`
              flex w-full h-14 items-center justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm
              hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600
              disabled:bg-gray-400 disabled:cursor-not-allowed
            `}
                    >
                        Sign Up
                    </button>
                </div>

                {/* 서버 에러 메시지는 필요에 따라 아래에 렌더링 */}
                {/* {errorStatus && <p className="text-red-500">{errorMessage}</p>}*/}
            </form>
        </div>
    );
};

export default RegisterBox;
