import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PostCard from "./PostCard";

export default function PostList({ posts = [], loading, error, initialCount = 6 }) {
    const { t } = useTranslation("blog");
    const [count, setCount] = useState(initialCount);
    const items = useMemo(() => posts.slice(0, count), [posts, count]);

    if (error) {
        return <div className="text-sm text-red-600 dark:text-red-400">{String(error)}</div>;
    }

    const showLoadMore = count < posts.length;
    const showEmptyState = !loading && items.length === 0;

    return (
        <section id="latest" className="scroll-mt-28 sm:scroll-mt-32">
            {loading ? (
                <div className="space-y-12">
                    {Array.from({ length: initialCount }).map((_, index) => (
                        <div
                            key={index}
                            className="flex flex-col gap-6 border-b border-slate-200 pb-10 sm:flex-row sm:items-center dark:border-slate-800"
                        >
                            <div className="h-24 w-24 rounded-3xl bg-slate-100 sm:h-28 sm:w-28 dark:bg-slate-800" />
                            <div className="flex-1 space-y-3">
                                <div className="h-3 w-24 rounded bg-slate-100 dark:bg-slate-800" />
                                <div className="h-5 w-3/4 rounded bg-slate-100 dark:bg-slate-800" />
                                <div className="h-4 w-11/12 rounded bg-slate-100 dark:bg-slate-800" />
                                <div className="h-4 w-9/12 rounded bg-slate-100 dark:bg-slate-800" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {showEmptyState ? (
                        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300">
                            {t("list.empty")}
                        </div>
                    ) : (
                        <div className="space-y-10 sm:space-y-14">
                            {items.map((post, index) => (
                                <PostCard key={post.slug || index} post={post} index={index} />
                            ))}
                        </div>
                    )}
                    {showLoadMore && (
                        <div className="mt-12 flex justify-center">
                            <button
                                onClick={() => setCount((current) => current + initialCount)}
                                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 dark:border-slate-600 dark:text-slate-200 dark:hover:border-emerald-400/70"
                            >
                                {t("list.loadMore")}
                            </button>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
