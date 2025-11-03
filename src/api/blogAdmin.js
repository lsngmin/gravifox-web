import http from "./http";
import { BLOG_ENDPOINTS } from "./endPointRoute";

const extractData = (response) => response?.data ?? null;

export async function adminFetchBlogPosts() {
    const response = await http.get(BLOG_ENDPOINTS.LIST);
    return extractData(response) || [];
}

export async function adminCreateBlogPost(payload) {
    const response = await http.post(BLOG_ENDPOINTS.LIST, payload);
    return extractData(response);
}

export async function adminUpdateBlogPost(id, payload) {
    if (id == null) throw new Error("게시글 ID가 필요합니다.");
    const response = await http.put(BLOG_ENDPOINTS.BY_ID(id), payload);
    return extractData(response);
}

export async function adminDeleteBlogPost(id) {
    if (id == null) throw new Error("게시글 ID가 필요합니다.");
    await http.delete(BLOG_ENDPOINTS.BY_ID(id));
}
