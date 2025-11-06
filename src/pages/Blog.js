import React, { useMemo, useState } from "react";
import Header from "../app/layout/Header";
import Footer from "../app/layout/Footer/Footer";
import BlogHero from "features/blog/BlogHero";
import BlogFilters from "features/blog/BlogFilters";
import PostList from "features/blog/PostList";
import NewsletterCTA from "features/blog/NewsletterCTA";
import { useBlogPosts } from "lib/blogApi";

const BlogBackground = () => (
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

const Blog = () => {
    const { posts, isLoading, error } = useBlogPosts();

    const [filter, setFilter] = useState({ tag: "all" });
    const filtered = useMemo(() => {
        if (!posts) return [];
        if (filter.tag === "all") return posts;
        return posts.filter((p) => p.tags?.includes(filter.tag));
    }, [posts, filter]);

    return (
        <>
            <Header />
            <div className="relative isolate min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
                <BlogBackground />
                <main className="relative z-10">
                    <div className="mx-auto w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl 2xl:max-w-3xl px-5 pb-24 pt-28 lg:pb-32 lg:pt-32">
                        <BlogHero />

                        <div className="mt-10 lg:mt-12">
                            <BlogFilters posts={posts || []} value={filter} onChange={setFilter} />
                        </div>

                        <div className="mt-8 lg:mt-10">
                            <PostList posts={filtered} loading={isLoading} error={error} initialCount={6} />
                        </div>

                        <div className="mt-16 lg:mt-20">
                            <NewsletterCTA />
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </>
    );
};

export default Blog;
