import React, { useId } from "react";

/**
 * UploadHint
 * - 업로드 안내 + 숨김 input
 * - multiple 지원, onFiles(FileList) 또는 onChange(단일) 콜백
 */
export default function UploadHint({
                                       onFiles,          // (FileList) => void
                                       onChange,         // (File) => void  (fallback)
                                       accept = "image/*,video/*",
                                       multiple = false,
                                       label = "파일 선택",
                                       className = "",
                                       textClassName = "",
                                       labelClassName = "",
                                       hintRight = null, // 오른쪽에 붙일 보조 텍스트
                                       theme = 'light',
                                   }) {
    const inputId = useId();
    const isDark = theme === 'dark';
    const textBase = `${isDark ? 'text-sm text-slate-200' : 'text-sm text-slate-700'} text-center`;
    const labelBase = isDark
        ? "ml-1 font-semibold text-indigo-300 hover:text-indigo-200 cursor-pointer"
        : "ml-1 font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer";

    const handleChange = (e) => {
        const fl = e.target.files;
        if (!fl?.length) return;
        if (onFiles) onFiles(fl);
        else if (onChange) onChange(fl[0]);
        // 같은 파일을 연속 선택해도 change가 다시 발생하도록 초기화
        e.target.value = "";
    };

    return (
        <div className={`flex items-center ${className}`}>
            <p className={`${textBase} ${textClassName}`.trim()}>
                여기에 파일을 끌어다 놓거나
                <label
                    htmlFor={inputId}
                    className={`${labelBase} ${labelClassName}`.trim()}
                >
                    {label}
                </label>
                을 눌러 업로드하세요
            </p>
            {hintRight}
            <input
                id={inputId}
                type="file"
                accept={accept}
                multiple={multiple}
                className="hidden"
                onClick={(e) => { e.target.value = ""; }}
                onChange={handleChange}
            />
        </div>
    );
}
