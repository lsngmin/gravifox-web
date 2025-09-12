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
                                       hintRight = null, // 오른쪽에 붙일 보조 텍스트
                                   }) {
    const inputId = useId();

    const handleChange = (e) => {
        const fl = e.target.files;
        if (!fl?.length) return;
        if (onFiles) onFiles(fl);
        else if (onChange) onChange(fl[0]);
    };

    return (
        <div className={`flex items-center ${className}`}>
            <p className="text-sm text-slate-700 text-center">
                여기에 파일을 끌어다 놓거나
                <label
                    htmlFor={inputId}
                    className="ml-1 font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
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
                onChange={handleChange}
            />
        </div>
    );
}
