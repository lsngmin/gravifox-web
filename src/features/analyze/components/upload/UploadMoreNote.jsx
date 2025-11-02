// components/upload/UploadMoreNote.jsx
import React, { useId } from "react";

export default function UploadMoreNote({
                                           text = "이미지는 3개까지",
                                           sub = "동영상은 한 개만 업로드할 수 있어요.",
                                           onAdd, // (file) => void
                                           accept = "image/*,video/*",
                                           className = "",
                                           theme = 'light',
                                       }) {
    const id = useId();
    const isDark = theme === 'dark';
    const textClass = isDark ? "text-xs text-slate-300" : "text-xs text-slate-600";
    const primaryLabel = isDark
        ? "cursor-pointer border border-indigo-400/35 bg-indigo-500/15 px-2.5 py-1 text-[11px] font-medium text-indigo-100 hover:border-indigo-300/40 hover:bg-indigo-500/25 rounded-md"
        : "cursor-pointer bg-white px-2.5 py-1 text-[11px] font-medium text-indigo-700 rounded-md";

    return (
        <div className={`mt-3 flex items-center justify-between ${className}`}>
            <p className={textClass}>
                <span className="underline decoration-inherit">이미지는 3장</span>
                {" "}· <span className="underline decoration-inherit">동영상은 1개</span>만 업로드할 수 있어요.
            </p>

            <div className="flex items-center">
                <label
                    htmlFor={id}
                    className={primaryLabel}
                >
                    파일을 추가할게요
                </label>
                <input
                    id={id}
                    type="file"
                    className="hidden"
                    accept={accept}
                    onClick={(e) => { e.target.value = ""; }}
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f && onAdd) onAdd(f);
                        // 같은 파일을 연속 선택해도 change가 다시 발생하도록 초기화
                        e.target.value = "";
                    }}
                />
            </div>
        </div>
    );
}
