import React from "react";

/**
 * UploadDropzone
 * - 드래그&드롭 영역
 * - onDropFiles(FileList|File[])로 여러 파일 전달
 */
export default function UploadDropzone({
                                           dragOver = false,
                                           setDragOver = () => {},
                                           onDropFiles = () => {},
                                           className = "",
                                           children,
                                       }) {
    return (
        <div
            onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                onDropFiles(e.dataTransfer.files);
            }}
            className={`group relative rounded-xl border-2 border-dashed p-8 flex flex-col items-center text-slate-600 transition ${
                dragOver
                    ? "border-indigo-400 bg-indigo-50/40"
                    : "border-slate-300 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/30"
            } ${className}`}
        >
            {children}
        </div>
    );
}
