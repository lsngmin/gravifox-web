import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";


export default function PostCard({ post }) {
    const { lng } = useParams();
    const { t } = useTranslation("blog");

    const meta = useMemo(() => {
        const formattedDate = post?.date
            ? new Intl.DateTimeFormat(lng === "en" ? "en-US" : undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
              }).format(new Date(post.date))
            : "";
        const readTime = post?.readTime ? t("meta.readTime", { minutes: post.readTime }) : null;
        return { formattedDate, readTime };
    }, [post, lng, t]);

    return (
        <Link
            to={`/${lng}/blog/${post.slug}`}
            className="group block rounded-2xl border border-slate-200/70 bg-white/95 p-5 shadow-[0_16px_30px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_45px_rgba(15,23,42,0.12)] dark:border-slate-700 dark:bg-slate-900/60 dark:shadow-[0_22px_50px_rgba(2,6,23,0.55)] dark:hover:shadow-[0_30px_60px_rgba(2,6,23,0.65)]"
        >
            <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    {meta.formattedDate}
                    {meta.readTime ? <span aria-hidden>•</span> : null}
                    {meta.readTime}
                </div>
                <h3 className="text-lg font-bold text-slate-900 transition group-hover:text-indigo-700 dark:text-slate-100 dark:group-hover:text-indigo-300">
                    {post.title}
                </h3>
                <p className="text-sm text-slate-600 line-clamp-3 dark:text-slate-300">{post.excerpt}</p>
                {post.tags?.length ? (
                    <div className="mt-1 flex flex-wrap gap-1.5">
                        {post.tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center rounded-full bg-indigo-50 text-[11px] text-indigo-700 px-2 py-0.5 dark:bg-indigo-500/10 dark:text-indigo-200"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                ) : null}
            </div>
        </Link>
    );
}
