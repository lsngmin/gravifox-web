import React from "react";

/**
 * UploadActions
 * - 분석 시작 / 초기화
 * - files 배열 또는 단일 file 둘 다 지원
 */
export default function UploadActions({
                                          files,
                                          file,               // (하위호환) 단일 파일
                                          onAnalyze = () => {},
                                          onReset = () => {},
                                          className = "",
                                          analyzeLabel = '분석 시작',
                                          hideReset = false,
                                          theme = 'light',
                                      }) {
    const list = Array.isArray(files) ? files : (file ? [file] : []);
    const disabled = list.length === 0;
    const isDark = theme === 'dark';
    const primaryBase = "inline-flex items-center justify-center rounded-md px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition";
    const primaryEnabled = isDark
        ? "bg-indigo-500 hover:bg-indigo-400/90 shadow-indigo-500/30"
        : "bg-indigo-600 hover:bg-indigo-700";
    const primaryDisabled = isDark
        ? "bg-indigo-500/70 opacity-60 cursor-not-allowed"
        : "bg-indigo-600 opacity-60 cursor-not-allowed";
    const resetClass = isDark
        ? "inline-flex items-center justify-center rounded-md px-3.5 py-2 text-sm font-semibold text-slate-300 hover:text-slate-100"
        : "inline-flex items-center justify-center rounded-md px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900";

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <button
                type="button"
                disabled={disabled}
                title="분석하기"
                onClick={() => !disabled && onAnalyze(list)}
                className={`${primaryBase} ${disabled ? primaryDisabled : primaryEnabled}`}
            >
                {analyzeLabel}
            </button>

            {!hideReset && (
                <button
                    type="button"
                    onClick={onReset}
                    className={resetClass}
                >
                    초기화
                </button>
            )}
        </div>
    );
}
