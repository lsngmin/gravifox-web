import { useEffect, useMemo, useState } from 'react';
import { getPreviewObjectUrl } from './previewStore';

export function usePreviewUrl(meta) {
  const directUrl = typeof meta?.previewDataUrl === 'string' ? meta.previewDataUrl : null;
  const storeId = meta?.previewStoreId || meta?.previewRef || null;
  const [resolvedUrl, setResolvedUrl] = useState(directUrl);

  useEffect(() => {
    let revoked = null;
    let cancelled = false;

    if (directUrl) {
      setResolvedUrl(directUrl);
      return () => {};
    }

    if (!storeId) {
      setResolvedUrl(null);
      return () => {};
    }

    (async () => {
      const objectUrl = await getPreviewObjectUrl(storeId);
      if (cancelled) {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        return;
      }
      revoked = objectUrl;
      setResolvedUrl(objectUrl);
    })();

    return () => {
      cancelled = true;
      if (revoked) {
        URL.revokeObjectURL(revoked);
      }
    };
  }, [directUrl, storeId]);

  return useMemo(() => directUrl || resolvedUrl || null, [directUrl, resolvedUrl]);
}

export default usePreviewUrl;
