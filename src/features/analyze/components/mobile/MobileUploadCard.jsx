import React, { useId } from 'react';
import { UploadCloud } from 'lucide-react';

/**
 * MobileUploadCard
 * - Premium, mobile-first upload entry card
 * - Two CTAs: pick from library, capture via camera
 * - Emits selected files to parent via onSelect(FileList)
 */
export default function MobileUploadCard({ onSelect, className = '' }) {
  const pickId = useId();
  const cameraId = useId();

  const handleFiles = (fl) => {
    if (!fl || !fl.length) return;
    if (typeof onSelect === 'function') onSelect(fl);
  };

  return (
    <div className={`rounded-3xl border border-indigo-500/25 bg-gradient-to-br from-indigo-600/20 via-slate-900/70 to-slate-900/60 p-5 shadow-[0_22px_50px_-30px_rgba(99,102,241,0.6)] ${className}`}>
      <div className="flex items-start gap-4">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-200">
          <UploadCloud size={20} />
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-100">파일을 선택해 시작해요</h3>
          <p className="mt-1 text-xs text-slate-400">JPG/PNG/WebP · MP4/MOV · 평균 30초</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3">
        <label
          htmlFor={pickId}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-indigo-400/60 hover:bg-indigo-500/10 cursor-pointer"
        >
          <UploadCloud size={16} /> 앨범에서 선택
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-300">
        <span className="rounded-md border border-slate-700 bg-slate-800/70 px-2 py-0.5">이미지 3장</span>
        <span className="rounded-md border border-slate-700 bg-slate-800/70 px-2 py-0.5">동영상 2개</span>
        <span className="rounded-md border border-slate-700 bg-slate-800/70 px-2 py-0.5">이미지 5MB</span>
        <span className="rounded-md border border-slate-700 bg-slate-800/70 px-2 py-0.5">동영상 50MB</span>
      </div>

      {/* Hidden inputs */}
      <input
        id={pickId}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
      {/* camera capture removed for now */}
    </div>
  );
}
