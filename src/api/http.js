import axios from "axios";
import { AUTH_ENDPOINTS } from "./endPointRoute";

// Always send cookies (for RT) with requests
axios.defaults.withCredentials = true;

let currentAccessToken = null;
let onTokenUpdated = (t) => {};
let onUnauthorized = () => {};

// Plain axios instance without interceptors to avoid recursion on refresh
const plain = axios.create({ withCredentials: true });

export function setHttpAccessToken(token) {
  currentAccessToken = token || null;
}

export function setHttpHandlers({ onTokenUpdated: onUpdated, onUnauthorized: onUnauth }) {
  if (typeof onUpdated === "function") onTokenUpdated = onUpdated;
  if (typeof onUnauth === "function") onUnauthorized = onUnauth;
}

// Request: attach Authorization automatically
axios.interceptors.request.use((config) => {
  try {
    // Skip attaching token for auth endpoints if needed
    const url = config.url || "";
    const isAuthCall =
      url.includes("/api/v1/auth/login") ||
      url.includes("/api/v1/auth/refresh") ||
      url.includes("/api/v1/auth/logout");
    if (!isAuthCall && currentAccessToken) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${currentAccessToken}`;
    }
  } catch {}
  return config;
});

let refreshPromise = null;

async function doRefreshOnce() {
  if (!refreshPromise) {
    refreshPromise = plain
      .post(AUTH_ENDPOINTS.REFRESH, {}, { withCredentials: true })
      .then((resp) => resp?.data?.accessToken || null)
      .catch(() => null)
      .finally(() => {
        // Allow next refresh attempts
        setTimeout(() => {
          refreshPromise = null;
        }, 0);
      });
  }
  return refreshPromise;
}

// Response: on 401/403, try refresh once and retry original request
axios.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    const resp = error?.response;
    const config = error?.config || {};

    const status = resp?.status;
    const url = config?.url || "";
    const isAuthCall =
      url.includes("/api/v1/auth/login") ||
      url.includes("/api/v1/auth/refresh") ||
      url.includes("/api/v1/auth/logout");

    if ((status === 401 || status === 403) && !config._retry && !isAuthCall) {
      config._retry = true;
      const newAT = await doRefreshOnce();
      if (newAT) {
        // Update local token and retry original request once
        currentAccessToken = newAT;
        try { onTokenUpdated(newAT); } catch {}
        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${newAT}`;
        return axios(config);
      }
      // Refresh failed: cleanup and bubble up
      try { onUnauthorized(); } catch {}
    }
    return Promise.reject(error);
  }
);

export default axios;
