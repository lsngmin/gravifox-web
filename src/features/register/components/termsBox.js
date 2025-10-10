import {cookiePolicy, marketingConsentText, privacyPolicy, termsOfService} from "./termsContent";

export default function TermsBox({ type, variant = 'light' }) {
    let content = "";
    switch (type) {
        case "Terms of Service":
            content = termsOfService;
            break;
        case "Privacy Policy":
            content = privacyPolicy;
            break;
        case "Cookie Policy":
            content = cookiePolicy;
            break;
        case "Marketing Consent":
            content = marketingConsentText;
            break;
        default:
            content = "";
            break;
    }
    const isDark = variant === 'dark';
    return (
        <div
            className={`${isDark
                ? 'border border-slate-700 rounded-xl bg-slate-900/60 p-4 h-28 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-900 [&::-webkit-scrollbar-thumb]:bg-slate-700/80 [&::-webkit-scrollbar-thumb]:rounded-lg'
                : 'border border-gray-300 rounded-lg bg-white p-4 h-28 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-lg'}`}
        >
            <p className={`whitespace-pre-wrap text-sm ${isDark ? 'text-slate-300' : 'text-gray-500'}`}>
                {content}
            </p>
        </div>
    );
}
