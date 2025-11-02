import React, { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { useParams } from "react-router-dom";
import {
    ArrowTopRightOnSquareIcon,
    DocumentCheckIcon,
    DocumentDuplicateIcon,
    TrashIcon,
} from "@heroicons/react/24/outline";
import {
    BLOG_STORAGE_EVENT,
    BLOG_STORAGE_KEYS,
    generateDraftId,
    readDrafts,
    readPublishedPosts,
    saveDrafts,
    savePublishedPosts,
} from "../lib/blogStorage";
import AdminPageTopBar from "../components/admin/AdminPageTopBar";

const defaultDate = () => new Date().toISOString().slice(0, 10);

const slugify = (value) =>
    String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

const parseTags = (value) =>
    String(value || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

const formatDateTime = (value) => {
    if (!value) return "—";
    try {
        return new Intl.DateTimeFormat("ko", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(new Date(value));
    } catch (_err) {
        return value;
    }
};

const blankForm = {
    id: null,
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    tags: "",
    readTime: "",
    date: defaultDate(),
};

const AdminBlog = () => {
    const { lng = "ko" } = useParams();
    const [drafts, setDrafts] = useState([]);
    const [published, setPublished] = useState([]);
    const [form, setForm] = useState(blankForm);
    const [slugTouched, setSlugTouched] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);

    const publishableDrafts = useMemo(
        () =>
            [...drafts].sort(
                (a, b) =>
                    new Date(b.updatedAt || b.createdAt || 0).getTime() -
                    new Date(a.updatedAt || a.createdAt || 0).getTime()
            ),
        [drafts]
    );

    useEffect(() => {
        const hydrate = () => {
            setDrafts(readDrafts());
            setPublished(readPublishedPosts());
        };
        hydrate();

        const handleStorage = (event) => {
            if (!event || event.key === null || Object.values(BLOG_STORAGE_KEYS).includes(event.key)) {
                hydrate();
            }
        };

        if (typeof window !== "undefined") {
            window.addEventListener(BLOG_STORAGE_EVENT, hydrate);
            window.addEventListener("storage", handleStorage);
        }

        return () => {
            if (typeof window !== "undefined") {
                window.removeEventListener(BLOG_STORAGE_EVENT, hydrate);
                window.removeEventListener("storage", handleStorage);
            }
        };
    }, []);

    const autoSlugSource = form.title;

    useEffect(() => {
        if (slugTouched) return;
        const nextSlug = slugify(autoSlugSource);
        setForm((prev) => {
            if (prev.slug === nextSlug) {
                return prev;
            }
            return { ...prev, slug: nextSlug };
        });
    }, [autoSlugSource, slugTouched]);

    const handleFieldChange = (field, value) => {
        if (field === "slug") {
            setSlugTouched(true);
        }
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const resetForm = () => {
        setForm({
            ...blankForm,
            date: defaultDate(),
        });
        setSlugTouched(false);
    };

    const handleSaveDraft = () => {
        const trimmedTitle = form.title.trim();
        const trimmedExcerpt = form.excerpt.trim();
        if (!trimmedTitle || !trimmedExcerpt) {
            setStatusMessage("제목과 요약은 필수입니다.");
            return;
        }

        const slug = slugify(form.slug || form.title || generateDraftId());
        const now = new Date().toISOString();
        const nextDraft = {
            id: form.id ?? generateDraftId(),
            title: trimmedTitle,
            slug,
            excerpt: trimmedExcerpt,
            content: form.content.trim(),
            tags: parseTags(form.tags),
            readTime: form.readTime ? Number(form.readTime) : null,
            date: form.date || defaultDate(),
            updatedAt: now,
            createdAt: form.createdAt || now,
        };

        const nextDrafts = drafts.some((draft) => draft.id === nextDraft.id)
            ? drafts.map((draft) => (draft.id === nextDraft.id ? nextDraft : draft))
            : [...drafts, nextDraft];

        saveDrafts(nextDrafts);
        setDrafts(nextDrafts);
        setStatusMessage("임시 저장되었습니다.");
    };

    const handleDeleteDraft = (id) => {
        const nextDrafts = drafts.filter((draft) => draft.id !== id);
        saveDrafts(nextDrafts);
        setDrafts(nextDrafts);
        if (form.id === id) {
            resetForm();
        }
    };

    const handleEditDraft = (draft) => {
        setForm({
            ...draft,
            tags: draft.tags?.join(", ") ?? "",
        });
        setSlugTouched(true);
        setStatusMessage(`"${draft.title}" 초안을 수정 중입니다.`);
    };

    const handlePublish = (draft) => {
        const now = new Date().toISOString();
        const slug = slugify(draft.slug || draft.title || generateDraftId());
        const publishedPost = {
            ...draft,
            slug,
            updatedAt: now,
            date: draft.date || now,
            createdAt: now,
            source: "admin",
        };

        const existing = readPublishedPosts();
        const filtered = existing.filter((post) => post.slug !== slug);
        const nextPublished = [...filtered, publishedPost];
        savePublishedPosts(nextPublished);
        setPublished(nextPublished);

        const remainingDrafts = drafts.filter((item) => item.id !== draft.id);
        saveDrafts(remainingDrafts);
        setDrafts(remainingDrafts);

        if (form.id === draft.id) {
            resetForm();
        }
        setStatusMessage("게시글이 업로드되어 블로그에 반영되었습니다.");
    };

    const combinedPublished = useMemo(
        () =>
            [...published].sort(
                (a, b) =>
                    new Date(b.date || b.createdAt || 0).getTime() -
                    new Date(a.date || a.createdAt || 0).getTime()
            ),
        [published]
    );

    const pageClass =
        "min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100";
    const containerClass =
        "mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 md:px-10 md:py-16";
    const introTextClass = "max-w-3xl text-sm text-slate-600 md:text-base dark:text-slate-400";
    const statusPillClass =
        "rounded-full border border-slate-300 bg-white px-4 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200";
    const formCardClass =
        "rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.18)] dark:border-slate-800/80 dark:bg-slate-900/70";
    const sidebarCardClass =
        "rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.16)] dark:border-slate-800/80 dark:bg-slate-900/60";
    const labelClass = "text-xs font-medium uppercase tracking-[0.3em] text-slate-500";
    const inputClass =
        "rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";
    const textareaClass =
        "min-h-[140px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";
    const secondaryButtonClass =
        "inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white";
    const primaryButtonClass =
        "inline-flex items-center gap-2 rounded-full border border-emerald-500 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:border-emerald-500 hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-emerald-500/60 dark:bg-emerald-500/20 dark:text-emerald-100 dark:hover:border-emerald-400 dark:hover:bg-emerald-500/30 dark:focus-visible:ring-offset-slate-950";
    const draftCardClass =
        "flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-sky-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-sky-400/60";
    const publishedCardClass =
        "flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60";

    return (
        <main className={pageClass}>
            <div className={containerClass}>
                <header className="flex flex-col gap-6">
                    <AdminPageTopBar lng={lng} currentLabel="블로그 글 관리" />
                    <div className="flex flex-col gap-3">
                        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Admin · Console</p>
                        <h1 className="text-3xl font-semibold md:text-4xl">블로그 글 관리</h1>
                        <p className={introTextClass}>
                            운영 허브에서 새 블로그 글을 작성하고, 검토 대기칸에 저장한 뒤 업로드할 수 있습니다. 저장
                            버튼으로 초안을 보관하고, 업로드 버튼으로 즉시 블로그 페이지에 반영하세요.
                        </p>
                        {statusMessage && <p className={statusPillClass}>{statusMessage}</p>}
                    </div>
                </header>

                <section className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
                    <article className={formCardClass}>
                        <header className="flex flex-col gap-1 border-b border-slate-200 pb-4 dark:border-slate-800">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">새 글 작성</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                초안으로 저장한 뒤 언제든지 검토하고 업로드할 수 있어요.
                            </p>
                        </header>

                        <div className="mt-6 flex flex-col gap-5">
                            <div className="flex flex-col gap-2">
                                <label className={labelClass}>제목</label>
                                <input
                                    value={form.title}
                                    onChange={(event) => handleFieldChange("title", event.target.value)}
                                    placeholder="예) 생성형 AI 이미지 검증, 이렇게 시작하세요"
                                    className={inputClass}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <label className={labelClass}>슬러그</label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSlugTouched(false);
                                            setForm((prev) => ({
                                                ...prev,
                                                slug: slugify(prev.title),
                                            }));
                                        }}
                                        className="text-xs text-sky-500 underline-offset-4 transition hover:underline"
                                    >
                                        자동 생성
                                    </button>
                                </div>
                                <input
                                    value={form.slug}
                                    onChange={(event) => handleFieldChange("slug", event.target.value)}
                                    placeholder="예) generative-ai-image-verification"
                                    className={inputClass}
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex flex-col gap-2">
                                    <label className={labelClass}>발행일</label>
                                    <input
                                        type="date"
                                        value={form.date}
                                        onChange={(event) => handleFieldChange("date", event.target.value)}
                                        className={inputClass}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className={labelClass}>읽는 시간 (분)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={form.readTime}
                                        onChange={(event) => handleFieldChange("readTime", event.target.value)}
                                        placeholder="예) 5"
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className={labelClass}>요약</label>
                                <textarea
                                    value={form.excerpt}
                                    onChange={(event) => handleFieldChange("excerpt", event.target.value)}
                                    placeholder="글의 핵심 메시지를 2~3문장으로 정리해 주세요."
                                    className={textareaClass}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className={labelClass}>본문</label>
                                <textarea
                                    value={form.content}
                                    onChange={(event) => handleFieldChange("content", event.target.value)}
                                    placeholder="마크다운 또는 일반 텍스트를 입력할 수 있습니다."
                                    className="min-h-[280px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className={labelClass}>태그</label>
                                <input
                                    value={form.tags}
                                    onChange={(event) => handleFieldChange("tags", event.target.value)}
                                    placeholder="예) ai, product, release"
                                    className={inputClass}
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    쉼표로 구분해 여러 태그를 추가할 수 있습니다.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <button type="button" onClick={handleSaveDraft} className={secondaryButtonClass}>
                                    <DocumentDuplicateIcon className="h-4 w-4" />
                                    임시 저장
                                </button>
                                <button type="button" onClick={resetForm} className={secondaryButtonClass}>
                                    초기화
                                </button>
                            </div>
                        </div>
                    </article>

                    <aside className={sidebarCardClass}>
                        <header className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                                    임시 저장 목록
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    최신 순으로 정렬된 초안 목록입니다.
                                </p>
                            </div>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                {publishableDrafts.length}개
                            </span>
                        </header>

                        <div className="mt-4 space-y-3">
                            {publishableDrafts.length === 0 ? (
                                <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-100 px-4 py-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-400">
                                    아직 저장된 초안이 없습니다. 새로운 글을 작성해 임시 저장해 보세요.
                                </p>
                            ) : (
                                publishableDrafts.map((draft) => (
                                    <article key={draft.id} className={draftCardClass}>
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                {draft.title}
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                마지막 수정 {formatDateTime(draft.updatedAt)}
                                            </p>
                                        </div>
                                        <p className="text-xs text-slate-500 line-clamp-3 dark:text-slate-400">
                                            {draft.excerpt}
                                        </p>
                                        <div className="flex flex-wrap gap-2 text-xs">
                                            {draft.tags?.length
                                                ? draft.tags.map((tag) => (
                                                      <span
                                                          key={`${draft.id}-${tag}`}
                                                          className="rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
                                                      >
                                                          #{tag}
                                                      </span>
                                                  ))
                                                : (
                                                      <span className="rounded-full border border-dashed border-slate-300 px-2 py-0.5 text-slate-400 dark:border-slate-700 dark:text-slate-500">
                                                          태그 없음
                                                      </span>
                                                  )}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleEditDraft(draft)}
                                                className={secondaryButtonClass}
                                            >
                                                <DocumentCheckIcon className="h-4 w-4" />
                                                편집하기
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handlePublish(draft)}
                                                className={primaryButtonClass}
                                            >
                                                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                                                업로드
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteDraft(draft.id)}
                                                className="inline-flex items-center gap-2 rounded-full border border-rose-500/50 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600 transition hover:border-rose-500 hover:bg-rose-100 dark:border-rose-500/60 dark:bg-rose-500/10 dark:text-rose-200"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                                삭제
                                            </button>
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    </aside>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.14)] dark:border-slate-800/80 dark:bg-slate-900/60">
                    <header className="flex flex-col gap-2 border-b border-slate-200 pb-4 dark:border-slate-800">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">게시된 글</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            최신 게시글이 상단에 표시됩니다. 목록을 클릭하면 블로그 페이지에서 확인할 수 있습니다.
                        </p>
                    </header>

                    <div className="mt-4 space-y-3">
                        {combinedPublished.length === 0 ? (
                            <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-100 px-4 py-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-400">
                                아직 게시된 글이 없습니다. 초안을 업로드하면 이곳에서 확인할 수 있어요.
                            </p>
                        ) : (
                            combinedPublished.map((post) => (
                                <article key={post.slug} className={publishedCardClass}>
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                {post.title}
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                게시일 {formatDateTime(post.date || post.createdAt)}
                                            </p>
                                        </div>
                                        <a
                                            href={`/blog/${post.slug}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white"
                                        >
                                            보기
                                            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                                        </a>
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-2 dark:text-slate-400">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        {post.tags?.length
                                            ? post.tags.map((tag) => (
                                                  <span
                                                      key={`${post.slug}-${tag}`}
                                                      className="rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
                                                  >
                                                      #{tag}
                                                  </span>
                                              ))
                                            : (
                                                  <span className="rounded-full border border-dashed border-slate-300 px-2 py-0.5 text-slate-400 dark:border-slate-700 dark:text-slate-500">
                                                      태그 없음
                                                  </span>
                                              )}
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
};

export default AdminBlog;
