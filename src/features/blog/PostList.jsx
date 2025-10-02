import React, { useMemo, useState } from "react";
import PostCard from "./PostCard";


export default function PostList({ posts = [], loading, error, initialCount = 6 }) {
    const [count, setCount] = useState(initialCount);
    const items = useMemo(() => posts.slice(0, count), [posts, count]);


    if (error) return <div className="text-red-600 text-sm">{String(error)}</div>;


    return (
        <section id="latest" className="scroll-mt-28 sm:scroll-mt-32">
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: initialCount }).map((_, i) => (
                        <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 animate-pulse h-40" />
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map(p => (
                            <PostCard key={p.slug} post={p} />
                        ))}
                    </div>
                    {count < posts.length && (
                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={() => setCount(c => c + initialCount)}
                                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                더 보기
                            </button>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
