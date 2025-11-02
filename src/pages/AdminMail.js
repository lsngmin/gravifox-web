import React, { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { useParams } from "react-router-dom";
import {
    EnvelopeOpenIcon,
    PaperAirplaneIcon,
    UserGroupIcon,
    EyeIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { previewAdminEmail, sendAdminEmail } from "../api/admin";

const audienceOptions = [
    {
        value: "all",
        label: "전체 사용자",
        description: "활성 계정 전체에 운영 공지나 긴급 알림을 발송합니다.",
    },
    {
        value: "paying",
        label: "유료 구독자",
        description: "Starter, Pro, Enterprise 등 유료 플랜 이용자 대상.",
    },
    {
        value: "trial",
        label: "체험 계정",
        description: "Free Trial 사용 중이거나 곧 만료 예정인 사용자에게 안내합니다.",
    },
    {
        value: "custom",
        label: "직접 지정",
        description: "특정 이메일 주소 목록으로 커뮤니케이션합니다.",
    },
];

const normalizeEmails = (raw) =>
    raw
        .split(/[\s,;]+/)
        .map((item) => item.trim())
        .filter(Boolean);

const AdminMail = () => {
    const { lng = "ko" } = useParams();
    const [audience, setAudience] = useState("all");
    const [customRecipients, setCustomRecipients] = useState("");
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [sendCopyToSelf, setSendCopyToSelf] = useState(true);
    const [testAddress, setTestAddress] = useState("");

    const [feedback, setFeedback] = useState(null);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverPreview, setServerPreview] = useState(null);

    useEffect(() => {
        // 입력이 바뀌면 서버 미리보기는 무효화
        setServerPreview(null);
    }, [audience, customRecipients, subject, content]);

    const parsedCustomRecipients = useMemo(() => {
        if (audience !== "custom") {
            return [];
        }
        return normalizeEmails(customRecipients);
    }, [audience, customRecipients]);

    const localPreview = useMemo(() => {
        return {
            subject: subject?.trim() || "제목이 아직 없습니다",
            body: content || "",
            recipients: parsedCustomRecipients,
            audience,
            stamp: new Date(),
        };
    }, [audience, content, parsedCustomRecipients, subject]);

    const activePreview = serverPreview ?? localPreview;

    const handlePreview = async () => {
        const payload = {
            locale: lng,
            audience,
            subject,
            body: content,
            customRecipients: parsedCustomRecipients,
            sendCopyToSelf,
            testAddress: testAddress?.trim() || null,
            dryRun: true,
        };

        setFeedback(null);
        setIsPreviewing(true);
        try {
            const data = await previewAdminEmail(payload);
            setServerPreview({
                subject: data?.subject ?? payload.subject ?? "",
                body: data?.body ?? payload.body ?? "",
                html: data?.html ?? data?.renderedBody ?? null,
                audience: data?.audience ?? payload.audience,
                recipients:
                    data?.recipients ??
                    data?.resolvedRecipients ??
                    payload.customRecipients,
                stamp: new Date(),
            });
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "서버 미리보기에 실패했습니다. 로컬 미리보기로 대체합니다.";
            setFeedback({ type: "warning", message });
            setServerPreview(null);
        } finally {
            setIsPreviewing(false);
        }
    };

    const validateBeforeSubmit = () => {
        if (!subject.trim()) {
            return "메일 제목을 입력해 주세요.";
        }
        if (!content.trim()) {
            return "본문 내용을 작성해 주세요.";
        }
        if (audience === "custom" && parsedCustomRecipients.length === 0) {
            return "전송할 이메일 주소를 최소 1개 이상 입력해 주세요.";
        }
        if (testAddress && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(testAddress.trim())) {
            return "테스트 메일 주소 형식이 올바르지 않습니다.";
        }
        return null;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const validation = validateBeforeSubmit();
        if (validation) {
            setFeedback({ type: "error", message: validation });
            return;
        }

        const payload = {
            locale: lng,
            audience,
            subject: subject.trim(),
            body: content,
            customRecipients: parsedCustomRecipients,
            sendCopyToSelf,
            testAddress: testAddress?.trim() || null,
        };

        setFeedback(null);
        setIsSubmitting(true);
        try {
            await sendAdminEmail(payload);
            setFeedback({
                type: "success",
                message: "발송 요청을 접수했습니다. 전송 로그에서 상태를 확인해 주세요.",
            });
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "발송 요청에 실패했습니다. 잠시 후 다시 시도하거나 로그를 확인해 주세요.";
            setFeedback({ type: "error", message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12 md:px-10 md:py-16">
                <header className="flex flex-col gap-4">
                    <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-slate-500">
                        <UserGroupIcon className="h-4 w-4" aria-hidden="true" />
                        <span>Admin</span>
                        <span className="opacity-60">Communication</span>
                    </div>
                    <h1 className="text-3xl font-semibold md:text-4xl">
                        사용자 메일 발송 도구
                    </h1>
                    <p className="max-w-3xl text-sm leading-6 text-slate-400 md:text-base">
                        공지, 온보딩 가이드, 긴급 알림 등을 바로 전송할 수 있는 운영 전용
                        메일 작성 페이지입니다. 대상 그룹을 선택하고 내용을 작성한 뒤 미리보기와
                        테스트 발송을 거쳐 메일을 전송하세요.
                    </p>
                </header>

                {feedback && (
                    <div
                        className={clsx(
                            "flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm md:text-base",
                            feedback.type === "success" &&
                                "border-emerald-500/40 bg-emerald-500/10 text-emerald-100",
                            feedback.type === "error" &&
                                "border-rose-500/50 bg-rose-500/10 text-rose-100",
                            feedback.type === "warning" &&
                                "border-amber-400/40 bg-amber-500/10 text-amber-100"
                        )}
                    >
                        {feedback.type === "success" ? (
                            <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0" />
                        ) : (
                            <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 flex-shrink-0" />
                        )}
                        <p>{feedback.message}</p>
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,360px)]">
                    <form
                        className="flex flex-col gap-6 rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 shadow-[0_24px_65px_-30px_rgba(15,23,42,0.8)]"
                        onSubmit={handleSubmit}
                    >
                        <fieldset className="flex flex-col gap-3">
                            <legend className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                                대상 그룹
                            </legend>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {audienceOptions.map((option) => (
                                    <label
                                        key={option.value}
                                        className={clsx(
                                            "flex cursor-pointer flex-col gap-2 rounded-2xl border px-4 py-3 transition",
                                            audience === option.value
                                                ? "border-sky-500/60 bg-sky-500/10 shadow-inner shadow-sky-900/40"
                                                : "border-slate-800 bg-slate-950/60 hover:border-slate-600 hover:bg-slate-900/80"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="audience"
                                                value={option.value}
                                                checked={audience === option.value}
                                                onChange={(event) => setAudience(event.target.value)}
                                                className="h-4 w-4 accent-sky-500"
                                            />
                                            <span className="text-sm font-medium text-slate-50">
                                                {option.label}
                                            </span>
                                        </div>
                                        <p className="pl-6 text-xs leading-5 text-slate-400">
                                            {option.description}
                                        </p>
                                    </label>
                                ))}
                            </div>
                        </fieldset>

                        {audience === "custom" && (
                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="customRecipients"
                                    className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500"
                                >
                                    수신자 목록
                                </label>
                                <textarea
                                    id="customRecipients"
                                    rows={3}
                                    placeholder="예) user1@example.com, user2@example.com"
                                    value={customRecipients}
                                    onChange={(event) => setCustomRecipients(event.target.value)}
                                    className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 shadow-inner shadow-slate-900/60 focus:border-sky-500 focus:outline-none"
                                />
                                <p className="text-xs text-slate-500">
                                    쉼표, 줄바꿈, 세미콜론으로 구분할 수 있습니다.
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="subject"
                                className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500"
                            >
                                제목
                            </label>
                            <input
                                id="subject"
                                type="text"
                                value={subject}
                                onChange={(event) => setSubject(event.target.value)}
                                placeholder="예) [공지] 4월 신규 기능 업데이트 안내"
                                className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 shadow-inner shadow-slate-900/60 focus:border-sky-500 focus:outline-none"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="content"
                                className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500"
                            >
                                본문 내용
                            </label>
                            <textarea
                                id="content"
                                rows={12}
                                value={content}
                                onChange={(event) => setContent(event.target.value)}
                                placeholder={"안녕하세요,\nGraviFox 운영팀입니다.\n\n오늘은 ..."}
                                className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 shadow-inner shadow-slate-900/60 focus:border-sky-500 focus:outline-none"
                            />
                            <p className="text-xs text-slate-500">
                                Markdown 혹은 단순 텍스트 기반 초안입니다. 서버 미리보기에서
                                최종 렌더링 결과를 확인하세요.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                                    테스트 메일
                                </span>
                                <input
                                    type="email"
                                    value={testAddress}
                                    onChange={(event) => setTestAddress(event.target.value)}
                                    placeholder="my-email@gravifox.ai"
                                    className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 shadow-inner shadow-slate-900/60 focus:border-sky-500 focus:outline-none"
                                />
                                <span className="text-xs text-slate-500">
                                    입력 시 본 발송 전에 테스트 메일을 추가로 전송합니다.
                                </span>
                            </label>
                            <label className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-200">
                                <input
                                    type="checkbox"
                                    checked={sendCopyToSelf}
                                    onChange={(event) => setSendCopyToSelf(event.target.checked)}
                                    className="h-4 w-4 accent-sky-500"
                                />
                                <span>운영자(내 계정)에게 참조 메일을 함께 보내기</span>
                            </label>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={handlePreview}
                                disabled={isPreviewing}
                                className={clsx(
                                    "inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-medium transition",
                                    "border-sky-500/50 bg-sky-500/10 text-sky-100 hover:border-sky-300 hover:bg-sky-500/20",
                                    isPreviewing && "cursor-wait opacity-70"
                                )}
                            >
                                <EyeIcon className="h-4 w-4" />
                                {isPreviewing ? "미리보기 준비 중..." : "서버 미리보기"}
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={clsx(
                                    "inline-flex items-center gap-2 rounded-full border border-emerald-500/60 bg-emerald-500/20 px-5 py-2 text-sm font-medium text-emerald-100 transition hover:border-emerald-400 hover:bg-emerald-500/30",
                                    isSubmitting && "cursor-wait opacity-70"
                                )}
                            >
                                <PaperAirplaneIcon className="h-4 w-4 rotate-6" />
                                {isSubmitting ? "발송 중..." : "발송 요청"}
                            </button>
                        </div>
                    </form>

                    <aside className="flex flex-col gap-5 rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6">
                        <div className="flex items-center gap-3">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-cyan-400 to-emerald-400 text-white shadow-lg shadow-sky-900/40">
                                <EnvelopeOpenIcon className="h-6 w-6" aria-hidden="true" />
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                                    미리보기
                                </p>
                                <p className="text-lg font-semibold text-slate-100">
                                    실시간 렌더링
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-200 shadow-inner shadow-slate-900/60">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs uppercase tracking-[0.3em] text-slate-600">
                                    Subject
                                </span>
                                <p className="text-base font-medium text-slate-50">
                                    {activePreview.subject}
                                </p>
                            </div>
                            <hr className="my-4 border-slate-800" />
                            {activePreview.html ? (
                                <div
                                    className="prose prose-invert max-w-none text-sm leading-6 text-slate-200"
                                    dangerouslySetInnerHTML={{ __html: activePreview.html }}
                                />
                            ) : (
                                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-200">
                                    {activePreview.body}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-xs text-slate-400">
                            <div className="flex items-center justify-between text-slate-300">
                                <span>대상 그룹</span>
                                <span className="text-slate-100">
                                    {
                                        audienceOptions.find(
                                            (item) => item.value === activePreview.audience
                                        )?.label
                                    }
                                </span>
                            </div>
                            {activePreview.recipients?.length ? (
                                <div className="flex flex-col gap-1">
                                    <span className="text-slate-300">수신자 목록</span>
                                    <ul className="max-h-32 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-[11px] text-slate-400">
                                        {activePreview.recipients.map((email) => (
                                            <li key={email}>{email}</li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <p>선택된 그룹 정책에 따라 수신자가 자동으로 계산됩니다.</p>
                            )}
                            <p className="text-right text-[11px] text-slate-500">
                                {activePreview.stamp
                                    ? `생성: ${new Intl.DateTimeFormat("ko-KR", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                      }).format(activePreview.stamp)}`
                                    : null}
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
};

export default AdminMail;
