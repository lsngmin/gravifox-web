import React, { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
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
    const [drafts, setDrafts] = useState([]);
    const [published, setPublished] = useState([]);
    const [form, setForm] = useState(blankForm);
    const [slugTouched, setSlugTouched] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);

    const publishableDrafts = useMemo(() => {
        return [...drafts].sort(
            (a, b) =>
                new Date(b.updatedAt || b.createdAt || 0).getTime() -
                new Date(a.updatedAt || a.createdAt || 0).getTime()
        );
    }, [drafts]);

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
        setForm(nextDraft);
    };

    const handleEditDraft = (draft) => {
        setForm({
            id: draft.id,
            title: draft.title,
            slug: draft.slug,
            excerpt: draft.excerpt,
            content: draft.content,
            tags: draft.tags?.join(", ") ?? "",
            readTime: draft.readTime ?? "",
            date: (draft.date || defaultDate()).slice(0, 10),
            createdAt: draft.createdAt,
        });
        setSlugTouched(true);
        setStatusMessage("임시 글을 편집 중입니다.");
    };

    const handleDeleteDraft = (id) => {
        const nextDrafts = drafts.filter((draft) => draft.id !== id);
        saveDrafts(nextDrafts);
        setDrafts(nextDrafts);
        if (form.id === id) {
            resetForm();
        }
        setStatusMessage("임시 글이 삭제되었습니다.");
    };

    const handlePublish = (draft) => {
        const slug = slugify(draft.slug || draft.title || generateDraftId());
        const now = new Date().toISOString();
        const publishedPost = {
            slug,
            title: draft.title,
            excerpt: draft.excerpt,
            content: draft.content,
            tags: draft.tags ?? [],
            readTime: draft.readTime ?? null,
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

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 md:px-10 md:py-16">
                <header className="flex flex-col gap-3">
                    <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                        Admin · Console
                    </p>
                    <h1 className="text-3xl font-semibold md:text-4xl">
                        블로그 글 관리
                    </h1>
                    <p className="max-w-3xl text-sm text-slate-400 md:text-base">
                        운영 허브에서 새 블로그 글을 작성하고, 검토 대기칸에 저장한 뒤 업로드할 수 있습니다.
                        저장 버튼으로 초안을 보관하고, 업로드 버튼으로 즉시 블로그 페이지에 반영하세요.
                    </p>
                    {statusMessage && (
                        <p className="rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-xs text-slate-200">
                            {statusMessage}
                        </p>
                    )}
                </header>

                <section className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
                    <article className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.6)]">
                        <header className="flex flex-col gap-1 border-b border-slate-800 pb-4">
                            <h2 className="text-lg font-semibold text-slate-50">
                                새 글 작성
                            </h2>
                            <p className="text-xs text-slate-400">
                                초안으로 저장한 뒤 언제든지 검토하고 업로드할 수 있어요.
                            </p>
                        </header>

                        <div className="mt-6 flex flex-col gap-5">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500">
                                    제목
                                </label>
                                <input
                                    value={form.title}
                                    onChange={(event) => handleFieldChange("title", event.target.value)}
                                    placeholder="예) 생성형 AI 이미지 검증, 이렇게 시작하세요"
                                    className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500">
                                        슬러그
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSlugTouched(false);
                                            setForm((prev) => ({
                                                ...prev,
                                                slug: slugify(prev.title),
                                            }));
                                        }}
                                        className="text-xs text-sky-400 underline-offset-4 transition hover:underline"
                                    >
                                        자동 생성
                                    </button>
                                </div>
                                <input
                                    value={form.slug}
                                    onChange={(event) => handleFieldChange("slug", event.target.value)}
                                    placeholder="예) getting-started-with-gravifox"
                                    className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500">
                                        발행일
                                    </label>
                                    <input
                                        type="date"
                                        value={form.date}
                                        onChange={(event) => handleFieldChange("date", event.target.value)}
                                        className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500">
                                        예상 읽기 시간 (분)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={form.readTime}
                                        onChange={(event) => handleFieldChange("readTime", event.target.value)}
                                        placeholder="예) 6"
                                        className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500">
                                    태그 (쉼표로 구분)
                                </label>
                                <input
                                    value={form.tags}
                                    onChange={(event) => handleFieldChange("tags", event.target.value)}
                                    placeholder="예) genai, product, release"
                                    className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500">
                                    요약
                                </label>
                                <textarea
                                    value={form.excerpt}
                                    onChange={(event) => handleFieldChange("excerpt", event.target.value)}
                                    rows={3}
                                    placeholder="요약 문장을 입력하세요. 블로그 카드에 표시됩니다."
                                    className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500">
                                    본문 (마크다운 지원)
                                </label>
                                <textarea
                                    value={form.content}
                                    onChange={(event) => handleFieldChange("content", event.target.value)}
                                    rows={10}
                                    placeholder="## 제목\n\n본문 내용을 마크다운으로 작성하세요."
                                    className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-3 border-t border-slate-800 pt-4">
                                <button
                                    type="button"
                                    onClick={handleSaveDraft}
                                    className="inline-flex items-center gap-2 rounded-full border border-slate-600 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-sky-400 hover:text-white"
                                >
                                    <DocumentDuplicateIcon className="h-4 w-4" />
                                    임시 저장
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="inline-flex items-center gap-2 rounded-full border border-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
                                >
                                    초기화
                                </button>
                                {form.id && (
                                    <span className="text-xs text-slate-500">
                                        초안 ID: {form.id}
                                    </span>
                                )}
                            </div>
                        </div>
                    </article>

                    <aside
                        className={clsx(
                            "flex h-full flex-col gap-6 rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.6)]"
                        )}
                    >
                        <section className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-semibold text-slate-50">
                                    대기 중인 초안
                                </h2>
                                <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                                    {publishableDrafts.length}건
                                </span>
                            </div>
                            <p className="text-xs text-slate-400">
                                임시 저장된 글은 여기에서 검토 후 업로드할 수 있습니다.
                            </p>
                            <div className="flex flex-col gap-3">
                                {publishableDrafts.length === 0 ? (
                                    <p className="rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-5 text-xs text-slate-500">
                                        아직 저장된 초안이 없습니다. 새 글을 작성해 임시 저장해 보세요.
                                    </p>
                                ) : (
                                    publishableDrafts.map((draft) => (
                                        <div
                                            key={draft.id}
                                            className="rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-4 text-sm text-slate-200"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex flex-col gap-1">
                                                    <h3 className="text-sm font-semibold text-slate-100">
                                                        {draft.title}
                                                    </h3>
                                                    <p className="text-xs text-slate-500">
                                                        최근 수정 {formatDateTime(draft.updatedAt || draft.createdAt)}
                                                    </p>
                                                </div>
                                                <span className="rounded-full border border-slate-700 px-3 py-1 text-[11px] text-slate-300">
                                                    {draft.tags?.slice(0, 2).join(", ") || "태그 없음"}
                                                </span>
                                            </div>
                                            <p className="mt-3 line-clamp-2 text-xs text-slate-400">
                                                {draft.excerpt}
                                            </p>
                                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditDraft(draft)}
                                                    className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:border-slate-400 hover:text-white"
                                                >
                                                    <DocumentCheckIcon className="h-4 w-4" />
                                                    편집
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handlePublish(draft)}
                                                    className="inline-flex items-center gap-2 rounded-full border border-sky-500/80 bg-sky-500/20 px-3 py-1 text-xs font-medium text-sky-200 transition hover:border-sky-400 hover:bg-sky-500/30"
                                                >
                                                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                                                    업로드
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteDraft(draft.id)}
                                                    className="inline-flex items-center gap-2 rounded-full border border-slate-800 px-3 py-1 text-xs text-slate-500 transition hover:border-rose-500/60 hover:text-rose-300"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                    삭제
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        <section className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-semibold text-slate-50">
                                    업로드된 글
                                </h2>
                                <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                                    {combinedPublished.length}건
                                </span>
                            </div>
                            <p className="text-xs text-slate-400">
                                바로 블로그 페이지에서 노출되는 글 목록입니다.
                            </p>
                            <div className="flex flex-col gap-3">
                                {combinedPublished.length === 0 ? (
                                    <p className="rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-5 text-xs text-slate-500">
                                        아직 업로드된 글이 없습니다. 초안을 업로드해 블로그를 채워보세요.
                                    </p>
                                ) : (
                                    combinedPublished.slice(0, 6).map((post) => (
                                        <div
                                            key={post.slug}
                                            className="rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-4 text-sm text-slate-200"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex flex-col gap-1">
                                                    <h3 className="text-sm font-semibold text-slate-100">
                                                        {post.title}
                                                    </h3>
                                                    <p className="text-xs text-slate-500">
                                                        발행 {formatDateTime(post.date || post.createdAt)}
                                                    </p>
                                                </div>
                                                <span className="rounded-full border border-slate-700 px-3 py-1 text-[11px] text-slate-300">
                                                    {post.tags?.slice(0, 2).join(", ") || "태그 없음"}
                                                </span>
                                            </div>
                                            <p className="mt-3 line-clamp-2 text-xs text-slate-400">
                                                {post.excerpt}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </aside>
                </section>
            </div>
        </main>
    );
};

export default AdminBlog;
