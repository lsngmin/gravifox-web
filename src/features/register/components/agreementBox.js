import React, { useEffect, useState } from "react";
import TermsBox from "./termsBox";
import {useNavigate} from "react-router-dom";

const AgreementBox = ({ variant = 'default' }) => {
    const navigate = useNavigate();
    const NavigateToRegister = () => {
        if (!canProceed) return;
        const params = new URLSearchParams({
            termsCookie: cookie.toString(),
            termsMarketing: marketing.toString(),
        });
        navigate(`/register?${params.toString()}`);
    }
    const [tos, setTos] = useState(false);
    const [privacy, setPrivacy] = useState(false);
    const [cookie, setCookie] = useState(false);
    const [marketing, setMarketing] = useState(false);
    const [agreeAll, setAgreeAll] = useState(false);

    // 체크박스 상태 배열
    const termsList = [
        { id: "tos", checked: tos, setChecked: setTos, label: "Terms of Service", required: true },
        { id: "privacy", checked: privacy, setChecked: setPrivacy, label: "Privacy Policy", required: true },
        { id: "cookie", checked: cookie, setChecked: setCookie, label: "Cookie Policy", required: false },
        { id: "marketing", checked: marketing, setChecked: setMarketing, label: "Marketing Consent", required: false },
    ];

    // 전체 동의 sync
    useEffect(() => {
        const allChecked = tos && privacy && cookie && marketing;
        if (allChecked !== agreeAll) {
            setAgreeAll(allChecked);
        }
    }, [tos, privacy, cookie, marketing, agreeAll]);

    // 전체 동의 클릭 시
    const handleAgreeAllChange = () => {
        const next = !agreeAll;
        setAgreeAll(next);
        setTos(next);
        setPrivacy(next);
        setCookie(next);
        setMarketing(next);
    };

    // “다음(Next)” 버튼 활성화 여부 (필수 약관 두 가지)
    const canProceed = tos && privacy;

    const getKoreanLabel = (en) => {
        switch (en) {
            case 'Terms of Service':
                return '이용약관';
            case 'Privacy Policy':
                return '개인정보 처리방침';
            case 'Cookie Policy':
                return '쿠키 정책';
            case 'Marketing Consent':
                return '마케팅 수신 동의';
            default:
                return en;
        }
    };

    const isMobileDark = variant === 'mobile-dark';

    return (
        <div className={`w-full mx-auto mb-14 ${isMobileDark ? 'max-w-none' : 'max-w-lg'}`}>
            {/* 전체 동의 */}
            <div className="flex items-center gap-3 pb-3">
                <input
                    type="checkbox"
                    id="agreeAll"
                    name="termsAgree"
                    checked={agreeAll}
                    onChange={handleAgreeAllChange}
                    className={`${isMobileDark
                        ? 'h-5 w-5 rounded-md border-slate-600 bg-slate-900 text-indigo-500 accent-indigo-500 focus:ring-indigo-400/40'
                        : 'h-5 w-5 rounded-sm border border-gray-300 bg-white accent-indigo-600 focus:ring-indigo-300'}`}
                />
                <label
                    htmlFor="agreeAll"
                    className={`${isMobileDark ? 'text-sm font-semibold text-slate-100' : 'text-md text-gray-800 select-none font-bold'}`}
                >
                    {isMobileDark ? '모두 동의' : 'Agree All'}
                </label>
            </div>

            <p className={`${isMobileDark ? 'text-xs text-slate-400' : 'text-sm text-gray-600'} select-none`}>
                {isMobileDark
                    ? '서비스 이용을 위해 필수 약관에 동의해 주세요. 선택 항목은 동의하지 않아도 가입 가능해요.'
                    : 'I agree to the Terms of Service and Privacy Policy, and also consent to the optional Cookie Policy and Marketing Consent.'}
            </p>

            {/* 개별 약관 리스트 */}
            {termsList.map(({ id, checked, setChecked, label, required }) => (
                <React.Fragment key={id}>
                    <div className="flex items-center gap-3 mb-2 mt-8">
                        <input
                            type="checkbox"
                            checked={checked}
                            id={id}
                            onChange={() => setChecked((prev) => !prev)}
                            className={`${isMobileDark
                                ? 'h-5 w-5 rounded-md border-slate-600 bg-slate-900 text-indigo-400 accent-indigo-500 focus:ring-indigo-400/40'
                                : 'h-5 w-5 rounded-sm border border-gray-300 bg-white text-indigo-600 accent-indigo-600 focus:ring-indigo-300'}`}
                        />
                        {required ? (
                            <span className={`${isMobileDark ? 'ml-2 rounded-md bg-indigo-500/15 px-2 py-0.5 text-[11px] font-semibold text-indigo-300' : 'ml-2 font-bold text-sm text-indigo-500'}`}>
                                {isMobileDark ? '필수' : '[Required]'}
                            </span>
                        ) : (
                            <span className={`${isMobileDark ? 'ml-2 rounded-md bg-slate-700/40 px-2 py-0.5 text-[11px] font-semibold text-slate-300' : 'ml-2 font-bold text-sm text-gray-500'}`}>
                                {isMobileDark ? '선택' : '[Optional]'}
                            </span>
                        )}
                        <span className={`${isMobileDark ? 'ml-2 font-semibold text-sm text-slate-100' : 'ml-2 font-bold text-sm text-gray-800'}`}>{isMobileDark ? getKoreanLabel(label) : label}</span>
                    </div>

                    {/* TermsBox 컴포넌트에 label 대신 id로 구분해도 무방합니다 */}
                    <TermsBox type={label} variant={isMobileDark ? 'dark' : 'light'} />
                </React.Fragment>
            ))}

            {/* Next 버튼: 필수 항목 미체크 시 disabled */}
            <div>
                <button
                    type="submit"
                    onClick={NavigateToRegister}
                    disabled={!canProceed}
                    aria-disabled={!canProceed}
                    className={`group relative mt-10 w-full overflow-hidden rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                        canProceed
                            ? 'bg-gradient-to-r from-indigo-500 via-indigo-400 to-sky-400 text-white shadow-[0_18px_36px_-22px_rgba(59,130,246,0.55)] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-indigo-400/40'
                            : 'bg-slate-800/70 text-slate-200/90 ring-1 ring-slate-600/60 cursor-not-allowed'
                    }`}
                >
                    <span className="inline-flex items-center gap-2">
                        {isMobileDark ? '다음' : 'Next'}
                        {canProceed && (
                            <svg viewBox="0 0 24 24" className="h-4 w-4 opacity-90" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
                            </svg>
                        )}
                    </span>
                </button>
            </div>
        </div>
    );
};

export default AgreementBox;
