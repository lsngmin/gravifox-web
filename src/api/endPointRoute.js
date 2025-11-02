// Base URLs (with fallback for legacy key)
export const API_BASE = process.env.REACT_APP_API_BASE || process.env.REACT_APP_API_BASE_URL;

const resolveFastApiBase = () => {
    const raw = (process.env.REACT_APP_FASTAPI_BASE || "117.17.149.66").trim();
    if (raw) {
        return raw.replace(/\/+$/, "");
    }

    const apiBase = (API_BASE || "").trim();
    if (apiBase) {
        try {
            const url = new URL(apiBase);
            return `${url.protocol}//${url.host}`;
        } catch {}
    }

    if (typeof window !== 'undefined' && window.location?.origin) {
        return window.location.origin;
    }

    if (typeof console !== "undefined" && console.error) {
        console.error("REACT_APP_FASTAPI_BASE 환경 변수가 설정되지 않았어요. 업로드 기능이 동작하지 않을 수 있어요.");
    }

    return "";
};

const ensureHttps = (value) => {
    if (!value) return value;

    // Only upgrade well-known domains to HTTPS; local/IP endpoints may not provide SSL.
    if (!/^http:\/\//i.test(value)) {
        return value;
    }

    try {
        const { hostname = "" } = new URL(value);
        const host = hostname.toLowerCase();
        const localHosts = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);
        const isLocalHost = localHosts.has(host) || host.endsWith(".localhost") || host.endsWith(".local");
        const isIpAddress = /^[\d.]+$/.test(host) || host.includes(":");

        if (isLocalHost || isIpAddress) {
            return value;
        }
    } catch {
        return value; // Keep original on parse errors
    }

    return value.replace(/^http:\/\//i, "https://");
};

export const FASTAPI_BASE = ensureHttps(resolveFastApiBase());

export const FREETRIAL_ENDPOINTS = {
    ANALYZE:    `${API_BASE}/api/v1/images`
};

export const ISSUE_ENDPOINTS = {
    GET_ISSUE:    `${API_BASE}/api/v1/issue/`,
    CREATE_ISSUE: `${API_BASE}/api/v1/issue/`,
};

export const DASHBOARD_ENDPOINTS = {
    GET_INFO:    `${API_BASE}/api/v1/dashboard/`,
    GENERATE:    `${API_BASE}/api/v1/dashboard/generate`,
};

// Legacy upload (Spring). New flow uses FASTAPI_ENDPOINTS.UPLOAD
export const FILEUPLOAD_ENDPOINTS = {
    UPLOAD:    `${API_BASE}/api/v1/files/upload`
};

export const AUTH_ENDPOINTS = {
    SIGNIN:    `${API_BASE}/api/v1/auth/login`,
    ME:    `${API_BASE}/api/v1/auth/me`,
    REFRESH:    `${API_BASE}/api/v1/auth/refresh`,
    SIGNOUT:    `${API_BASE}/api/v1/auth/logout`,
    SIGNUP:    `${API_BASE}/api/v1/register`,
    GOOGLE:    `${API_BASE}/oauth2/authorization/google`,
};

export const EMAIL_ENDPOINTS = {
    REQUEST: `${API_BASE}/api/v1/auth/email/request`,
    VERIFY: `${API_BASE}/api/v1/auth/email/verify`,
};

export const PROFILE_ENDPOINTS = {
    GET_INFO: `${API_BASE}/api/v1/profile/`,
    POST_PASSWORD: `${API_BASE}/api/v1/profile/password`,
    DELETE_ACCOUNT: `${API_BASE}/api/v1/profile/delete`,
    UPDATE: `${API_BASE}/api/v1/profile/`,
}

// New analyze flow (Spring)
export const ANALYZE_ENDPOINTS = {
    CREATE: `${API_BASE}/api/analyze`,
    SSE: (jobId) => `${API_BASE}/api/analyze/${jobId}/events`,
    QUOTA_SUMMARY: `${API_BASE}/api/analyze/quota/summary`,
};

export const ANALYZE_MODEL_ENDPOINTS = {
    LIST: `${API_BASE}/api/analyze/models`,
};

// FastAPI generic media upload endpoint (image/video)
export const FASTAPI_ENDPOINTS = {
    UPLOAD: FASTAPI_BASE ? `${FASTAPI_BASE}/upload` : "",
};

export const ADMIN_ENDPOINTS = {
    USERS: `${API_BASE}/admin/v1/users`,
    ANALYSIS_REPORTS_LATEST: `${API_BASE}/admin/v1/analysis/reports/latest`,
    EMAIL_PREVIEW: `${API_BASE}/admin/v1/communications/email/preview`,
    EMAIL_SEND: `${API_BASE}/admin/v1/communications/email/send`,
};

export const BLOG_ENDPOINTS = {
    LIST: `${API_BASE}/api/v1/blog/posts`,
    BY_SLUG: (slug = "") => `${API_BASE}/api/v1/blog/posts/slug/${encodeURIComponent(String(slug))}`,
};
