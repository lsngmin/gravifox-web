const RETURN_PATH_KEY = 'auth:returnTo';
const RETURN_STATE_KEY = 'auth:returnState';

const COOKIE_NAME = 'oauthReturn';
const COOKIE_MAX_AGE_SEC = 600; // 10 minutes

const getCookieDomain = () => {
  if (typeof window === 'undefined') return '';
  const envDomain = process.env.REACT_APP_AUTH_COOKIE_DOMAIN;
  if (envDomain && envDomain.trim().length > 0) {
    return envDomain.trim();
  }
  const host = window.location?.hostname;
  if (!host || host === 'localhost' || host === '127.0.0.1') {
    return '';
  }
  const parts = host.split('.');
  if (parts.length <= 2) {
    return `.${host}`;
  }
  return `.${parts.slice(-2).join('.')}`;
};

const sanitizePath = (path) => {
  if (typeof path !== 'string' || !path) return null;
  // Allow only same-origin relative paths
  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      const url = new URL(path);
      if (url.origin !== window.location.origin) {
        return null;
      }
      return `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return null;
    }
  }
  if (!path.startsWith('/')) {
    return `/${path}`;
  }
  return path;
};

export const rememberAuthReturn = (path, state) => {
  try {
    const sanitized = sanitizePath(path) || '/';
    sessionStorage.setItem(RETURN_PATH_KEY, sanitized);
    if (state != null) {
      sessionStorage.setItem(RETURN_STATE_KEY, JSON.stringify(state));
    } else {
      sessionStorage.removeItem(RETURN_STATE_KEY);
    }
    const encoded = encodeURIComponent(sanitized);
    const secureFlag = (typeof window !== 'undefined' && window.location?.protocol === 'https:') ? '; Secure' : '';
    const domain = getCookieDomain();
    const domainFlag = domain ? `; domain=${domain}` : '';
    document.cookie = `${COOKIE_NAME}=${encoded}; path=/; max-age=${COOKIE_MAX_AGE_SEC}; SameSite=Lax${domainFlag}${secureFlag}`;
  } catch {
    // ignore storage errors
  }
};

export const getAuthReturn = () => {
  try {
    const path = sessionStorage.getItem(RETURN_PATH_KEY);
    const rawState = sessionStorage.getItem(RETURN_STATE_KEY);
    let state = null;
    if (rawState) {
      try {
        state = JSON.parse(rawState);
      } catch {
        state = null;
      }
    }
    return { path, state };
  } catch {
    return { path: null, state: null };
  }
};

export const clearAuthReturn = () => {
  try {
    sessionStorage.removeItem(RETURN_PATH_KEY);
  } catch {}
  try {
    sessionStorage.removeItem(RETURN_STATE_KEY);
  } catch {}
  try {
    const secureFlag = (typeof window !== 'undefined' && window.location?.protocol === 'https:') ? '; Secure' : '';
    const domain = getCookieDomain();
    const domainFlag = domain ? `; domain=${domain}` : '';
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0${domainFlag}${secureFlag}`;
  } catch {}
};
