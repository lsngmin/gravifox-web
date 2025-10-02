// Minimal JWT payload decoder (Base64URL decode) for expiry checks on client
export function decodeJwt(token) {
  try {
    const parts = (token || '').split('.');
    if (parts.length < 2) return null;
    const base64url = parts[1];
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getExpiryMs(token) {
  const payload = decodeJwt(token);
  if (!payload || !payload.exp) return 0;
  return payload.exp * 1000;
}

export function isTokenValid(token, skewMs = 5000) {
  const expMs = getExpiryMs(token);
  if (!expMs) return false;
  return expMs > Date.now() + skewMs;
}

