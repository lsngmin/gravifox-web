import {cookiePolicy, marketingConsentText, privacyPolicy, termsOfService} from "./termsContent";

export default function TermsBox({type}) {
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
    return (
        <div
            className="border border-gray-300 rounded-lg bg-white p-4 h-28 overflow-y-auto
                [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100
                [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-lg"
        >
            <p className="whitespace-pre-wrap text-sm text-gray-500">
                {content}
            </p>
        </div>
    );
}
