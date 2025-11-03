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
    // Adapt to theme via dark: classes (ignore variant prop for styling)
    return (
        <div className="h-28 overflow-y-auto rounded-xl border border-gray-300 bg-white p-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-lg [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-track]:bg-gray-100 dark:border-slate-700 dark:bg-slate-900/60 [&::-webkit-scrollbar-track]:dark:bg-slate-900 [&::-webkit-scrollbar-thumb]:dark:bg-slate-700/80">
            <p className="whitespace-pre-wrap text-sm text-gray-600 dark:text-slate-300">
                {content}
            </p>
        </div>
    );
}
