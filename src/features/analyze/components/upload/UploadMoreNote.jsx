// components/upload/UploadMoreNote.jsx
import React, { useId } from "react";

export default function UploadMoreNote({
                                           text = "이미지는 3개까지",
                                           sub = "동영상은 한 개만 업로드할 수 있어요.",
                                           onAdd, // (file) => void
                                           accept = "image/*,video/*",
                                           className = "",
                                       }) {
    const id = useId();

    return (
        <div className={`mt-3 flex items-center justify-between ${className}`}>
            <p className="text-xs text-slate-600">
                <span className="underline decoration-inherit">이미지는 3장</span>
                {" "}· <span className="underline decoration-inherit">동영상은 1개</span>만 업로드할 수 있어요.
            </p>

            <div className="flex items-center">
                <label
                    htmlFor={id}
                    className="cursor-pointer  bg-white px-2.5 py-1 text-[11px] font-medium text-indigo-700"
                >
                    파일을 추가할게요
                </label>
                <input
                    id={id}
                    type="file"
                    className="hidden"
                    accept={accept}
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f && onAdd) onAdd(f);
                    }}
                />
            </div>
        </div>
    );
}
