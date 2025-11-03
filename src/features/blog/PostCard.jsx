import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const IMAGE_KEYS = ["coverImage", "heroImage", "thumbnail", "image"];

export default function PostCard({ post, index = 0 }) {
    const { lng } = useParams();
    const { t } = useTranslation("blog");

    const meta = useMemo(() => {
        if (!post) {
            return {
                day: "",
                month: "",
                formattedDate: "",
            };
        }

        const date = post.date ? new Date(post.date) : null;
        const day = date
            ? new Intl.DateTimeFormat("en-US", {
                  day: "2-digit",
              }).format(date)
            : "";
        const month = date
            ? new Intl.DateTimeFormat("en-US", {
                  month: "short",
              })
                  .format(date)
                  .toUpperCase()
            : "";
        const formattedDate = date
            ? new Intl.DateTimeFormat(lng === "en" ? "en-US" : undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
              }).format(date)
            : "";
        return { day, month, formattedDate };
    }, [post, lng]);

    const coverImage =
        IMAGE_KEYS.map((key) => post?.[key])
            .filter(Boolean)
            .shift() || null;
    const hasCover = Boolean(coverImage);

    return (
        <article className="relative flex flex-col gap-8 border-b border-slate-200 pb-12 sm:flex-row sm:items-center sm:gap-10 dark:border-slate-800">
            <div className="w-full sm:w-auto">
                {hasCover ? (
                    <div className="relative h-32 w-full overflow-hidden rounded-3xl bg-slate-100 sm:h-32 sm:w-44 lg:h-36 lg:w-48 dark:bg-slate-800">
                        <img
                            src={coverImage}
                            alt={post.title}
                            className="h-full w-full object-cover"
                            loading={index > 1 ? "lazy" : "eager"}
                        />
                    </div>
                ) : (
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-sm sm:h-28 sm:w-28 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                        <div className="flex flex-col items-center leading-none">
                            <span className="text-4xl font-black tracking-tight sm:text-5xl">{meta.day || "—"}</span>
                            <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-500">
                                {meta.month || ""}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1">
                {post.tags?.length ? (
                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">
                        {post.tags.slice(0, 4).map((tag) => (
                            <span key={tag}>#{tag}</span>
                        ))}
                    </div>
                ) : null}

                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                    <Link to={`/${lng}/blog/${post.slug}`} className="inline-flex items-baseline gap-2 text-inherit">
                        {post.title}
                    </Link>
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{post.excerpt}</p>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    {meta.formattedDate ? (
                        <span className="font-medium tracking-wide">{meta.formattedDate}</span>
                    ) : null}
                </div>

                <Link
                    to={`/${lng}/blog/${post.slug}`}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-300"
                >
                    {t("list.readMore")}
                    <span aria-hidden className="text-base leading-none">→</span>
                </Link>
            </div>
        </article>
    );
}
