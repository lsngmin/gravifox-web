import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";


export default function BlogFilters({ posts = [], value, onChange }) {
    const { t } = useTranslation("blog");
    const tags = useMemo(() => {
        const s = new Set();
        posts.forEach(p => (p.tags || []).forEach(tag => s.add(tag)));
        return ["all", ...Array.from(s).sort()];
    }, [posts]);


    return (
        <div id="categories" className="flex flex-wrap items-center gap-2 scroll-mt-28 sm:scroll-mt-32">
            {tags.map(tag => {
                const active = value?.tag === tag;
                return (
                    <button
                        key={tag}
                        onClick={() => onChange?.({ tag })}
                        className={
                            "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition " +
                            (active
                                ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50")
                        }
                    >
                        {tag === "all" ? t("filters.all") : `#${tag}`}
                    </button>
                );
            })}
        </div>
    );
}
