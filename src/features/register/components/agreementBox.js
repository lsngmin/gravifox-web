import React, { useEffect, useState } from "react";
import TermsBox from "./termsBox";
import {useNavigate} from "react-router-dom";

const AgreementBox = () => {
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

    return (
        <div className="w-full max-w-lg mx-auto mb-14">
            {/* 전체 동의 */}
            <div className="flex items-center pb-3">
                <input
                    type="checkbox"
                    id="agreeAll"
                    name="termsAgree"
                    checked={agreeAll}
                    onChange={handleAgreeAllChange}
                    className="h-6 w-6 rounded-sm border border-gray-300 bg-white"
                />
                <label htmlFor="agreeAll" className="ml-2 text-md text-gray-800 select-none font-bold">
                    Agree All
                </label>
            </div>

            <p className="text-sm text-gray-600 select-none">
                I agree to the Terms of Service and Privacy Policy,
                <br />
                and also consent to the optional Cookie Policy and Marketing Consent.
            </p>

            {/* 개별 약관 리스트 */}
            {termsList.map(({ id, checked, setChecked, label, required }) => (
                <React.Fragment key={id}>
                    <div className="flex items-center mb-2 mt-8">
                        <input
                            type="checkbox"
                            checked={checked}
                            id={id}
                            onChange={() => setChecked((prev) => !prev)}
                            className="h-5 w-5 text-indigo-600 focus:ring-indigo-400 border-gray-300"
                        />
                        {required ? (
                            <span className="ml-2 font-bold text-sm text-indigo-500">[Required]</span>
                        ) : (
                            <span className="ml-2 font-bold text-sm text-gray-500">[Optional]</span>
                        )}
                        <span className="ml-2 font-bold text-sm text-gray-800">{label}</span>
                    </div>

                    {/* TermsBox 컴포넌트에 label 대신 id로 구분해도 무방합니다 */}
                    <TermsBox type={label} />
                </React.Fragment>
            ))}

            {/* Next 버튼: 필수 항목 미체크 시 disabled */}
            <div>
                <button
                    type="submit"
                    onClick={NavigateToRegister}
                    disabled={!canProceed}
                    className="
            flex mt-12 w-full justify-center
            rounded-md bg-indigo-600 px-3 py-4 text-sm/6 font-semibold text-white shadow-sm
            hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600
            disabled:bg-gray-400 disabled:cursor-not-allowed
          "
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default AgreementBox;
