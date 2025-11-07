import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { EllipsisVerticalIcon, ArrowPathIcon, EnvelopeIcon, UserIcon, ClipboardIcon, CheckIcon } from "@heroicons/react/24/outline";

const AdminUserActions = ({
  user,
  onReset,
  isResetting = false,
  mailPath,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const email = user?.email || user?.userId || "";

  const handleCopy = async () => {
    try {
      if (!email) return;
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <div ref={rootRef} className={clsx("relative inline-flex", className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "inline-flex items-center rounded-full border px-2.5 py-1.5 text-xs font-medium text-slate-600 transition",
          "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50",
          "dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-slate-500"
        )}
      >
        <EllipsisVerticalIcon className="h-4 w-4" />
        <span className="sr-only">Actions</span>
      </button>

      {open && (
        <div
          role="menu"
          className={clsx(
            "absolute right-0 z-30 mt-1 w-56 overflow-hidden rounded-xl border bg-white shadow-lg",
            "border-slate-200 dark:border-slate-700 dark:bg-slate-900"
          )}
        >
          <div className="p-1">
            <button
              role="menuitem"
              onClick={() => { setOpen(false); onReset?.(user?.userNo); }}
              disabled={isResetting}
              className={clsx(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm",
                isResetting
                  ? "cursor-wait text-slate-400"
                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              )}
            >
              <ArrowPathIcon className="h-4 w-4" />
              <span>{isResetting ? "초기화 중…" : "할당량 초기화"}</span>
            </button>

            {mailPath ? (
              <a
                role="menuitem"
                href={mailPath}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={() => setOpen(false)}
              >
                <EnvelopeIcon className="h-4 w-4" />
                <span>메일 보내기</span>
              </a>
            ) : null}

            <button
              role="menuitem"
              onClick={handleCopy}
              disabled={!email}
              className={clsx(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm",
                email
                  ? "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  : "cursor-not-allowed text-slate-400"
              )}
            >
              {copied ? <CheckIcon className="h-4 w-4" /> : <ClipboardIcon className="h-4 w-4" />}
              <span>{copied ? "이메일 복사됨" : "이메일 복사"}</span>
            </button>

            <button
              role="menuitem"
              disabled
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-400"
            >
              <UserIcon className="h-4 w-4" />
              <span>사용자 상세 (준비 중)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserActions;

