import React, {useState} from "react";

const ResultAnalyze = ({analyzeResult }) => {
    const [open, setOpen] = useState(false);
    const title = [analyzeResult.used_model + " - version. 1.0.0_release"];
    let score = (analyzeResult.predicted_probability*100).toFixed(1);
    let duration = (analyzeResult.prediction_time).toFixed(1);

    const gauge = Math.max(0, Math.min(100, score)) * 0.75;
    const durationGauge = Math.max(0, Math.min(100, duration)) * 3.75;

    return (
        <div className="relative w-full">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 text-slate-100 shadow-[0_25px_60px_-35px_rgba(15,23,42,0.9)]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.25),_transparent_55%)]"/>
                <div className="pointer-events-none absolute -inset-px rounded-3xl border border-white/5 mix-blend-overlay"/>
                <div className="relative">
                    <button
                        type="button"
                        className={`flex w-full items-center justify-between gap-6 rounded-3xl px-6 py-5 text-left transition-all duration-300 ease-out hover:bg-white/5 ${open ? "bg-white/10" : ""}`}
                        onClick={() => setOpen((v) => !v)}
                        aria-expanded={open}
                        aria-controls="accordion-panel"
                    >
                        <div className="flex flex-col gap-3">
                            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-indigo-200">
                                <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]"/>
                                분석 완료
                            </span>
                            <p className="text-xl font-semibold text-white">
                                이 이미지는 <span className="bg-gradient-to-r from-indigo-300 via-sky-300 to-emerald-300 bg-clip-text text-transparent">{analyzeResult.predicted_class}</span>로 분류됐어요
                            </p>
                            <div className="h-0.5 w-16 rounded-full bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400"/>
                        </div>
                        <svg
                            className={`h-10 w-10 rounded-full border border-white/10 bg-white/5 p-3 text-indigo-200 transition-transform duration-300 ease-out ${open ? "rotate-180" : ""}`}
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M12 7L17 12L12 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M7 12H17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
                <div
                    id="accordion-panel"
                    className={`relative overflow-hidden px-6 transition-all duration-500 ease-in-out ${open ? "max-h-[820px] py-8 opacity-100" : "max-h-0 py-0 opacity-0"}`}
                    aria-hidden={!open}
                >
                    <div className="relative mb-6 flex flex-wrap items-center gap-4">
                        {title.map((item, index) => (
                            <div key={`${item}-${index}`} className="group flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 backdrop-blur">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 text-emerald-300 transition-transform duration-300 group-hover:scale-110"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur">
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-400/15 via-transparent to-transparent"/>
                            <div className="relative flex flex-col items-center gap-4 text-center">
                                <div className="relative size-40">
                                    <svg className="size-full -rotate-45" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-emerald-900/30" strokeWidth="1.5" strokeDasharray="75 100" strokeLinecap="round"/>
                                        <circle
                                            cx="18"
                                            cy="18"
                                            r="16"
                                            fill="none"
                                            className="stroke-current text-emerald-300"
                                            strokeWidth="2.8"
                                            strokeDasharray={`${gauge} 100`}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-4xl font-bold text-white">{score}</span>
                                        <span className="text-sm uppercase tracking-[0.3em] text-emerald-200">Score</span>
                                    </div>
                                </div>
                                <p className="text-sm leading-relaxed text-slate-200/80">AI가 이미지를 진짜라고 판단한 확률이에요. 수치가 높을수록 신뢰도가 높아요.</p>
                            </div>
                        </div>

                        <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur">
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-400/15 via-transparent to-transparent"/>
                            <div className="relative flex flex-col items-center gap-4 text-center">
                                <div className="relative size-40">
                                    <svg className="size-full -rotate-45" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-sky-900/30" strokeWidth="1.5" strokeDasharray="75 100" strokeLinecap="round"/>
                                        <circle
                                            cx="18"
                                            cy="18"
                                            r="16"
                                            fill="none"
                                            className="stroke-current text-sky-300"
                                            strokeWidth="2.8"
                                            strokeDasharray={`${durationGauge} 100`}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-4xl font-bold text-white">{duration}</span>
                                        <span className="text-sm uppercase tracking-[0.3em] text-sky-200">Duration</span>
                                    </div>
                                </div>
                                <p className="text-sm leading-relaxed text-slate-200/80">예측을 완료하는 데 걸린 시간이예요. 짧을수록 처리 속도가 빠르다는 뜻이에요.</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-2 text-right text-xs font-medium text-slate-300/90">
                        <p>Score · 0~100 범위에서 AI가 진짜라고 판단한 확률이에요.</p>
                        <p>Duration · 예측을 완료하기까지 소요된 시간이에요.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultAnalyze;
