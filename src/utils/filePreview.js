export function isPreviewableImage(file) {
  if (!file) return false;
  const type = typeof file?.type === 'string' ? file.type : '';
  if (type) return type.startsWith('image/');
  const name = typeof file?.name === 'string' ? file.name.toLowerCase() : '';
  return ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.heic', '.heif'].some((ext) => name.endsWith(ext));
}

export function readFileAsDataURL(file, { sizeLimit = 5 * 1024 * 1024 } = {}) {
  if (!isPreviewableImage(file)) return Promise.resolve(null);
  if (typeof file?.size === 'number' && sizeLimit && file.size > sizeLimit) return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(typeof reader.result === 'string' ? reader.result : null);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    } catch {
      resolve(null);
    }
  });
}
