import { useEffect, useState } from "react";
import { BLOG_ENDPOINTS } from "api/endPointRoute";

const isConfiguredEndpoint = (value) =>
    typeof value === "string" && value.trim() !== "" && !value.startsWith("undefined");

const toText = (value) => {
    if (value === null || value === undefined) return "";
    return typeof value === "string" ? value : String(value);
};

const normalizeTags = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) {
        return value
            .map((tag) => toText(tag).trim())
            .filter(Boolean);
    }
    if (typeof value === "string") {
        return value
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean);
    }
    return [];
};

const sanitizeSlug = (value, fallbackIndex) => {
    const base = toText(value).trim().toLowerCase();
    if (base) {
        return base
            .replace(/[^a-z0-9가-힣\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");
    }
    return `post-${fallbackIndex}`;
};

const normalizeBlogPost = (raw, fallbackIndex = 0) => {
    const slugSource = raw?.slug ?? raw?.title ?? raw?.id ?? fallbackIndex;
    const slug = sanitizeSlug(slugSource, fallbackIndex);
    const readTime = Number(raw?.readTimeMinutes ?? raw?.readTime);
    const date =
        toText(raw?.publishedAt).trim() ||
        toText(raw?.date).trim() ||
        toText(raw?.createdAt).trim() ||
        toText(raw?.updatedAt).trim() ||
        null;

    return {
        id: raw?.id ?? null,
        slug,
        title: toText(raw?.title),
        excerpt: toText(raw?.excerpt),
        content: toText(raw?.content),
        tags: normalizeTags(raw?.tags),
        publishedAt: raw?.publishedAt ?? null,
        createdAt: raw?.createdAt ?? null,
        updatedAt: raw?.updatedAt ?? null,
        readTime: Number.isFinite(readTime) ? readTime : null,
        readTimeMinutes: Number.isFinite(readTime) ? readTime : null,
        date,
    };
};

const extractPostArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.posts)) return payload.posts;
    if (payload && Array.isArray(payload.data)) return payload.data;
    return [];
};

const dedupeBySlug = (posts) => {
    const seen = new Set();
    const result = [];
    posts.forEach((post) => {
        if (!post?.slug || seen.has(post.slug)) {
            return;
        }
        seen.add(post.slug);
        result.push(post);
    });
    return result;
};

const toTimestamp = (value) => {
    if (!value) return 0;
    const time = Date.parse(value);
    return Number.isFinite(time) ? time : 0;
};

const extractTimestamp = (post) =>
    toTimestamp(post?.date) ||
    toTimestamp(post?.publishedAt) ||
    toTimestamp(post?.createdAt) ||
    toTimestamp(post?.updatedAt);

const sortByNewest = (posts) =>
    [...posts].sort((a, b) => extractTimestamp(b) - extractTimestamp(a));

const readBody = async (response) => {
    const text = await response.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch (_err) {
        return text;
    }
};

const requestJson = async (url, signal) => {
    const response = await fetch(url, { signal });
    const payload = await readBody(response);

    if (!response.ok) {
        const detailMessage =
            (typeof payload === "string" && payload) ||
            payload?.message ||
            payload?.error ||
            payload?.code;
        const message = detailMessage || `Failed to fetch blog data (${response.status})`;
        const error = new Error(message);
        error.status = response.status;
        error.detail = payload;
        throw error;
    }

    return payload;
};

export function useBlogPosts() {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        const fetchPosts = async () => {
            setIsLoading(true);
            setError(null);

            try {
                if (!isConfiguredEndpoint(BLOG_ENDPOINTS?.LIST)) {
                    throw new Error("Blog API endpoint is not configured.");
                }

                const payload = await requestJson(BLOG_ENDPOINTS.LIST, controller.signal);
                const normalized = sortByNewest(
                    dedupeBySlug(
                        extractPostArray(payload).map((item, index) => normalizeBlogPost(item, index))
                    )
                );

                if (!controller.signal.aborted) {
                    setPosts(normalized);
                }
            } catch (err) {
                if (controller.signal.aborted || err?.name === "AbortError") {
                    return;
                }
                console.error("Failed to load blog posts", err);
                if (!controller.signal.aborted) {
                    setError(err);
                    setPosts([]);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        fetchPosts();

        return () => {
            controller.abort();
        };
    }, []);

    return { posts, isLoading, error };
}

export function useBlogPost(slug) {
    const [post, setPost] = useState(null);
    const [isLoading, setIsLoading] = useState(Boolean(slug));
    const [error, setError] = useState(null);

    useEffect(() => {
        const safeSlug = typeof slug === "string" ? slug.trim() : "";

        if (!safeSlug) {
            setPost(null);
            setIsLoading(false);
            setError(null);
            return;
        }

        if (typeof BLOG_ENDPOINTS?.BY_SLUG !== "function") {
            setPost(null);
            setIsLoading(false);
            setError(new Error("Blog detail endpoint is not configured."));
            return;
        }

        const controller = new AbortController();
        setPost(null);
        setError(null);
        setIsLoading(true);

        const fetchPost = async () => {
            try {
                const url = BLOG_ENDPOINTS.BY_SLUG(safeSlug);
                if (!isConfiguredEndpoint(url)) {
                    throw new Error("Blog detail endpoint is not configured.");
                }

                const payload = await requestJson(url, controller.signal);
                const normalized = normalizeBlogPost(payload, 0);

                if (!controller.signal.aborted) {
                    setPost(normalized);
                }
            } catch (err) {
                if (controller.signal.aborted || err?.name === "AbortError") {
                    return;
                }
                console.error("Failed to load blog post", err);
                if (err?.status === 404) {
                    setError(err);
                    setPost(null);
                    return;
                }
                setError(err);
                setPost(null);
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        fetchPost();

        return () => {
            controller.abort();
        };
    }, [slug]);

    return { post, isLoading, error };
}
