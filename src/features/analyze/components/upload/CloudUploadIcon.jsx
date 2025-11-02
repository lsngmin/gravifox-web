import React from "react";

/**
 * CloudUploadIcon
 * - 업로드 드롭존에서 사용하는 기본 아이콘
 * - Tailwind 색상/크기 조정 가능
 */
export default function CloudUploadIcon({ className = "", theme = 'light' }) {
    const isDark = theme === 'dark';
    const iconClass = [
        "mb-3 h-9 w-9 transition-colors",
        isDark ? "text-indigo-300 group-hover:text-indigo-200" : "text-indigo-500 group-hover:text-indigo-600",
        className,
    ].filter(Boolean).join(" ");

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="1.8"
            stroke="currentColor"
            className={iconClass}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16v-7m0 0l-3 3m3-3l3 3M6 19a4 4 0 01-.88-7.903A5.5 5.5 0 1118.5 9.5h.5a4.5 4.5 0 010 9H6z"
            />
        </svg>
    );
}
