import React, { useState, useEffect } from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import signupAPI from "../../login/api/signupAPI";

const RegisterBox = ({ variant = 'default' }) => {
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
    const [touched, setTouched] = useState({
        email: false,
        password: false,
        name: false,
        dob: false,
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
        // 서버 정책과 동일: 8~20자, 대문자 1+ 소문자/영문 1+, 숫자 1+, 특수문자 1+
        const re = /^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}\[\]:";'<>?,./]).{8,20}$/;
        return re.test(value)
            ? null
            : "8~20자, 영문 대문자/영문/숫자/특수문자를 모두 포함해 주세요.";
    };

    const validateName = (value) => {
        return value.trim() ? null : "Name is required.";
    };

    const validateDob = (value) => {
        // YYYYMMDD (8 digits) with basic range checks
        const raw = String(value || '').trim();
        if (!raw) return "Date of Birth is required.";
        const digits = raw.replace(/\D/g, '');
        if (digits.length !== 8) return "Use YYYYMMDD format.";
        const yyyy = Number(digits.slice(0, 4));
        const mm = Number(digits.slice(4, 6));
        const dd = Number(digits.slice(6, 8));
        if (Number.isNaN(yyyy) || Number.isNaN(mm) || Number.isNaN(dd)) return "Use YYYYMMDD format.";
        if (mm < 1 || mm > 12) return "Use YYYYMMDD format.";
        const daysInMonth = [31, (yyyy % 4 === 0 && yyyy % 100 !== 0) || (yyyy % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (dd < 1 || dd > daysInMonth[mm - 1]) return "Use YYYYMMDD format.";
        return null;
    };

    // ─── onChange 핸들러 (필드마다 검증) ───────────────────────────────────────────

    const handleInputChange = (field) => (e) => {
        const newValue = e.target.value;
        // 1) 값 갱신
        if (field === 'dob') {
            // 숫자만 허용하고 최대 8자리로 제한
            const digits = String(newValue || '').replace(/\D/g, '').slice(0, 8);
            setFormState((prev) => ({ ...prev, [field]: digits }));
        } else {
            setFormState((prev) => ({ ...prev, [field]: newValue }));
        }

        // 2) 해당 필드 검증
        let errorMsg = null;
        switch (field) {
            case "email":
                // 입력 중에는 터치된 상태에서만 에러 표시
                errorMsg = touched.email ? validateEmail(newValue) : null;
                break;
            case "password":
                errorMsg = touched.password ? validatePassword(newValue) : null;
                setErrors((prev) => ({
                    ...prev,
                    password: errorMsg,
                }));
                return; // 이미 에러 상태를 한 번에 처리했으니 return
            case "name":
                errorMsg = touched.name ? validateName(newValue) : null;
                break;
            case "dob":
                // DOB는 8자리에 도달하기 전에는 에러 숨김, 터치된 뒤에는 즉시 검증
                if (touched.dob) {
                    errorMsg = validateDob(newValue);
                } else {
                    const digits = String(newValue || '').replace(/\D/g, '');
                    errorMsg = digits.length === 8 ? validateDob(digits) : null;
                }
                break;
            default:
                errorMsg = null;
        }
        setErrors((prev) => ({ ...prev, [field]: errorMsg }));
    };

    const handleBlur = (field) => (e) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        // blur 시에는 무조건 검증 결과를 반영해 보이게 함
        let value = e.target.value;
        if (field === 'dob') {
            value = String(value || '').replace(/\D/g, '').slice(0, 8);
        }
        let errorMsg = null;
        switch (field) {
            case 'email':
                errorMsg = validateEmail(value);
                break;
            case 'password':
                errorMsg = validatePassword(value);
                break;
            case 'name':
                errorMsg = validateName(value);
                break;
            case 'dob':
                errorMsg = validateDob(value);
                break;
            default:
                errorMsg = null;
        }
        setErrors((prev) => ({ ...prev, [field]: errorMsg }));
    };

    // ─── 전체 제출 가능 여부 계산(useEffect) ────────────────────────────────────

    useEffect(() => {
        // 현재 값 기준 실검증(터치 여부 무관)으로 제출 가능 여부 계산
        const emailErr = validateEmail(formState.email);
        const pwErr = validatePassword(formState.password);
        const nameErr = validateName(formState.name);
        const dobErr = validateDob(formState.dob);
        const hasError = [emailErr, pwErr, nameErr, dobErr].some((msg) => msg !== null);
        const allFilled = formState.email && formState.password && formState.name && formState.dob;
        setCanSubmit(!hasError && allFilled);
    }, [formState]);

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

    const isMobileDark = variant === 'mobile-dark';

    return (
        <div className={`w-full mx-auto mb-14 ${isMobileDark ? 'max-w-none' : 'max-w-lg'}`}>
            <form onSubmit={handleSubmit} className={`space-y-6 ${isMobileDark ? '' : 'px-10 w-[32rem]'}`}>
                {/* ───────── Required Information ──────────────────────────────────── */}
                {!isMobileDark && (
                    <div className="pt-2">
                        <div className="inline-block select-none whitespace-nowrap rounded-lg bg-blue-500 py-2 px-3.5 font-sans text-xs font-bold uppercase text-white">
                            <div className="mt-px">Required Information</div>
                        </div>
                    </div>
                )}

                {/* Email */}
                <div className="relative">
                    <input
                        type="email"
                        id="email"
                        value={formState.email}
                        onChange={handleInputChange("email")}
                        autoComplete="email"
                        inputMode="email"
                        autoCapitalize="none"
                        autoCorrect="off"
                        enterKeyHint="next"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                        className={`block w-full rounded-2xl px-3 pb-2.5 pt-5 text-sm peer transition ${isMobileDark ? 'text-slate-100 bg-slate-900/60 ring-1 ring-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-transparent' : 'text-gray-900 bg-gray-50 border-0 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600'}`}
                        placeholder=" "
                    />
                    <label
                        htmlFor="email"
                        className={`absolute text-sm transform -translate-y-4 scale-75 top-4 origin-[0] start-2.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 ${isMobileDark ? 'text-slate-400 peer-focus:text-indigo-300' : 'text-gray-500 peer-focus:text-blue-600'}`}
                    >
                        {isMobileDark ? '*이메일' : '*Email Address'}
                    </label>
                    {errors.email && (
                        <p id="email-error" className="mt-1 text-xs text-red-400">{errors.email}</p>
                    )}
                </div>

                {/* Password */}
                <div className="relative h-14">
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={formState.password}
                        onChange={handleInputChange("password")}
                        autoComplete="new-password"
                        enterKeyHint="next"
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? 'password-error' : undefined}
                        className={`block w-full rounded-2xl px-3 pb-2.5 pt-5 pr-10 text-sm appearance-none peer transition ${isMobileDark ? 'text-slate-100 bg-slate-900/60 ring-1 ring-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-transparent' : 'text-gray-900 bg-gray-50 border-0 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600'}`}
                        placeholder=" "
                    />

                    <label
                        htmlFor="password"
                        className={`absolute left-2 top-4 text-sm transform -translate-y-4 scale-75 origin-[0] peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:scale-75 peer-focus:-translate-y-4 ${isMobileDark ? 'text-slate-400 peer-focus:text-indigo-300' : 'text-gray-500 peer-focus:text-blue-600'}`}
                    >
                        {isMobileDark ? '*비밀번호' : '*Password'}
                    </label>

                    {/* 2) 아이콘만 이 wrapper 내부에서 절대 위치 */}
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className={`absolute right-2 top-1/2 transform -translate-y-1/2 focus:outline-none ${isMobileDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'}`}
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
                        <p id="password-error" className="mt-1 text-xs text-red-400">{errors.password}</p>
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
                        autoComplete="name"
                        enterKeyHint="next"
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                        className={`block w-full rounded-2xl px-3 pb-2.5 pt-5 text-sm peer transition ${isMobileDark ? 'text-slate-100 bg-slate-900/60 ring-1 ring-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-transparent' : 'text-gray-900 bg-gray-50 border-0 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600'}`}
                        placeholder=" "
                    />
                    <label
                        htmlFor="name"
                        className={`absolute text-sm transform -translate-y-4 scale-75 top-4 origin-[0] start-2.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 ${isMobileDark ? 'text-slate-400 peer-focus:text-indigo-300' : 'text-gray-500 peer-focus:text-blue-600'}`}
                    >
                        {isMobileDark ? '*이름' : '*Name'}
                    </label>
                    {errors.name && (
                        <p id="name-error" className="mt-1 text-xs text-red-400">{errors.name}</p>
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
                        inputMode="numeric"
                        pattern="[0-9]{8}"
                        autoComplete="bday"
                        enterKeyHint="done"
                        aria-invalid={!!errors.dob}
                        aria-describedby={errors.dob ? 'dob-error' : undefined}
                        className={`block w-full rounded-2xl px-3 pb-2.5 pt-5 text-sm tracking-wider peer transition ${isMobileDark ? 'text-slate-100 bg-slate-900/60 ring-1 ring-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-transparent' : 'text-gray-900 bg-gray-50 border-0 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600'}`}
                        placeholder=""
                    />
                    <label
                        htmlFor="dob"
                        className={`absolute text-sm transform -translate-y-4 scale-75 top-4 origin-[0] start-2.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 ${isMobileDark ? 'text-slate-400 peer-focus:text-indigo-300' : 'text-gray-500 peer-focus:text-blue-600'}`}
                    >
                        {isMobileDark ? '생년월일 (YYYYMMDD)' : 'Date of Birth (YYYYMMDD)'}
                    </label>
                    {errors.dob && (
                        <p id="dob-error" className="mt-1 text-xs text-red-400">{errors.dob}</p>
                    )}
                </div>

                {/* Submit Button */}
                <div>
                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className={`flex w-full h-12 items-center justify-center rounded-xl px-3 text-sm font-semibold transition ${
                            canSubmit
                                ? 'bg-gradient-to-r from-indigo-500 via-indigo-400 to-sky-400 text-white shadow-[0_18px_36px_-22px_rgba(59,130,246,0.55)] active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400/40'
                                : 'bg-slate-800/70 text-slate-200/90 ring-1 ring-slate-600/60 cursor-not-allowed'
                        }`}
                    >
                        {isMobileDark ? '가입하기' : 'Sign Up'}
                    </button>
                </div>

                {/* 서버 에러 메시지는 필요에 따라 아래에 렌더링 */}
                {/* {errorStatus && <p className="text-red-500">{errorMessage}</p>}*/}
            </form>
        </div>
    );
};

export default RegisterBox;
