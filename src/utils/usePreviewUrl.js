import { useEffect, useMemo, useState } from 'react';
import { getPreviewObjectUrl, getPreviewDataUrl } from './previewStore';

export function usePreviewUrl(meta) {
  const directUrl = typeof meta?.previewDataUrl === 'string' ? meta.previewDataUrl : null;
  const storeIds = useMemo(() => {
    const ids = [];
    const pushIf = (v) => { if (typeof v === 'string' && v.trim().length) ids.push(v.trim()); };
    if (Array.isArray(meta?.previewStoreId)) meta.previewStoreId.forEach(pushIf);
    pushIf(meta?.previewStoreId);
    pushIf(meta?.previewRef);
    pushIf(meta?.uploadId);
    pushIf(meta?.jobId);
    // remove duplicates
    return Array.from(new Set(ids));
  }, [meta?.previewStoreId, meta?.previewRef, meta?.uploadId, meta?.jobId]);
  const [resolvedUrl, setResolvedUrl] = useState(directUrl);

  useEffect(() => {
    let revoked = null;
    let cancelled = false;

    if (directUrl) {
      setResolvedUrl(directUrl);
      return () => {};
    }

    if (!storeIds.length) {
      setResolvedUrl(null);
      return () => {};
    }

    (async () => {
      for (const id of storeIds) {
        const inlineUrl = await getPreviewDataUrl(id);
        if (inlineUrl) {
          setResolvedUrl(inlineUrl);
          return;
        }
        const objectUrl = await getPreviewObjectUrl(id);
        if (cancelled) {
          if (objectUrl) URL.revokeObjectURL(objectUrl);
          return;
        }
        if (objectUrl) {
          revoked = objectUrl;
          setResolvedUrl(objectUrl);
          return;
        }
      }
      setResolvedUrl(null);
    })();

    return () => {
      cancelled = true;
      if (revoked) {
        URL.revokeObjectURL(revoked);
      }
    };
  }, [directUrl, storeIds]);

  return useMemo(() => directUrl || resolvedUrl || null, [directUrl, resolvedUrl]);
}

export default usePreviewUrl;
