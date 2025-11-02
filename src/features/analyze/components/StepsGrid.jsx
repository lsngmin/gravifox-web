import { CheckCircle, Mail, ScanFace, Timer, Upload } from "lucide-react";
import React from "react";

export default function StepsGrid({ theme = 'light' }) {
    const isDark = theme === 'dark';
    const stepCard = isDark
        ? "group relative rounded-2xl border border-slate-700 bg-slate-900/70 p-5 shadow-sm transition hover:border-indigo-400/50 hover:shadow-lg hover:shadow-slate-900/40"
        : "group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md";
    const iconWrap = isDark
        ? "inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-200"
        : "inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600";
    const stepLabel = isDark
        ? "text-xs font-medium text-slate-400"
        : "text-xs font-medium text-slate-500";
    const stepHeading = isDark
        ? "text-sm font-semibold text-slate-100"
        : "text-sm font-semibold text-slate-900";
    const stepBody = isDark
        ? "mt-1 text-xs leading-5 text-slate-300"
        : "mt-1 text-xs leading-5 text-slate-600";
    const chipList = isDark
        ? "mt-3 flex flex-wrap gap-2 text-[11px] text-slate-200"
        : "mt-3 flex flex-wrap gap-2 text-[11px] text-slate-600";
    const chip = isDark
        ? "rounded-full border border-slate-700 bg-slate-800/70 px-2 py-1"
        : "rounded-full bg-slate-50 px-2 py-1";
    const factCard = isDark
        ? "rounded-xl border border-indigo-400/25 bg-indigo-500/10 p-4 shadow-sm transition hover:border-indigo-300/35 hover:shadow-lg hover:shadow-slate-900/50"
        : "rounded-xl border border-indigo-150 bg-indigo-50 p-4 shadow-sm transition hover:shadow-md";
    const factTitle = isDark ? "text-[11px] font-semibold text-indigo-200" : "text-[11px] font-semibold text-indigo-700";
    const factBody = isDark ? "mt-1 text-xs text-slate-200" : "mt-1 text-xs text-slate-700";
    const factChip = isDark
        ? "rounded-md border border-white/10 bg-white/10 px-2 py-1 text-indigo-100"
        : "rounded-md bg-white/60 px-2 py-1";
    const factChipWrap = isDark ? "mt-2 flex flex-wrap gap-2 text-xs text-indigo-100" : "mt-2 flex flex-wrap gap-2 text-xs";
    const indicator = isDark ? "text-slate-300" : "text-slate-600";

    return (
        <>
        <ol className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <li className={stepCard}>
                <div className="mb-3 flex items-center gap-2">
            <span className={iconWrap}>
              <Upload size={16}/>
            </span>
                    <span className={stepLabel}>STEP 1</span>
                </div>
                <h3 className={stepHeading}>업로드</h3>
                <p className={stepBody}>
                    이미지나 비디오를 아래에 업로드 해주세요. 해상도가 높고, 얼굴이 잘 보일수록 결과 신뢰도가 높아요.
                </p>
                <ul className={chipList}>
                    <li className={chip}>최대 10MB</li>
                    <li className={chip}>권장 해상도 720p 이상</li>
                </ul>
            </li>

            <li className={stepCard}>
                <div className="mb-3 flex items-center gap-2">
            <span className={iconWrap}>
              <ScanFace size={16}/>
            </span>
                    <span className={stepLabel}>STEP 2</span>
                </div>
                <h3 className={stepHeading}>분석</h3>
                <p className={stepBody}>
                    서버가 영상 속 얼굴을 찾아내고, 합성되었거나 수정된 흔적이 있는지 확인해 <span className="font-medium">신뢰도 점수</span>를 계산합니다.
                </p>
                <div className={`mt-3 flex items-center gap-2 text-[11px] ${indicator}`}>
                    <Timer size={14}/> 10초 ~ 30초
                </div>
            </li>

            <li className={stepCard}>
                <div className="mb-3 flex items-center gap-2">
            <span className={iconWrap}>
              <CheckCircle size={16}/>
            </span>
                    <span className={stepLabel}>STEP 3</span>
                </div>
                <h3 className={stepHeading}>결과</h3>
                <p className={stepBody}>
                    결과 화면에는 종합 점수와 신뢰도, 그리고 예시 장면이 함께 표시됩니다. 로그인하면 이메일이나 대시보드에서도 확인할 수 있어요.
                </p>
                <div className={`mt-3 flex items-center gap-2 text-[11px] ${indicator}`}>
                    <Mail size={14}/> 이메일 결과 전송
                </div>
            </li>
        </ol>

    {/* Secondary facts row */}
    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* 지원 형식 */}
        <div
            className={factCard}>
            <p className={factTitle}>지원 형식</p>
            <div className={factChipWrap}>
                <span className={factChip}>JPG/JPEG</span>
                <span className={factChip}>PNG</span>
                <span className={factChip}>WebP</span>
                <span className={factChip}>MP4</span>
                <span className={factChip}>MOV</span>
                <span className={factChip}>WebM</span>
            </div>
        </div>

        {/* 처리 시간 */}
        <div
            className={factCard}>
            <p className={factTitle}>처리 시간</p>
            <p className={factBody}>
                보통 1분 미만으로 처리가 완료되지만, 서버 혹은 네트워크 상황에 따라 더 걸릴 수 있어요.
            </p>
        </div>

        {/* 결과 전달 */}
        <div
            className={factCard}>
            <p className={factTitle}>결과 전달</p>
            <p className={factBody}>
                화면 즉시 표시 · 이메일/대시보드 결과 전송 선택 가능
            </p>
        </div>
    </div>
        </>
    )
}
