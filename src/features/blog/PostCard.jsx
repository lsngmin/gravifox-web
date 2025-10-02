import React from "react";
import { Link, useParams } from "react-router-dom";


export default function PostCard({ post }) {
    const { lng } = useParams();
    return (
        <Link
            to={`/${lng}/blog/${post.slug}`}
            className="group block rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_16px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition"
        >
            <div className="flex flex-col gap-3">
                <div className="text-xs text-gray-500">{new Date(post.date).toLocaleDateString()}</div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-700">
                    {post.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-3">{post.excerpt}</p>
                {post.tags?.length ? (
                    <div className="mt-1 flex flex-wrap gap-1.5">
                        {post.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 text-[11px] px-2 py-0.5">
#{tag}
</span>
                        ))}
                    </div>
                ) : null}
            </div>
        </Link>
    );
}