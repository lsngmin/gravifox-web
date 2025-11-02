import { ShieldCheck } from "lucide-react";
import React from "react";

export default function ToolTip({ theme = 'light' }) {
    const isDark = theme === 'dark';
    const containerClass = isDark
        ? "mt-6 flex items-center gap-3 rounded-2xl border border-emerald-400/35 bg-emerald-500/10 p-4 shadow-sm shadow-emerald-500/10"
        : "mt-6 flex items-center gap-3 rounded-2xl border border-emerald-150 bg-emerald-50 p-4";
    const iconClass = isDark ? "flex-shrink-0 text-emerald-300" : "flex-shrink-0 text-emerald-600";
    const textClass = isDark ? "text-sm text-slate-200" : "text-sm text-slate-700";
    const emphasis = isDark ? "font-medium text-emerald-100" : "font-medium";

    return (
        <div className={containerClass}>
            <div className={iconClass}>
                <ShieldCheck size={18} />
            </div>
            <p className={textClass}>
                업로드한 파일은 분석 과정에서만 사용되며, 처리 완료 후{" "}
                <span className={emphasis}>즉시 삭제</span>됩니다. 얼굴이 확인되지 않는
                미디어는 결과의 <span className={emphasis}>정확도가 낮을 수</span> 있습니다.
            </p>
        </div>
    )
}
