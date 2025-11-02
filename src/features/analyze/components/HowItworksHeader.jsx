import React from "react";

/**
 * HowItWorksHeader
 * - 섹션 상단의 제목/리드 문구 + 신뢰도 툴팁 + 도움 링크
 */
export default function HowItWorksHeader({ theme = 'light' }) {
    const isDark = theme === 'dark';
    const headingClass = isDark ? 'text-slate-100' : 'text-slate-600';
    const bodyText = isDark ? 'text-slate-300' : 'text-slate-600';
    const highlightText = isDark ? 'text-slate-100' : 'text-slate-800';
    const tooltipBg = isDark
        ? 'border border-slate-600 bg-slate-900 text-slate-200 shadow-lg shadow-slate-900/40'
        : 'border border-slate-200 bg-white text-slate-600 shadow-md';
    const tooltipTrigger = isDark
        ? 'font-semibold text-slate-200 border-b border-dashed border-indigo-400 hover:border-indigo-500'
        : 'font-semibold text-slate-800 border-b border-dashed border-indigo-400 hover:border-indigo-600';
    const linkClass = isDark ? 'text-indigo-300 hover:text-indigo-200' : 'text-indigo-600 hover:text-indigo-700';

    return (
        <header className="text-left">
            <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${headingClass}`}>
                조작된 이미지 · 동영상, 이렇게 확인할게요
            </h2>
            <p className={`mt-2 text-sm sm:text-base ${bodyText}`}>
                얼굴이 포함된 미디어를 업로드하면, 서버가 영상을 한 장면씩 살펴보고 조작 여부에 대한&nbsp;
                <span className="relative inline-block group align-baseline">
                  <button
                      type="button"
                      className={`${tooltipTrigger} cursor-help outline-none`}
                      aria-describedby="reliability-tip"
                  >
                     신뢰도
                  </button>
                  <span
                      id="reliability-tip"
                      role="tooltip"
                      className={`pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-md p-2 text-[11px] leading-5 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100 ${tooltipBg}`}
                  >
                    신뢰도는 조작 가능성을 수치로 표현한 값으로, 높을수록 원본일 가능성이 큽니다.
  </span>
</span>

                를 계산할게요.<br/>
                결과는 보통 <span className={`font-semibold ${highlightText}`}>수십 초</span> 내 제공되며,
                필요하면 <span className={`font-semibold ${highlightText}`}>이메일</span>이나 <span
                className={`font-semibold ${highlightText}`}>대시보드</span>로 확인할 수 있어요.
                진행 중 문제가 발생하거나 도움이 필요하다면 {" "}
                <a
                    href="/support"
                    className={`${linkClass} font-medium`}
                >
                    여기
                </a>를 클릭하세요.
            </p>
        </header>
    );
}
