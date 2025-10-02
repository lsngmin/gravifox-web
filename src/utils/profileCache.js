// Simple sessionStorage-based profile cache with ETag

const keyOf = (userNo) => `profile:${userNo}`;

export function getProfileCache(userNo) {
  try {
    const raw = sessionStorage.getItem(keyOf(userNo));
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== 'object') return null;
    return obj; // { data, etag, ts }
  } catch {
    return null;
  }
}

export function setProfileCache(userNo, data, etag) {
  try {
    const obj = { data, etag: etag || null, ts: Date.now() };
    sessionStorage.setItem(keyOf(userNo), JSON.stringify(obj));
  } catch {
    // ignore storage errors
  }
}

export function clearProfileCache(userNo) {
  try {
    sessionStorage.removeItem(keyOf(userNo));
  } catch {}
}

