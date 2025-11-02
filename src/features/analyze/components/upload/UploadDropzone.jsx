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
                                           theme = 'light',
                                       }) {
    const isDark = theme === 'dark';
    const baseClass = "group relative rounded-xl border-2 border-dashed p-8 flex flex-col items-center transition";
    const idleClass = isDark
        ? "border-slate-600 bg-slate-900/30 text-slate-200 hover:border-indigo-400/60 hover:bg-indigo-500/10"
        : "border-slate-300 bg-slate-50 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/30";
    const activeClass = isDark
        ? "border-indigo-400 bg-indigo-500/15 text-indigo-100"
        : "border-indigo-400 bg-indigo-50/40 text-indigo-600";

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
            className={[
                baseClass,
                dragOver ? activeClass : idleClass,
                className,
            ].filter(Boolean).join(" ")}
        >
            {children}
        </div>
    );
}
