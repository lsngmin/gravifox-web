import React from "react";

export default function Faq() {
    return (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium text-slate-900">자주하는 질문</p>
            <div className="mt-3 space-y-2 text-xs text-slate-600">
                <details className="group rounded-lg border border-slate-100 p-3 open:bg-slate-50">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                            <span className="flex items-center gap-2">
                              {/* 작은 점 아이콘 */}
                                <span className="h-2 w-2 flex-shrink-0 rounded-full bg-indigo-500 self-center"></span>
                              <span className="text-sm text-slate-700">분석이 너무 오래 걸려요</span>
                            </span>
                        {/* 화살표 아이콘 (SVG) */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180 self-center"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                        </svg>
                    </summary>
                    <div className="mt-2 pl-4 text-slate-500 text-sm">
                        분석 시간은 파일 용량과 해상도, 서버 상황에 따라 달라집니다. 잠시 기다리거나 나중에 이메일/대시보드에서 확인할 수 있어요.
                    </div>
                </details>

                <details className="group rounded-lg border border-slate-100 p-3 open:bg-slate-50">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 flex-shrink-0 rounded-full bg-indigo-500 self-center"></span>
                          <span className="text-sm text-slate-700">업로드가 되지 않아요</span>
                        </span>

                        {/* 화살표 아이콘 */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180 self-center"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </summary>
                    <div className="mt-2 pl-4 text-slate-500 text-sm">
                        지원되는 형식과 최대 용량(10MB)을 확인해 주세요. 문제가 계속되면 인터넷 연결을 점검한 뒤 다시 시도해 주세요.
                    </div>
                </details>

                <details className="group rounded-lg border border-slate-100 p-3 open:bg-slate-50">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 flex-shrink-0 rounded-full bg-indigo-500 self-center"></span>
                          <span className="text-sm text-slate-700">분석한 결과를 이메일로 받아보고 싶어요</span>
                        </span>

                        {/* 화살표 아이콘 */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180 self-center"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </summary>
                    <div className="mt-2 pl-4 text-slate-500 text-sm">
                        네. 로그인 후 분석하면 이메일로도 전송되며, 대시보드에서 언제든 다시 확인할 수 있어요.
                    </div>
                </details>

            </div>
        </div>
    )
}
