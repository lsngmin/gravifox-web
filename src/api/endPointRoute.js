export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const FREETRIAL_ENDPOINTS = {
    ANALYZE:    `${API_BASE_URL}/api/v1/images`
};

export const ISSUE_ENDPOINTS = {
    GET_ISSUE:    `${API_BASE_URL}/api/v1/issue/`,
};

export const DASHBOARD_ENDPOINTS = {
    GET_INFO:    `${API_BASE_URL}/api/v1/dashboard/`,
    GENERATE:    `${API_BASE_URL}/api/v1/dashboard/generate`,
};

export const FILEUPLOAD_ENDPOINTS = {
    UPLOAD:    `${API_BASE_URL}/api/v1/files/upload`
};

export const AUTH_ENDPOINTS = {
    SIGNIN:    `${API_BASE_URL}/api/v1/auth/login`,
    ME:    `${API_BASE_URL}/api/v1/auth/me`,
    REFRESH:    `${API_BASE_URL}/api/v1/auth/refresh`,
    SIGNOUT:    `${API_BASE_URL}/api/v1/auth/logout`,
    SIGNUP:    `${API_BASE_URL}/api/v1/register`,
    GOOGLE:    `${API_BASE_URL}/oauth2/authorization/google`,
};

export const EMAIL_ENDPOINTS = {
    REQUEST: `${API_BASE_URL}/api/v1/auth/email/request`,
    VERIFY: `${API_BASE_URL}/api/v1/auth/email/verify`,
};

export const PROFILE_ENDPOINTS = {
    GET_INFO: `${API_BASE_URL}/api/v1/profile/`,
    POST_PASSWORD: `${API_BASE_URL}/api/v1/profile/password`,
    DELETE_ACCOUNT: `${API_BASE_URL}/api/v1/profile/delete`,
}
