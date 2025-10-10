export const GUEST_DAILY_QUOTA = 10;
export const DEFAULT_MEMBER_DAILY_QUOTA = 20;

export const MAX_IMAGE_FILES = 3;
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const SUPPORTED_IMAGE_MIME_TYPES = Object.freeze([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export const SUPPORTED_IMAGE_EXTENSIONS = Object.freeze([
  'jpeg',
  'jpg',
  'png',
  'webp',
]);

export const SUPPORTED_IMAGE_EXTENSIONS_LABEL = SUPPORTED_IMAGE_EXTENSIONS.map((ext) =>
  ext.toUpperCase()
).join(', ');
