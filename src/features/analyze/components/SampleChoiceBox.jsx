import { useEffect, useRef, useState } from "react";

export default function SampleChoiceBox({ onPick, picking, theme = 'light' }) {
    const [showSamples, setShowSamples] = useState(false);  // '사용할게요' 클릭 전/후
    const [phase, setPhase] = useState("idle");             // idle | options | loading | done
    const timerRef = useRef(null);
    const isDark = theme === 'dark';

    const containerClass = isDark
        ? 'mt-8 flex flex-col gap-4 rounded-xl border border-slate-700 bg-slate-900/70 p-4 sm:flex-row sm:items-center sm:justify-between'
        : 'mt-8 flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between';
    const descriptionClass = isDark ? 'm-0 min-w-0 text-center text-sm text-slate-300 sm:flex-1 sm:text-left' : 'm-0 min-w-0 text-center text-sm text-slate-600 sm:flex-1 sm:text-left';
    const highlightText = isDark ? 'font-medium text-slate-100' : 'font-medium text-slate-800';
    const primaryButton = isDark
        ? 'inline-flex w-[104px] items-center justify-center whitespace-nowrap rounded-md border border-indigo-300/50 bg-indigo-500/15 px-2.5 py-1 text-[11px] font-medium text-indigo-100 hover:border-indigo-300 hover:bg-indigo-500/25'
        : 'inline-flex w-[104px] items-center justify-center whitespace-nowrap rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-700 hover:bg-indigo-100';
    const sampleButton = isDark
        ? 'inline-flex w-[104px] items-center justify-center whitespace-nowrap rounded-md border border-slate-600 bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:bg-slate-800 disabled:opacity-60'
        : 'inline-flex w-[104px] items-center justify-center whitespace-nowrap rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60';
    const loadingBadge = isDark
        ? 'inline-flex max-w-[60vw] sm:max-w-[260px] items-center gap-2 truncate rounded-full border border-slate-600 bg-slate-900/90 px-3 py-1 text-[11px] font-medium text-slate-200 shadow-sm backdrop-blur whitespace-nowrap'
        : 'inline-flex max-w-[60vw] sm:max-w-[260px] items-center gap-2 truncate rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[11px] font-medium text-slate-700 shadow-sm backdrop-blur whitespace-nowrap';
    const doneBadge = isDark
        ? 'inline-flex max-w-[60vw] sm:max-w-[260px] items-center gap-2 truncate rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3 py-1 text-[11px] font-medium text-emerald-200 shadow-sm whitespace-nowrap'
        : 'inline-flex max-w-[60vw] sm:max-w-[260px] items-center gap-2 truncate rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700 shadow-sm whitespace-nowrap';

    // '사용할게요' 누르면 샘플 버튼 노출
    useEffect(() => {
        if (showSamples && phase === "idle") setPhase("options");
    }, [showSamples, phase]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    async function handlePick(kind) {
        // 샘플 선택 → 옵션 버튼 페이드아웃 후 '업로드 중' 배지
        setPhase("loading");
        try {
            if (onPick) await onPick(kind); // 부모에서 자동 주입 시도
        } finally {
            if (timerRef.current) clearTimeout(timerRef.current);
            // 1.6초 뒤 '확인해주세요'로 전환 (원하면 2000ms 등으로 늘리세요)
            timerRef.current = setTimeout(() => setPhase("done"), 1600);
        }
    }

    return (
        <div className={containerClass}>
            {/* 왼쪽 문구 */}
            <p className={descriptionClass}>
                파일이 없어도 괜찮아요. 준비된{" "}
                <span className={highlightText}>샘플 파일</span>로
                바로 테스트할 수 있어요.
            </p>

            {/* 오른쪽 컨테이너: 고정 폭 + 오버플로우 표시 */}
            <div className="relative min-h-[28px] mt-1 flex w-full flex-shrink-0 overflow-visible sm:mt-0 sm:w-[260px]">
                {/* 1) 초기: '사용할게요' 버튼 (오른쪽 끝 정렬) */}
                <div
                    className={`absolute inset-0 z-10 flex items-center justify-center gap-2 transition-opacity duration-700 ease-in-out sm:justify-end ${
                        showSamples || phase !== "idle" ? "pointer-events-none opacity-0" : "opacity-100"
                    }`}
                >
                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setShowSamples(true)}
                        className={primaryButton}
                    >
                        사용할게요
                    </button>
                </div>

                {/* 2) 샘플 선택 버튼 (이미지/비디오) */}
                <div
                    className={`absolute inset-0 z-10 flex flex-nowrap items-center justify-center gap-2 transition-opacity duration-700 ease-in-out sm:justify-end ${
                        phase === "options" ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
                >
                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handlePick("image")}
                        disabled={picking === "image"}
                        className={sampleButton}
                    >
                        {picking === "image" ? "불러오는 중…" : "이미지 샘플"}
                    </button>
                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handlePick("video")}
                        disabled={picking === "video"}
                        className={sampleButton}
                    >
                        {picking === "video" ? "불러오는 중…" : "비디오 샘플"}
                    </button>
                </div>

                {/* 3) 상태 배지: 업로드 중 (옵션이 사라진 뒤 약간 늦게 등장하도록 delay) */}
                <div
                    className={`absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-1000 ease-in-out sm:justify-end ${
                        phase === "loading" ? "opacity-100 delay-100" : "pointer-events-none opacity-0"
                    }`}
                >
          <span
              role="status"
              aria-live="polite"
              className={loadingBadge}
          >
            {/* 간단 스피너 */}
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 animate-spin" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path className="opacity-75" d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="2" />
            </svg>
            샘플 파일을 업로드 박스에 업로드 중이에요
          </span>
                </div>

                {/* 4) 상태 배지: 확인 요청 */}
                <div
                    className={`absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-1000 ease-in-out sm:justify-end ${
                        phase === "done" ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
                >
          <span
              aria-live="polite"
              className={doneBadge}
          >
            {/* 체크 아이콘 */}
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            업로드 박스를 확인해주세요
          </span>
                </div>
            </div>
        </div>
    );
}
