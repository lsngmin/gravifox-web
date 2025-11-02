import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PostCard from "./PostCard";


export default function PostList({ posts = [], loading, error, initialCount = 6 }) {
    const { t } = useTranslation("blog");
    const [count, setCount] = useState(initialCount);
    const items = useMemo(() => posts.slice(0, count), [posts, count]);

    if (error) return <div className="text-sm text-red-600 dark:text-red-400">{String(error)}</div>;

    const showLoadMore = count < posts.length;
    const showEmptyState = !loading && items.length === 0;

    return (
        <section id="latest" className="scroll-mt-28 sm:scroll-mt-32">
            {loading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: initialCount }).map((_, i) => (
                        <div
                            key={i}
                            className="h-40 animate-pulse rounded-2xl border border-slate-200/70 bg-white/90 p-5 dark:border-slate-700 dark:bg-slate-900/60"
                        />
                    ))}
                </div>
            ) : (
                <>
                    {showEmptyState ? (
                        <div className="rounded-2xl border border-dashed border-slate-200/70 bg-white/90 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
                            {t("list.empty")}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {items.map((p) => (
                                <PostCard key={p.slug} post={p} />
                            ))}
                        </div>
                    )}
                    {showLoadMore && (
                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={() => setCount((c) => c + initialCount)}
                                className="rounded-xl border border-slate-300/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-900/70"
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
