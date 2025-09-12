import React from "react";

/**
 * SelectedFileInfo
 * - 선택된 파일 정보를 한 줄로 표시
 */
export default function SelectedFileInfo({ file, className = "" }) {
    if (!file) return null;
    return (
        <p className={`mt-3 text-xs text-slate-600 truncate max-w-full ${className}`}>
            선택됨: <span className="font-medium text-slate-800">{file.name}</span>
        </p>
    );
}
