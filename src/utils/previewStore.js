const DB_NAME = 'tvb-preview-store';
const STORE_NAME = 'previews';
const DB_VERSION = 1;

let dbPromise = null;

function hasIndexedDB() {
  return typeof indexedDB !== 'undefined';
}

function openDatabase() {
  if (!hasIndexedDB()) return Promise.resolve(null);
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise.catch((error) => {
    console.warn('[previewStore] Failed to open IndexedDB', error);
    dbPromise = null;
    return null;
  });
}

async function withStore(mode, handler) {
  const db = await openDatabase();
  if (!db) return null;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const request = handler(store);
    if (!request) {
      resolve(null);
      return;
    }
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  }).catch((error) => {
    console.warn('[previewStore] request failed', error);
    return null;
  });
}

export async function savePreviewBlob(id, blob) {
  if (!id || !blob || !hasIndexedDB()) return false;
  const db = await openDatabase();
  if (!db) return false;
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const record = { id, blob, savedAt: Date.now() };
    const request = store.put(record);
    request.onsuccess = () => resolve(true);
    request.onerror = () => {
      console.warn('[previewStore] failed to save blob', request.error);
      resolve(false);
    };
  });
}

export async function getPreviewBlob(id) {
  if (!id || !hasIndexedDB()) return null;
  return withStore('readonly', (store) => store.get(id)).then((record) => {
    if (record && record.blob instanceof Blob) {
      return record.blob;
    }
    return null;
  });
}

export async function deletePreview(id) {
  if (!id || !hasIndexedDB()) return false;
  const db = await openDatabase();
  if (!db) return false;
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve(true);
    request.onerror = () => {
      console.warn('[previewStore] failed to delete record', request.error);
      resolve(false);
    };
  });
}

export async function getPreviewObjectUrl(id) {
  const blob = await getPreviewBlob(id);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

export async function persistPreviewForJob(jobId, file) {
  if (!jobId || !file) return false;
  const saved = await savePreviewBlob(jobId, file);
  if (saved) {
    try {
      const raw = sessionStorage.getItem(`sse:meta:${jobId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.previewStoreId = jobId;
        delete parsed.previewDataUrl;
        sessionStorage.setItem(`sse:meta:${jobId}`, JSON.stringify(parsed));
      }
    } catch {}
  }
  return saved;
}

export async function clearAllPreviews() {
  if (!hasIndexedDB()) return false;
  const db = await openDatabase();
  if (!db) return false;
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.clear();
    request.onsuccess = () => resolve(true);
    request.onerror = () => {
      console.warn('[previewStore] failed to clear store', request.error);
      resolve(false);
    };
  });
}

export default {
  savePreviewBlob,
  getPreviewBlob,
  getPreviewObjectUrl,
  deletePreview,
  clearAllPreviews,
  persistPreviewForJob,
};
