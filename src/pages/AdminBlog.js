import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
    ArrowTopRightOnSquareIcon,
    DocumentCheckIcon,
    TrashIcon,
} from "@heroicons/react/24/outline";
import AdminPageTopBar from "../components/admin/AdminPageTopBar";
import {
    adminCreateBlogPost,
    adminDeleteBlogPost,
    adminFetchBlogPosts,
    adminUpdateBlogPost,
} from "api/blogAdmin";

const defaultDate = () => new Date().toISOString().slice(0, 10);

const slugify = (value) =>
    String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

const parseTagsInput = (value) => {
    const seen = new Set();
    const tags = [];
    String(value || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .forEach((tag) => {
            if (!seen.has(tag) && tags.length < 16) {
                seen.add(tag);
                tags.push(tag);
            }
        });
    return tags;
};

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

const pickPublishedDate = (post) => post?.publishedAt || post?.date || "";

const blankForm = {
    id: null,
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    tags: "",
    date: defaultDate(),
};

const extractErrorMessage = (error, fallback = "요청 처리 중 오류가 발생했습니다.") => {
    const detail = error?.response?.data;
    if (!detail) return fallback;
    if (typeof detail === "string") return detail;
    return detail.message || detail.error || fallback;
};

const AdminBlog = () => {
    const { lng = "ko" } = useParams();
    const [posts, setPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [form, setForm] = useState({ ...blankForm });
    const [slugTouched, setSlugTouched] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const sortedPosts = useMemo(
        () =>
            [...posts].sort(
                (a, b) =>
                    new Date(pickPublishedDate(b) || b?.createdAt || 0).getTime() -
                    new Date(pickPublishedDate(a) || a?.createdAt || 0).getTime()
            ),
        [posts]
    );

    const loadPosts = useCallback(async () => {
        setLoadingPosts(true);
        setErrorMessage(null);
        try {
            const data = await adminFetchBlogPosts();
            setPosts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load blog posts", error);
            setErrorMessage(extractErrorMessage(error, "블로그 글을 불러오지 못했습니다."));
            setPosts([]);
        } finally {
            setLoadingPosts(false);
        }
    }, []);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    useEffect(() => {
        if (!statusMessage) return;
        const timer = setTimeout(() => setStatusMessage(null), 4000);
        return () => clearTimeout(timer);
    }, [statusMessage]);

    useEffect(() => {
        if (!errorMessage) return;
        const timer = setTimeout(() => setErrorMessage(null), 6000);
        return () => clearTimeout(timer);
    }, [errorMessage]);

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
        setForm({ ...blankForm, date: defaultDate() });
        setSlugTouched(false);
    };

    const validateAndBuildPayload = () => {
        const trimmedTitle = form.title.trim();
        if (!trimmedTitle) {
            return { error: "제목을 입력해주세요." };
        }

        const trimmedExcerpt = form.excerpt.trim();
        if (!trimmedExcerpt) {
            return { error: "요약을 입력해주세요." };
        }

        const trimmedContent = form.content.trim();
        if (!trimmedContent) {
            return { error: "본문을 입력해주세요." };
        }

        const slugCandidate = slugify(form.slug || form.title);
        if (!slugCandidate) {
            return { error: "슬러그를 입력해주세요." };
        }

        const dateValue = String(form.date || "").trim();
        if (!dateValue || !/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
            return { error: "게시일을 YYYY-MM-DD 형식으로 입력해주세요." };
        }

        const tags = parseTagsInput(form.tags);
        const tooLongTag = tags.find((tag) => tag.length > 48);
        if (tooLongTag) {
            return { error: `태그 "${tooLongTag}"는 48자를 넘을 수 없습니다.` };
        }

        return {
            payload: {
                slug: slugCandidate,
                title: trimmedTitle,
                excerpt: trimmedExcerpt,
                content: trimmedContent,
                publishedAt: dateValue,
                tags,
            },
        };
    };

    const handleSubmit = async () => {
        const { payload, error } = validateAndBuildPayload();
        if (error) {
            setErrorMessage(error);
            setStatusMessage(null);
            return;
        }

        setSaving(true);
        setErrorMessage(null);
        try {
            if (form.id != null) {
                await adminUpdateBlogPost(form.id, payload);
                setStatusMessage("게시글이 수정되었습니다.");
            } else {
                await adminCreateBlogPost(payload);
                setStatusMessage("새 게시글이 등록되었습니다.");
            }
            await loadPosts();
            resetForm();
        } catch (err) {
            console.error("Failed to save blog post", err);
            setErrorMessage(
                extractErrorMessage(
                    err,
                    form.id != null ? "게시글 수정에 실패했습니다." : "게시글 등록에 실패했습니다."
                )
            );
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (post) => {
        if (!post) return;
        setForm({
            id: post.id ?? null,
            title: post.title ?? "",
            slug: post.slug ?? "",
            excerpt: post.excerpt ?? "",
            content: post.content ?? "",
            tags: (post.tags || []).join(", "),
            date: pickPublishedDate(post) || defaultDate(),
        });
        setSlugTouched(true);
        setStatusMessage(`"${post.title}" 글을 수정 중입니다.`);
        setErrorMessage(null);
    };

    const handleDelete = async (post) => {
        if (!post?.id) return;
        const confirmed = window.confirm(`"${post.title}" 글을 삭제할까요? 삭제 후에는 되돌릴 수 없습니다.`);
        if (!confirmed) return;

        setDeletingId(post.id);
        setErrorMessage(null);
        try {
            await adminDeleteBlogPost(post.id);
            setStatusMessage("게시글이 삭제되었습니다.");
            if (form.id === post.id) {
                resetForm();
            }
            await loadPosts();
        } catch (err) {
            console.error("Failed to delete blog post", err);
            setErrorMessage(extractErrorMessage(err, "게시글 삭제에 실패했습니다."));
        } finally {
            setDeletingId(null);
        }
    };

    const pageClass =
        "min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100";
    const containerClass =
        "mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 md:px-10 md:py-16";
    const introTextClass = "max-w-3xl text-sm text-slate-600 md:text-base dark:text-slate-400";
    const statusPillClass =
        "inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-700 dark:border-emerald-500/60 dark:bg-emerald-500/10 dark:text-emerald-100";
    const errorPillClass =
        "inline-flex items-center gap-2 rounded-full border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-medium text-rose-600 dark:border-rose-500/60 dark:bg-rose-500/10 dark:text-rose-200";
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
    const postCardClass =
        "flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-sky-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-sky-400/60";
    const destructiveButtonClass =
        "inline-flex items-center gap-2 rounded-full border border-rose-500/50 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600 transition hover:border-rose-500 hover:bg-rose-100 dark:border-rose-500/60 dark:bg-rose-500/10 dark:text-rose-200";

    const isEditMode = form.id != null;

    return (
        <main className={pageClass}>
            <div className={containerClass}>
                <header className="flex flex-col gap-6">
                    <AdminPageTopBar lng={lng} currentLabel="블로그 글 관리" />
                    <div className="flex flex-col gap-3">
                        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Admin · Console</p>
                        <h1 className="text-3xl font-semibold md:text-4xl">블로그 글 관리</h1>
                        <p className={introTextClass}>
                            새 블로그 글을 작성하고 바로 퍼블리시하거나, 기존 글을 수정·삭제할 수 있습니다. 모든
                            작업은 즉시 서버 DB에 반영됩니다.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {statusMessage ? <p className={statusPillClass}>{statusMessage}</p> : null}
                            {errorMessage ? <p className={errorPillClass}>{errorMessage}</p> : null}
                        </div>
                    </div>
                </header>

                <section className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
                    <article className={formCardClass}>
                        <header className="flex flex-col gap-1 border-b border-slate-200 pb-4 dark:border-slate-800">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                                {isEditMode ? "게시글 수정" : "새 글 작성"}
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                필수 정보를 채운 뒤 {isEditMode ? "수정 저장" : "등록"} 버튼을 눌러주세요.
                            </p>
                        </header>

                        <div className="mt-6 flex flex-col gap-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex flex-col gap-2">
                                    <label className={labelClass}>제목 *</label>
                                    <input
                                        value={form.title}
                                        onChange={(event) => handleFieldChange("title", event.target.value)}
                                        placeholder="예) Gravifox 출시 후기"
                                        className={inputClass}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className={labelClass}>슬러그 *</label>
                                    <input
                                        value={form.slug}
                                        onChange={(event) => handleFieldChange("slug", event.target.value)}
                                        placeholder="예) gravifox-launch"
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className={labelClass}>게시일 *</label>
                                <input
                                    type="date"
                                    value={form.date}
                                    onChange={(event) => handleFieldChange("date", event.target.value)}
                                    className={inputClass}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className={labelClass}>요약 *</label>
                                <textarea
                                    value={form.excerpt}
                                    onChange={(event) => handleFieldChange("excerpt", event.target.value)}
                                    placeholder="글의 핵심 메시지를 2~3문장으로 정리해 주세요."
                                    className={textareaClass}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className={labelClass}>본문 *</label>
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
                                    쉼표로 구분해 최대 16개의 태그를 추가할 수 있습니다.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    className={primaryButtonClass}
                                    disabled={saving}
                                >
                                    <DocumentCheckIcon className="h-4 w-4" />
                                    {saving
                                        ? "저장 중..."
                                        : isEditMode
                                            ? "수정 내용 저장"
                                            : "게시글 등록"}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className={secondaryButtonClass}
                                    disabled={saving}
                                >
                                    초기화
                                </button>
                            </div>
                        </div>
                    </article>

                    <aside className={sidebarCardClass}>
                        <header className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                                    게시글 목록
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    최신 게시글이 상단에 표시됩니다.
                                </p>
                            </div>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                {loadingPosts ? "불러오는 중..." : `${sortedPosts.length}개`}
                            </span>
                        </header>

                        <div className="mt-4 space-y-3">
                            {loadingPosts ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-900/60"
                                    />
                                ))
                            ) : sortedPosts.length === 0 ? (
                                <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-100 px-4 py-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-400">
                                    아직 게시된 글이 없습니다. 새 글을 작성해 등록해 보세요.
                                </p>
                            ) : (
                                sortedPosts.map((post) => (
                                    <article key={post.id ?? post.slug} className={postCardClass}>
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                    {post.title}
                                                </h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    게시일 {formatDateTime(pickPublishedDate(post) || post.createdAt)}
                                                </p>
                                            </div>
                                            <a
                                                href={`/${lng}/blog/${post.slug}`}
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
                                            {post.tags?.length ? (
                                                post.tags.map((tag) => (
                                                    <span
                                                        key={`${post.id ?? post.slug}-${tag}`}
                                                        className="rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="rounded-full border border-dashed border-slate-300 px-2 py-0.5 text-slate-400 dark:border-slate-700 dark:text-slate-500">
                                                    태그 없음
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(post)}
                                                className={secondaryButtonClass}
                                            >
                                                <DocumentCheckIcon className="h-4 w-4" />
                                                편집
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(post)}
                                                className={destructiveButtonClass}
                                                disabled={deletingId === post.id}
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                                {deletingId === post.id ? "삭제 중..." : "삭제"}
                                            </button>
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    </aside>
                </section>
            </div>
        </main>
    );
};

export default AdminBlog;
