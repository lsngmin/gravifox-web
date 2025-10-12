export function buildStoredReport(result, fileMeta) {
  return {
    version: 2,
    storedAt: Date.now(),
    result: result ?? null,
    fileMeta: fileMeta ?? null,
  };
}

export function buildStoredFailure(reason, fileMeta) {
  return {
    version: 2,
    storedAt: Date.now(),
    reason: reason ?? null,
    fileMeta: fileMeta ?? null,
  };
}

export function parseStoredReport(rawValue, fallbackMeta = null) {
  if (!rawValue) {
    return { result: null, fileMeta: fallbackMeta, storedAt: null, version: 0 };
  }
  try {
    const parsed = typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const hasStructured = 'result' in parsed || 'fileMeta' in parsed || 'data' in parsed || 'meta' in parsed;
      const result = 'result' in parsed ? parsed.result : 'data' in parsed ? parsed.data : hasStructured ? null : parsed;
      const fileMeta = parsed.fileMeta ?? parsed.meta ?? fallbackMeta ?? null;
      const storedAt = typeof parsed.storedAt === 'number' ? parsed.storedAt : null;
      const version = typeof parsed.version === 'number' ? parsed.version : hasStructured ? 2 : 1;
      return {
        result: result ?? (hasStructured ? null : parsed),
        fileMeta,
        storedAt,
        version,
      };
    }
    return { result: parsed ?? null, fileMeta: fallbackMeta, storedAt: null, version: 1 };
  } catch {
    return { result: null, fileMeta: fallbackMeta, storedAt: null, version: 0 };
  }
}

export function parseStoredFailure(rawValue, fallbackMeta = null) {
  if (!rawValue) {
    return { reason: null, fileMeta: fallbackMeta, storedAt: null, version: 0 };
  }
  if (typeof rawValue === 'string') {
    try {
      const parsed = JSON.parse(rawValue);
      if (typeof parsed === 'string') {
        return { reason: parsed, fileMeta: fallbackMeta, storedAt: null, version: 1 };
      }
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const reason = parsed.reason ?? parsed.message ?? null;
        const fileMeta = parsed.fileMeta ?? parsed.meta ?? fallbackMeta ?? null;
        const storedAt = typeof parsed.storedAt === 'number' ? parsed.storedAt : null;
        const version = typeof parsed.version === 'number' ? parsed.version : 2;
        return {
          reason: reason ?? null,
          fileMeta,
          storedAt,
          version,
        };
      }
      return { reason: parsed != null ? String(parsed) : null, fileMeta: fallbackMeta, storedAt: null, version: 1 };
    } catch {
      return { reason: rawValue, fileMeta: fallbackMeta, storedAt: null, version: 1 };
    }
  }
  if (rawValue && typeof rawValue === 'object') {
    const reason = rawValue.reason ?? rawValue.message ?? null;
    const fileMeta = rawValue.fileMeta ?? rawValue.meta ?? fallbackMeta ?? null;
    const storedAt = typeof rawValue.storedAt === 'number' ? rawValue.storedAt : null;
    const version = typeof rawValue.version === 'number' ? rawValue.version : 2;
    return { reason, fileMeta, storedAt, version };
  }
  return { reason: String(rawValue), fileMeta: fallbackMeta, storedAt: null, version: 1 };
}
