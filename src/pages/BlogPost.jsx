import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navigation from "features/navigation";
import ContentDecor from "features/layout/ContentDecor";
import Footer from "features/footer";
import { useBlogPosts } from "lib/blogApi";
import ReactMarkdown from "react-markdown"; // npm i react-markdown


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
    const { slug } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation("blog");
    const { posts, isLoading } = useBlogPosts();


    const post = useMemo(() => posts?.find(p => p.slug === slug), [posts, slug]);


// 존재하지 않는 슬러그면 목록으로 복귀
    useEffect(() => {
        if (!isLoading && posts && !post) {
            navigate("../blog", { replace: true });
        }
    }, [isLoading, posts, post, navigate]);

    useEffect(() => {
        if (post) setOgMeta(post.title, post.excerpt);
    }, [post]);


if (isLoading || !post) {
    return (
        <>
            <Navigation />
            <ContentDecor>
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
                    <div className="animate-pulse h-6 w-1/2 bg-gray-200 rounded" />
                    <div className="mt-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded" />
                        <div className="h-4 bg-gray-200 rounded w-11/12" />
                        <div className="h-4 bg-gray-200 rounded w-10/12" />
                    </div>
                </div>
                <Footer transparent />
            </ContentDecor>
        </>
    );
}


return (
    <>
        <Navigation />
        <ContentDecor>
            <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
                    {post.title}
                </h1>
                <p className="mt-2 text-sm text-gray-500">
                    {new Date(post.date).toLocaleDateString()} • {post.readTime} min
                </p>


                {/* 태그 */}
                {post.tags?.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {post.tags.map(tag => (
                            <span key={tag} className="inline-flex items-center rounded-full border border-gray-200 px-2.5 py-0.5 text-xs text-gray-600">
#{tag}
</span>
                        ))}
                    </div>
                ) : null}


                {/* 본문 */}
                <div className="prose prose-indigo max-w-none mt-8">
                    <ReactMarkdown>{post.content}</ReactMarkdown>
                </div>
            </article>


            <Footer transparent />
        </ContentDecor>
    </>
);
};


export default BlogPost;