import React, { useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Header from "../app/layout/Header";
import Footer from "../app/layout/Footer/Footer";
import { useBlogPost, useBlogPostById } from "lib/blogApi";
import ReactMarkdown from "react-markdown"; // npm i react-markdown
import { ArrowLeftIcon } from "@heroicons/react/24/outline";


// 안전한 OG 메타 세팅 유틸
function setOgMeta(title, description) {
    const ensure = (prop, content) => {
        let el = document.querySelector(`meta[property="${prop}"]`);
        if (!el) {
            el = document.createElement("meta");
            el.setAttribute("property", prop);
            document.head.appendChild(el);
        }
        el.setAttribute("content", content || "");
    };
    if (title) document.title = title;
    ensure("og:title", title || "");
    ensure("og:description", description || "");
}
const BlogPost = () => {
    const { lng, slug } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const querySlug = searchParams.get("slug") || undefined;
    const queryId = searchParams.get("id") || undefined;
    const effectiveSlug = slug || querySlug || "";
    const byId = useBlogPostById(queryId);
    const bySlug = useBlogPost(effectiveSlug);
    const post = queryId ? byId.post : bySlug.post;
    const isLoading = queryId ? byId.isLoading : bySlug.isLoading;
    const error = queryId ? byId.error : bySlug.error;
    const locale = (lng || "ko").toLowerCase();

    const publishedDate = useMemo(() => {
        if (!post?.date) return "";
        return new Intl.DateTimeFormat(lng === "en" ? "en-US" : undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        }).format(new Date(post.date));
    }, [post, lng]);

    const handleNavigateList = useCallback(() => {
        const targetLng = locale || "ko";
        navigate(`/${targetLng}/blog`, { replace: false });
    }, [navigate, locale]);

    const handleBack = useCallback(() => {
        if (window.history.length > 2) {
            navigate(-1);
            return;
        }
        handleNavigateList();
    }, [navigate, handleNavigateList]);

    const backLabel = locale.startsWith("en") ? "Back to blog" : "블로그 목록으로";
// 존재하지 않는 슬러그면 목록으로 복귀
    useEffect(() => {
        if (!isLoading && error?.status === 404) {
            navigate("../blog", { replace: true });
        }
    }, [isLoading, error, navigate]);

    useEffect(() => {
        if (!isLoading && !error && !post) {
            navigate("../blog", { replace: true });
        }
    }, [isLoading, error, post, navigate]);

    useEffect(() => {
        if (post) setOgMeta(post.title, post.excerpt);
    }, [post]);

    let body = null;

    if (isLoading) {
        body = (
            <div className="rounded-3xl border border-slate-200/80 bg-white/90 px-6 py-12 shadow-xl shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-900/60 dark:shadow-[0_28px_60px_rgba(2,6,23,0.55)] sm:px-10">
                <div className="h-7 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                <div className="mt-6 space-y-3">
                    <div className="h-4 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-4 w-10/12 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-4 w-11/12 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
                <div className="mt-10 space-y-4">
                    {Array.from({ length: 5 }).map((_, idx) => (
                        <div key={idx} className="h-3.5 w-full rounded bg-slate-200 dark:bg-slate-700" />
                    ))}
                </div>
            </div>
        );
    } else if (error?.status === 404) {
        return null;
    } else if (error) {
        const errorCopy = locale.startsWith("en")
            ? {
                  title: "We couldn't load this post.",
                  description: "Please try again in a moment.",
              }
            : {
                  title: "게시글을 불러오는 중 문제가 발생했습니다.",
                  description: "잠시 후 다시 시도해주세요.",
              };
        body = (
            <article className="rounded-3xl border border-slate-200/80 bg-white/95 px-6 py-12 shadow-xl shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-900/70 dark:shadow-[0_28px_60px_rgba(2,6,23,0.55)] sm:px-10">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{errorCopy.title}</h1>
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                    {error.message || errorCopy.description}
                </p>
                <button
                    type="button"
                    onClick={handleNavigateList}
                    className="mt-8 inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                    <ArrowLeftIcon className="h-4 w-4" aria-hidden />
                    {backLabel}
                </button>
            </article>
        );
    } else if (post) {
        body = (
            <article className="px-1 sm:px-2 lg:px-0">
                <header>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
                        {post.title}
                    </h1>
                    {publishedDate ? (
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            {publishedDate}
                        </div>
                    ) : null}
                    {post.tags?.length ? (
                        <div className="mt-5 flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    ) : null}
                </header>

                <div className="prose prose-slate mt-8 max-w-none prose-headings:text-slate-900 prose-a:text-indigo-600 hover:prose-a:text-indigo-500 dark:prose-invert dark:prose-headings:text-white dark:prose-a:text-indigo-300 dark:hover:prose-a:text-indigo-200">
                    <ReactMarkdown>{post.content}</ReactMarkdown>
                </div>
            </article>
        );
    }

    if (!body) {
        return null;
    }

    const TopDecoration = () => (
        <>
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-white via-indigo-50/50 to-slate-100 dark:from-slate-950 dark:via-slate-900/70 dark:to-slate-950"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-indigo-200/30 via-white to-transparent dark:from-slate-900/70 dark:via-slate-900/0 dark:to-transparent"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70rem_50rem_at_90%_-10%,rgba(99,102,241,0.14),transparent)] dark:bg-[radial-gradient(70rem_50rem_at_90%_-10%,rgba(99,102,241,0.22),transparent)]"
            />
        </>
    );

    return (
        <>
            <Header />
            <div className="relative isolate min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
                <TopDecoration />
                <main className="relative z-10">
                    <div className="mx-auto w-full max-w-sm md:max-w-md lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl px-5 pb-24 pt-28 lg:pt-32">
                        <div className="mb-6 flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm shadow-slate-900/5 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-800"
                                disabled={isLoading}
                            >
                                <ArrowLeftIcon className="h-4 w-4" aria-hidden />
                                {backLabel}
                            </button>
                        </div>
                        {body}
                    </div>
                </main>
                <Footer />
            </div>
        </>
    );
};

export default BlogPost;
