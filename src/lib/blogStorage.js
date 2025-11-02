const DRAFT_KEY = "gravifox.blogDrafts.v1";
const PUBLISHED_KEY = "gravifox.blogPublished.v1";
export const BLOG_STORAGE_EVENT = "gravifox:blogUpdated";

const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const safeParseArray = (raw) => {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
        console.error("Failed to parse blog storage payload", err);
        return [];
    }
};

const readArray = (key) => {
    if (!isBrowser()) {
        return [];
    }
    const raw = window.localStorage.getItem(key);
    return safeParseArray(raw);
};

const writeArray = (key, value) => {
    if (!isBrowser()) {
        return;
    }
    window.localStorage.setItem(key, JSON.stringify(value));
};

export const readDrafts = () => readArray(DRAFT_KEY);
export const saveDrafts = (drafts) => {
    writeArray(DRAFT_KEY, drafts);
};

export const readPublishedPosts = () => readArray(PUBLISHED_KEY);
export const savePublishedPosts = (posts) => {
    writeArray(PUBLISHED_KEY, posts);
    notifyBlogUpdated();
};

export const notifyBlogUpdated = () => {
    if (!isBrowser()) return;
    window.dispatchEvent(new Event(BLOG_STORAGE_EVENT));
};

const fallbackId = () => Math.random().toString(36).slice(2, 10);

export const generateDraftId = () => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return fallbackId();
};

export const BLOG_STORAGE_KEYS = {
    drafts: DRAFT_KEY,
    published: PUBLISHED_KEY,
};
