import React, { useEffect, useState } from "react";
import TermsBox from "features/register/components/termsBox";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const AgreementBox = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation('common');
  const { lng } = useParams();
  const isKo = (i18n?.language || '').slice(0,2) === 'ko';

  const [tos, setTos] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [cookie, setCookie] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [agreeAll, setAgreeAll] = useState(false);

  useEffect(() => {
    const allChecked = tos && privacy && cookie && marketing;
    if (allChecked !== agreeAll) setAgreeAll(allChecked);
  }, [tos, privacy, cookie, marketing, agreeAll]);

  const handleAgreeAllChange = () => {
    const next = !agreeAll;
    setAgreeAll(next);
    setTos(next);
    setPrivacy(next);
    setCookie(next);
    setMarketing(next);
  };

  const canProceed = tos && privacy;

  const getKoreanLabel = (en) => {
    switch (en) {
      case 'Terms of Service': return '이용약관';
      case 'Privacy Policy': return '개인정보 처리방침';
      case 'Cookie Policy': return '쿠키 정책';
      case 'Marketing Consent': return '마케팅 수신 동의';
      default: return en;
    }
  };

  const terms = [
    { id: 'tos', checked: tos, set: setTos, label: 'Terms of Service', required: true },
    { id: 'privacy', checked: privacy, set: setPrivacy, label: 'Privacy Policy', required: true },
    { id: 'cookie', checked: cookie, set: setCookie, label: 'Cookie Policy', required: false },
    { id: 'marketing', checked: marketing, set: setMarketing, label: 'Marketing Consent', required: false },
  ];

  const goNext = () => {
    if (!canProceed) return;
    const params = new URLSearchParams({
      termsCookie: cookie.toString(),
      termsMarketing: marketing.toString(),
    });
    const prefix = lng ? `/${lng}` : '';
    navigate(`${prefix}/register?${params.toString()}`);
  };

  return (
    <div className="w-full mx-auto max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
      {/* Agree All */}
      <div className="flex items-center gap-3 pb-3">
        <input
          type="checkbox"
          id="agreeAll"
          name="termsAgree"
          checked={agreeAll}
          onChange={handleAgreeAllChange}
          className="h-5 w-5 rounded-md border border-slate-300 bg-white text-indigo-600 accent-indigo-600 focus:ring-indigo-300 dark:border-slate-600 dark:bg-slate-900 dark:text-indigo-400 dark:accent-indigo-500 dark:focus:ring-indigo-400/40"
        />
        <label htmlFor="agreeAll" className="text-md select-none font-bold text-gray-800 dark:text-slate-100">
          {isKo ? '모두 동의' : 'Agree All'}
        </label>
      </div>

      <p className="select-none text-sm text-gray-600 dark:text-slate-400">
        {isKo
          ? '서비스 이용을 위해 필수 약관에 동의해 주세요. 선택 항목은 동의하지 않아도 가입 가능해요.'
          : 'To continue, please agree to the required terms. Optional items are not mandatory.'}
      </p>

      {/* Terms list */}
      {terms.map(({ id, checked, set, label, required }) => (
        <React.Fragment key={id}>
          <div className="mt-8 mb-2 flex items-center gap-3">
            <input
              type="checkbox"
              checked={checked}
              id={id}
              onChange={() => set((prev) => !prev)}
              className="h-5 w-5 rounded-md border border-slate-300 bg-white text-indigo-600 accent-indigo-600 focus:ring-indigo-300 dark:border-slate-600 dark:bg-slate-900 dark:text-indigo-400 dark:accent-indigo-500 dark:focus:ring-indigo-400/40"
            />
            {required ? (
              <span className="ml-2 rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                {isKo ? '필수' : '[Required]'}
              </span>
            ) : (
              <span className="ml-2 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-700/40 dark:text-slate-300">
                {isKo ? '선택' : '[Optional]'}
              </span>
            )}
            <span className="ml-2 text-sm font-semibold text-gray-800 dark:text-slate-100">
              {isKo ? getKoreanLabel(label) : label}
            </span>
          </div>

          <TermsBox type={label} variant={"light" /* colors handled by container */} />
        </React.Fragment>
      ))}

      {/* Next button */}
      <div>
        <button
          type="button"
          onClick={goNext}
          disabled={!canProceed}
          aria-disabled={!canProceed}
          className={`group relative mt-10 w-full overflow-hidden rounded-2xl px-4 py-3 text-sm font-semibold transition ${
            canProceed
              ? 'bg-gradient-to-r from-indigo-500 via-indigo-400 to-sky-400 text-white shadow-[0_18px_36px_-22px_rgba(59,130,246,0.55)] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-indigo-400/40'
              : 'bg-slate-100 text-slate-400 ring-1 ring-slate-300 cursor-not-allowed dark:bg-slate-800/70 dark:text-slate-200/90 dark:ring-slate-600/60'
          }`}
        >
          <span className="inline-flex items-center gap-2">
            {isKo ? '다음' : 'Next'}
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
