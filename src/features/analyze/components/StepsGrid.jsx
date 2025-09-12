import {CheckCircle, Mail, ScanFace, Timer, Upload} from "lucide-react";
import React from "react";

export default function StepsGrid() {
    return (
        <>
        <ol className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <li className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Upload size={16}/>
            </span>
                    <span className="text-xs font-medium text-slate-500">STEP 1</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900">업로드</h3>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                    이미지나 비디오를 아래에 업로드 해주세요. 해상도가 높고, 얼굴이 잘 보일수록 결과 신뢰도가 높아요.
                </p>
                <ul className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-600">
                    <li className="rounded-full bg-slate-50 px-2 py-1">최대 10MB</li>
                    <li className="rounded-full bg-slate-50 px-2 py-1">권장 해상도 720p 이상</li>
                </ul>
            </li>

            <li className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <ScanFace size={16}/>
            </span>
                    <span className="text-xs font-medium text-slate-500">STEP 2</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900">분석</h3>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                    서버가 영상 속 얼굴을 찾아내고, 합성되었거나 수정된 흔적이 있는지 확인해 <span className="font-medium">신뢰도 점수</span>를 계산합니다.
                </p>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-600">
                    <Timer size={14}/> 10초 ~ 30초
                </div>
            </li>

            <li className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <CheckCircle size={16}/>
            </span>
                    <span className="text-xs font-medium text-slate-500">STEP 3</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900">결과</h3>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                    결과 화면에는 종합 점수와 신뢰도, 그리고 예시 장면이 함께 표시됩니다. 로그인하면 이메일이나 대시보드에서도 확인할 수 있어요.
                </p>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-600">
                    <Mail size={14}/> 이메일 결과 전송
                </div>
            </li>
        </ol>

    {/* Secondary facts row */}
    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* 지원 형식 */}
        <div
            className="rounded-xl border border-indigo-150 bg-indigo-50 p-4 shadow-sm transition hover:shadow-md">
            <p className="text-[11px] font-semibold text-indigo-700">지원 형식</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="rounded-md bg-white/60 px-2 py-1">JPG/JPEG</span>
                <span className="rounded-md bg-white/60 px-2 py-1">PNG</span>
                <span className="rounded-md bg-white/60 px-2 py-1">WebP</span>
                <span className="rounded-md bg-white/60 px-2 py-1">MP4</span>
                <span className="rounded-md bg-white/60 px-2 py-1">MOV</span>
                <span className="rounded-md bg-white/60 px-2 py-1">WebM</span>
            </div>
        </div>

        {/* 처리 시간 */}
        <div
            className="rounded-xl border border-indigo-150 bg-indigo-50 p-4 shadow-sm transition hover:shadow-md">
            <p className="text-[11px] font-semibold text-indigo-700">처리 시간</p>
            <p className="mt-1 text-xs text-slate-700">
                보통 1분 미만으로 처리가 완료되지만, 서버 혹은 네트워크 상황에 따라 더 걸릴 수 있어요.
            </p>
        </div>

        {/* 결과 전달 */}
        <div
            className="rounded-xl border border-indigo-150 bg-indigo-50 p-4 shadow-sm transition hover:shadow-md">
            <p className="text-[11px] font-semibold text-indigo-700">결과 전달</p>
            <p className="mt-1 text-xs text-slate-700">
                화면 즉시 표시 · 이메일/대시보드 결과 전송 선택 가능
            </p>
        </div>
    </div>
        </>
    )
}

