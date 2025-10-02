// Base URLs (with fallback for legacy key)
export const API_BASE = process.env.REACT_APP_API_BASE || process.env.REACT_APP_API_BASE_URL;

export const FASTAPI_BASE = process.env.REACT_APP_FASTAPI_BASE || "http://117.17.149.66:8000";

export const FREETRIAL_ENDPOINTS = {
    ANALYZE:    `${API_BASE}/api/v1/images`
};

export const ISSUE_ENDPOINTS = {
    GET_ISSUE:    `${API_BASE}/api/v1/issue/`,
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
};

// FastAPI generic media upload endpoint (image/video)
export const FASTAPI_ENDPOINTS = {
    UPLOAD: `${FASTAPI_BASE}/upload`,
};
