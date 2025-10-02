import React, { useEffect } from "react";

/**
 * ErrorModal
 * - 페이지 중앙에 뜨는 오류 다이얼로그(배경 Dim 처리)
 * - 닫기 버튼, 외부 클릭, ESC 키로 닫기 지원
 *
 * Props
 * - open: boolean - 표시 여부
 * - title?: string - 타이틀(기본: "업로드 오류")
 * - messages?: string | string[] - 오류 메시지(1개 또는 배열)
 * - onClose?: () => void - 닫기 핸들러
 * - closeLabel?: string - 닫기 버튼 라벨(기본: "닫기")
 * - persistent?: boolean - 배경 클릭으로 닫기 비활성화(기본: false)
 */
export default function ErrorModal({
  open,
  title = "업로드 오류",
  messages,
  onClose = () => {},
  closeLabel = "닫기",
  persistent = false,
  lockScroll = true,
}) {
  const list = Array.isArray(messages)
    ? messages
    : messages
    ? [messages]
    : [];

  // ESC 키로 닫기 + 스크롤 잠금(열렸을 때만)
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    const prevOverflow = document.body.style.overflow;
    if (lockScroll) document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      if (lockScroll) document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, lockScroll]);

  // 안전한 키프레임 주입(열릴 때 1회)
  useEffect(() => {
    if (!open) return;
    if (typeof document === "undefined") return;
    if (document.getElementById("error-modal-anims")) return;
    const styleEl = document.createElement("style");
    styleEl.id = "error-modal-anims";
    styleEl.innerHTML = `
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
@keyframes popIn { from { opacity: 0; transform: scale(0.95) translateY(8px) } to { opacity: 1; transform: scale(1) translateY(0) } }
`;
    document.head.appendChild(styleEl);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop with fade-in */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px]"
        style={{ animation: "fadeIn 180ms ease-out forwards" }}
        onClick={!persistent ? onClose : undefined}
      />

      {/* Dialog container */}
      <div className="absolute inset-0 grid place-items-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="error-modal-title"
          className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200"
          style={{ animation: "popIn 180ms cubic-bezier(0.2,0.8,0.2,1) forwards" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close (X) button top-right */}
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Icon center */}
          <div className="flex flex-col items-center px-6 pt-10 pb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-9 w-9 text-red-600">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-4a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 6zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 id="error-modal-title" className="sr-only">오류</h2>
            <div className="mt-4 w-full px-2 text-center">
              {list.length > 0 ? (
                <ul className="space-y-2 text-sm text-slate-700">
                  {list.map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-700">알 수 없는 오류가 발생했습니다.</p>
              )}
            </div>
            <div className="mt-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
