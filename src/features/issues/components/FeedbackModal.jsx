import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10MB

const FeedbackModal = ({
    open,
    onClose,
    theme = "light",
    heading = "제목",
    description,
    titleLabel = "제목",
    titlePlaceholder = "제목을 입력해 주세요",
    bodyLabel = "내용",
    bodyPlaceholder = "내용을 입력해 주세요",
    attachmentLabel = "첨부파일",
    attachmentHint,
    submitLabel = "제출",
    successMessage = "성공적으로 전송됐습니다.",
    onSubmit,
}) => {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [attachment, setAttachment] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fileInputRef = useRef(null);
    const initialFocusRef = useRef(null);
    const isDark = theme === "dark";

    const resetState = useCallback(() => {
        setTitle("");
        setBody("");
        setAttachment(null);
        setError("");
        setSuccess("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, []);

    const handleClose = useCallback(() => {
        if (submitting) return;
        resetState();
        onClose?.();
    }, [submitting, onClose, resetState]);

    useEffect(() => {
        if (!open) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKey = (event) => {
            if (event.key === "Escape") {
                handleClose();
            }
        };

        window.addEventListener("keydown", handleKey);
        const timer = setTimeout(() => {
            initialFocusRef.current?.focus();
        }, 60);

        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener("keydown", handleKey);
            clearTimeout(timer);
        };
    }, [open, handleClose]);

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            setAttachment(null);
            return;
        }

        if (file.size > MAX_ATTACHMENT_SIZE) {
            setError("첨부파일 용량은 10MB 이하만 업로드할 수 있어요.");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        setError("");
        setAttachment(file);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (submitting || !onSubmit) return;

        if (!title.trim()) {
            setError(`${titleLabel}을(를) 입력해 주세요.`);
            return;
        }
        if (!body.trim()) {
            setError(`${bodyLabel}을(를) 입력해 주세요.`);
            return;
        }

        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("description", body.trim());
        if (attachment) {
            formData.append("attachment", attachment);
        }

        try {
            setSubmitting(true);
            setError("");
            await onSubmit(formData);
            setSuccess(successMessage);
            setTimeout(() => {
                handleClose();
            }, 1500);
        } catch (err) {
            let message = "전송 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
            if (err?.response?.data?.message) {
                message = err.response.data.message;
            }
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    const containerClasses = useMemo(
        () =>
            `fixed inset-0 z-[1200] flex items-center justify-center px-4 transition ${
                open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`,
        [open]
    );

    if (!open) return null;

    return (
        <div className={containerClasses}>
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px]" onClick={handleClose} />
            <div
                role="dialog"
                aria-modal="true"
                className={`relative w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl transition-all ${
                    isDark
                        ? "bg-slate-900/95 text-slate-100 ring-1 ring-slate-700/70"
                        : "bg-white text-slate-900 ring-1 ring-slate-200"
                }`}
                onClick={(event) => event.stopPropagation()}
            >
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-semibold">{heading}</h2>
                            {description && (
                                <p className={`mt-1 text-sm ${isDark ? "text-slate-300/80" : "text-slate-500"}`}>{description}</p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={handleClose}
                            aria-label="닫기"
                            className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition ${
                                isDark ? "text-slate-300 hover:bg-slate-800/70 hover:text-white" : "text-slate-500 hover:bg-slate-100"
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                                <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <label className="block">
                            <span className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>{titleLabel}</span>
                            <input
                                ref={initialFocusRef}
                                type="text"
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                placeholder={titlePlaceholder}
                                className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 ${
                                    isDark
                                        ? "border-slate-700 bg-slate-900/70 text-slate-100 focus:border-indigo-400 focus:ring-indigo-400/50"
                                        : "border-slate-200 bg-white focus:border-indigo-500 focus:ring-indigo-200"
                                }`}
                                disabled={submitting}
                            />
                        </label>

                        <label className="block">
                            <span className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>{bodyLabel}</span>
                            <textarea
                                value={body}
                                onChange={(event) => setBody(event.target.value)}
                                placeholder={bodyPlaceholder}
                                rows={5}
                                className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 resize-none ${
                                    isDark
                                        ? "border-slate-700 bg-slate-900/70 text-slate-100 focus:border-indigo-400 focus:ring-indigo-400/50"
                                        : "border-slate-200 bg-white focus:border-indigo-500 focus:ring-indigo-200"
                                }`}
                                disabled={submitting}
                            />
                        </label>

                        <label className="block">
                            <span className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                                {attachmentLabel}
                            </span>
                            <div
                                className={`mt-1 flex flex-col gap-2 rounded-lg border border-dashed px-3 py-3 text-sm transition ${
                                    isDark
                                        ? "border-slate-700 bg-slate-900/60 text-slate-200"
                                        : "border-slate-300 bg-slate-50 text-slate-600"
                                }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    disabled={submitting}
                                />
                                {attachment ? (
                                    <div className={`flex items-center justify-between rounded-md px-3 py-2 ${isDark ? "bg-slate-800/80" : "bg-white"}`}>
                                        <span className="truncate text-xs">{attachment.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAttachment(null);
                                                if (fileInputRef.current) fileInputRef.current.value = "";
                                            }}
                                            className="text-xs text-rose-500 hover:text-rose-600"
                                        >
                                            제거
                                        </button>
                                    </div>
                                ) : (
                                    <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                        {attachmentHint || "PNG, JPG 등 10MB 이하 이미지를 첨부할 수 있어요."}
                                    </p>
                                )}
                            </div>
                        </label>
                    </div>

                    {(error || success) && (
                        <div
                            className={`rounded-lg px-3 py-2 text-sm ${
                                error
                                    ? isDark
                                        ? "bg-rose-500/15 text-rose-200"
                                        : "bg-rose-50 text-rose-600"
                                    : isDark
                                        ? "bg-emerald-500/15 text-emerald-200"
                                        : "bg-emerald-50 text-emerald-600"
                            }`}
                        >
                            {error || success}
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                                isDark ? "text-slate-300 hover:bg-slate-800/70" : "text-slate-600 hover:bg-slate-100"
                            }`}
                            disabled={submitting}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
                            disabled={submitting}
                        >
                            {submitting && (
                                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                </svg>
                            )}
                            {submitting ? "제출 중..." : submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FeedbackModal;
