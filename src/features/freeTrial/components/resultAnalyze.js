import React, {useState} from "react";

const ResultAnalyze = ({analyzeResult }) => {
    const [open, setOpen] = useState(false);
    const title = [analyzeResult.used_model + " - version. 1.0.0_release"];
    let score = (analyzeResult.predicted_probability*100).toFixed(1);
    let duration = (analyzeResult.prediction_time).toFixed(1);

    const gauge = Math.max(0, Math.min(100, score)) * 0.75;
    const durationGauge = Math.max(0, Math.min(100, duration)) * 3.75;

    return (
        <div className="w-full ">
            <div>
                <div>
                    <button
                        type="button"
                        className="flex items-center justify-between w-full text-left text-slate-900 transition duration-150 ease-in-out"
                        onClick={() => setOpen((v) => !v)}
                        aria-expanded={open}
                        aria-controls="accordion-panel"
                    >
                        <p className="text-lg font-bold">This Picture is {analyzeResult.predicted_class}</p>
                        <svg className={`fill-indigo-500 shrink-0 ml-8 w-4 h-4 transition-transform duration-200 ease-out ${open ? "rotate-180" : ""}`} width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                            <rect y="7" width="16" height="2" rx="1" className={`transform origin-center transition duration-200 ease-out ${open ? "rotate-180" : ""}`}></rect>
                            <rect y="7" width="16" height="2" rx="1" className={`transform origin-center rotate-90 transition duration-200 ease-out ${open ? "rotate-180" : ""}`}></rect>
                        </svg>
                    </button>
                </div>
                <div
                    id="accordion-panel"
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-96 opacity-100 py-5" : "max-h-0 opacity-0 py-0"}`}
                    aria-hidden={!open}
                >
                    <div className="flex flex-row items-center gap-10 my-3">
                        {title.map((title, index) => (
                            <p className="flex items-center text-gray-700 font-semibold">
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-2 h-6 w-6 text-blue-500" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>

                                <span className="mx-2">{title}</span>
                            </p>
                        ))}
                    </div>

                    <div className="flex mx-auto items-center justify-center gap-10">
                        <div className="relative size-40 mt-7">
                            <svg className="rotate-[135deg] size-full" viewBox="0 0 36 36"
                                 xmlns="http://www.w3.org/2000/svg">
                                <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-green-200"
                                        strokeWidth="1" stroke-dasharray="75 100" strokeLinecap="round"></circle>
                                <circle
                                    cx="18"
                                    cy="18"
                                    r="16"
                                    fill="none"
                                    className="stroke-current text-green-500"
                                    strokeWidth="2"
                                    strokeDasharray={`${gauge} 100`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div
                                className="absolute top-1/2 start-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                <span className="text-4xl font-bold text-green-600">{score}</span>
                                <span className="text-green-600 block">Score</span>
                            </div>
                        </div>

                        <div className="relative size-40 mt-7">
                            <svg className="rotate-[135deg] size-full" viewBox="0 0 36 36"
                                 xmlns="http://www.w3.org/2000/svg">
                                <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-blue-200"
                                        strokeWidth="1" stroke-dasharray="75 100" strokeLinecap="round"></circle>
                                <circle
                                    cx="18"
                                    cy="18"
                                    r="16"
                                    fill="none"
                                    className="stroke-current text-blue-500"
                                    strokeWidth="2"
                                    strokeDasharray={`${durationGauge} 100`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div
                                className="absolute top-1/2 start-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                <span className="text-4xl font-bold text-blue-600">{duration}</span>
                                <span className="text-blue-600 block">Duration</span>
                            </div>
                        </div>
                    </div>
                    <p className="text-right p-2 mt-2 font-semibold">score : 인공지능이 진짜라고 생각한 점수 0~100 점 까지 있어요</p>
                    <p className="text-right p-2 font-semibold">duration : 예측하는데 수행된 시간을 의미해요</p>

                </div>
            </div>

        </div>
    );
};

export default ResultAnalyze;
