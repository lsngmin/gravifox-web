import {ShieldCheck} from "lucide-react";
import React from "react";

export default function ToolTip() {
    return (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-150 bg-emerald-50 p-4">
            <div className="flex-shrink-0 text-emerald-600">
                <ShieldCheck size={18} />
            </div>
            <p className="text-sm text-slate-700">
                업로드한 파일은 분석 과정에서만 사용되며, 처리 완료 후{" "}
                <span className="font-medium">즉시 삭제</span>됩니다. 얼굴이 확인되지 않는
                미디어는 결과의 <span className="font-medium">정확도가 낮을 수</span> 있습니다.
            </p>
        </div>
    )
}
