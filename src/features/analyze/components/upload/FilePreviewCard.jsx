import React, { useEffect, useMemo, useState } from "react";

function formatBytes(bytes) {
    if (!bytes && bytes !== 0) return "-";
    const k = 1024, sizes = ["B","KB","MB","GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}
const formatDuration = (sec) => {
    if (!sec && sec !== 0) return "-";
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    const m = Math.floor(sec / 60);
    return `${m}:${s}`;
};
const mpStr = (w, h) => (w && h ? `${(w*h/1_000_000).toFixed(1)}MP` : "-");
const aspect = (w, h) => {
    if (!w || !h) return "-";
    const gcd = (a,b)=> b?gcd(b,a%b):a;
    const g = gcd(w,h);
    return `${Math.round(w/g)}:${Math.round(h/g)}`;
};

export default function FilePreviewCard({ file, onRemove, variant = 'light' }) {
    const [isVideo, setIsVideo] = useState(false);
    const [dims, setDims]   = useState({ w: null, h: null });
    const [dur, setDur]     = useState(null);
    const src = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

    useEffect(() => {
        setIsVideo(file?.type?.startsWith("video/"));
        return () => { if (src) URL.revokeObjectURL(src); };
    }, [file, src]);

    // 이미지 해상도
    useEffect(() => {
        if (!file || isVideo) return;
        const img = new Image();
        img.onload = () => setDims({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = () => setDims({ w: null, h: null });
        img.src = src;
    }, [file, isVideo, src]);

    // 비디오 메타
    const onVideoMeta = (e) => {
        const v = e.currentTarget;
        setDims({ w: v.videoWidth, h: v.videoHeight });
        setDur(v.duration);
    };

    const isDark = variant === 'dark';
    const containerClass = isDark
        ? 'relative flex items-center gap-4 rounded-xl border border-slate-700 bg-slate-900/70 p-4 text-slate-100'
        : 'relative flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4';
    const removeBtnClass = isDark
        ? 'absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-600 bg-slate-800/70 shadow-sm backdrop-blur transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400/30'
        : 'absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white/80 shadow-sm backdrop-blur transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-200';
    const removeIconClass = isDark ? 'h-3.5 w-3.5 text-slate-300' : 'h-3.5 w-3.5 text-slate-600';
    const thumbBgClass = isDark ? 'bg-slate-800' : 'bg-slate-100';
    const titleClass = isDark ? 'truncate text-sm font-medium text-slate-100' : 'truncate text-sm font-medium text-slate-900';
    const sectionLabelClass = isDark ? 'text-[11px] font-semibold text-slate-400' : 'text-[11px] font-semibold text-slate-500';
    const chipClass = isDark ? 'rounded-md bg-slate-800 px-2 py-0.5 text-slate-200' : 'rounded-md bg-slate-50 px-2 py-0.5';
    const metaTextClass = isDark ? 'text-[11px] text-slate-300' : 'text-[11px] text-slate-600';

    return (
        <div className={containerClass}>
            {/* 닫기(X) 버튼: 우측 중앙 */}
            {typeof onRemove === "function" && (
                <button
                    type="button"
                    aria-label="선택한 파일 제거"
                    onClick={onRemove}
                    className={removeBtnClass}
                >
                    <svg
                        viewBox="0 0 24 24"
                        className={removeIconClass}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                    </svg>
                </button>
            )}

            {/* 썸네일 (좌) */}
            <div className={`relative shrink-0 overflow-hidden rounded-lg ${thumbBgClass} w-40 h-24 sm:w-56 sm:h-32`}>
                {isVideo ? (
                    <video
                        src={src}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                        controls={false}
                        preload="metadata"
                        onLoadedMetadata={onVideoMeta}
                    />
                ) : (
                    <img
                        src={src}
                        alt={file?.name || "미리보기"}
                        className="h-full w-full object-cover"
                        loading="lazy"
                    />
                )}
            </div>

            {/* 정보 (우) */}
            <div className="min-w-0 flex-1 pr-8"> {/* pr-8: X버튼과 겹치지 않게 여백 */}
                <p className={titleClass}>{file?.name}</p>

                {/* 공통 파일 정보 */}
                <div className="mt-2">
                    <p className={sectionLabelClass}>파일</p>
                    <div className={`mt-1 flex flex-wrap items-center gap-2 ${metaTextClass}`}>
                        <span className={chipClass}>{file?.type || "형식 미상"}</span>
                        <span className={chipClass}>{formatBytes(file?.size)}</span>
                    </div>
                </div>

                {/* 이미지 정보 */}
                {!isVideo && (
                    <div className="mt-2">
                        <p className={sectionLabelClass}>이미지 정보</p>
                        <div className={`mt-1 flex flex-wrap items-center gap-2 ${metaTextClass}`}>
              <span className={chipClass}>
                {dims.w && dims.h ? `${dims.w}×${dims.h}px` : "해상도 -"}
              </span>
                            <span className={chipClass}>{mpStr(dims.w, dims.h)}</span>
                            <span className={chipClass}>{aspect(dims.w, dims.h)} 비율</span>
                        </div>
                    </div>
                )}

                {/* 비디오 정보 */}
                {isVideo && (
                    <div className="mt-2">
                        <p className={sectionLabelClass}>비디오 정보</p>
                        <div className={`mt-1 flex flex-wrap items-center gap-2 ${metaTextClass}`}>
              <span className={chipClass}>
                {dims.w && dims.h ? `${dims.w}×${dims.h}px` : "해상도 -"}
              </span>
                            <span className={chipClass}>
                길이 {dur != null ? formatDuration(dur) : "-"}
              </span>
                            <span className={chipClass}>{aspect(dims.w, dims.h)} 비율</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
