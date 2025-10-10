import React, { useEffect, useMemo, useState } from 'react';

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '-';
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}
const formatDuration = (sec) => {
  if (!sec && sec !== 0) return '-';
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  const m = Math.floor(sec / 60);
  return `${m}:${s}`;
};
const mpStr = (w, h) => (w && h ? `${(w * h / 1_000_000).toFixed(1)}MP` : '-');
const aspect = (w, h) => {
  if (!w || !h) return '-';
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const g = gcd(w, h);
  return `${Math.round(w / g)}:${Math.round(h / g)}`;
};

export default function MobileFilePreviewItem({ file, onRemove }) {
  const [isVideo, setIsVideo] = useState(false);
  const [dims, setDims] = useState({ w: null, h: null });
  const [dur, setDur] = useState(null);
  const src = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file]);

  useEffect(() => {
    setIsVideo(file?.type?.startsWith('video/'));
    return () => {
      if (src) URL.revokeObjectURL(src);
    };
  }, [file, src]);

  useEffect(() => {
    if (!file || isVideo) return;
    const img = new Image();
    img.onload = () => setDims({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => setDims({ w: null, h: null });
    img.src = src;
  }, [file, isVideo, src]);

  const onVideoMeta = (e) => {
    const v = e.currentTarget;
    setDims({ w: v.videoWidth, h: v.videoHeight });
    setDur(v.duration);
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-900/70 text-slate-100">
      <div className="relative h-48 w-full bg-slate-800">
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
            alt={file?.name || '미리보기'}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        )}

        {typeof onRemove === 'function' && (
          <button
            type="button"
            aria-label="선택한 파일 제거"
            onClick={onRemove}
            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-600 bg-slate-800/70 shadow-sm backdrop-blur transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-200" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        )}
      </div>

      <div className="px-4 py-3">
        <p className="truncate text-sm font-medium">{file?.name}</p>

        <div className="mt-3">
          <p className="text-[11px] font-semibold text-slate-400">파일</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-200">
            <span className="rounded-md border border-slate-700 bg-slate-800/70 px-2 py-0.5">{file?.type || '형식 미상'}</span>
            <span className="rounded-md border border-slate-700 bg-slate-800/70 px-2 py-0.5">{formatBytes(file?.size)}</span>
          </div>
        </div>

        {!isVideo && (
          <div className="mt-3">
            <p className="text-[11px] font-semibold text-slate-400">이미지</p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-200">
              <span className="rounded-md border border-slate-700 bg-slate-800/70 px-2 py-0.5">{dims.w && dims.h ? `${dims.w}×${dims.h}px` : '해상도 -'}</span>
              <span className="rounded-md border border-slate-700 bg-slate-800/70 px-2 py-0.5">{mpStr(dims.w, dims.h)}</span>
              <span className="rounded-md border border-slate-700 bg-slate-800/70 px-2 py-0.5">{aspect(dims.w, dims.h)} 비율</span>
            </div>
          </div>
        )}

        {isVideo && (
          <div className="mt-3">
            <p className="text-[11px] font-semibold text-slate-400">동영상</p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-200">
              <span className="rounded-md border border-slate-700 bg-slate-800/70 px-2 py-0.5">{dims.w && dims.h ? `${dims.w}×${dims.h}px` : '해상도 -'}</span>
              <span className="rounded-md border border-slate-700 bg-slate-800/70 px-2 py-0.5">길이 {dur != null ? formatDuration(dur) : '-'}</span>
              <span className="rounded-md border border-slate-700 bg-slate-800/70 px-2 py-0.5">{aspect(dims.w, dims.h)} 비율</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

