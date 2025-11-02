import { useEffect, useState } from "react";
import data from "content/blog/posts.json";
import {
    BLOG_STORAGE_EVENT,
    BLOG_STORAGE_KEYS,
    readPublishedPosts,
} from "./blogStorage";

const ensureArray = (maybeArray) => (Array.isArray(maybeArray) ? maybeArray : []);

const normalizeSlug = (post, fallbackIndex = 0) => {
    if (!post) return `post-${fallbackIndex}`;
    if (post.slug) return String(post.slug);
    if (post.title) {
        return String(post.title)
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9가-힣\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "") || `post-${fallbackIndex}`;
    }
    return `post-${fallbackIndex}`;
};

const sortByDateDesc = (posts) =>
    [...posts].sort((a, b) => {
        const dateA = a?.date || a?.createdAt || 0;
        const dateB = b?.date || b?.createdAt || 0;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

export function useBlogPosts() {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;

        const hydratePosts = () => {
            setIsLoading(true);
            try {
                const basePosts = ensureArray(data?.posts);
                const published = ensureArray(readPublishedPosts());

                const merged = new Map();
                basePosts.forEach((post, index) => {
                    const slug = normalizeSlug(post, index);
                    merged.set(slug, { ...post, slug });
                });
                published.forEach((post, index) => {
                    const slug = normalizeSlug(post, index + basePosts.length);
                    merged.set(slug, { ...post, slug });
                });

                const combined = sortByDateDesc(Array.from(merged.values()));
                if (mounted) {
                    setPosts(combined);
                    setError(null);
                }
            } catch (err) {
                if (mounted) {
                    setError(err);
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        hydratePosts();

        const handleStorageEvent = (event) => {
            if (!event || event.key === null || event.key === BLOG_STORAGE_KEYS.published) {
                hydratePosts();
            }
        };

        if (typeof window !== "undefined") {
            window.addEventListener(BLOG_STORAGE_EVENT, hydratePosts);
            window.addEventListener("storage", handleStorageEvent);
        }

        return () => {
            mounted = false;
            if (typeof window !== "undefined") {
                window.removeEventListener(BLOG_STORAGE_EVENT, hydratePosts);
                window.removeEventListener("storage", handleStorageEvent);
            }
        };
    }, []);

    return { posts, isLoading, error };
}
