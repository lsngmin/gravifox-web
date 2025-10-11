import React from 'react';

export default function LoginErrorMessage({ status, message, onClose }) {
    if (!status && !message) return null;

    const messages = {
        422: "Oops! Something doesn’t match.",
        401: 'Invalid credentials.',
        400: "Something doesn’t match.",
        default: 'Unexpected error occurred.',
    };

    const displayMessage = message || messages[status] || messages.default;

    return (
        <div
            id="login-error-message"
            role="alert"
            aria-live="assertive"
            className="mt-4 flex items-start gap-3 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100 shadow-[0_20px_40px_-24px_rgba(248,113,113,0.6)] backdrop-blur-sm"
        >
            <svg
                className="mt-0.5 h-4 w-4 flex-none"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
            </svg>
            <div className="flex-1 font-medium leading-snug text-red-100/90">{displayMessage}</div>
            <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-m-1 inline-flex size-8 items-center justify-center rounded-xl border border-red-400/50 bg-red-500/20 text-red-50 transition hover:bg-red-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
                <svg
                    className="size-3.5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                >
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                </svg>
            </button>
        </div>
    );
}