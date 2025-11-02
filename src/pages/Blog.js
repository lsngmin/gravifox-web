import React, { useMemo, useState } from "react";
import ContentDecor from "features/main/contentDecor";
import Navigation from "../features/navigation/navigation";


import BlogHero from "features/blog/BlogHero";
import BlogFilters from "features/blog/BlogFilters";
import PostList from "features/blog/PostList";
import NewsletterCTA from "features/blog/NewsletterCTA";
import { useBlogPosts } from "lib/blogApi";
import Footer from "../features/footer/footer";


const Blog = () => {
    const { posts, isLoading, error } = useBlogPosts();


    const [filter, setFilter] = useState({ tag: "all" });
    const filtered = useMemo(() => {
        if (!posts) return [];
        if (filter.tag === "all") return posts;
        return posts.filter(p => p.tags?.includes(filter.tag));
    }, [posts, filter]);


    return (
        <>
            <Navigation />
            <ContentDecor>
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-16">
                    <BlogHero />


                    <div className="mt-10">
                        <BlogFilters posts={posts || []} value={filter} onChange={setFilter} />
                    </div>


                    <div className="mt-8">
                        <PostList posts={filtered} loading={isLoading} error={error} initialCount={6} />
                    </div>


                    <div className="mt-16">
                        <NewsletterCTA />
                    </div>
                </div>


                <Footer />
            </ContentDecor>
        </>
    );
};


export default Blog;
