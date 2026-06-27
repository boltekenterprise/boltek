/**
 * Preloads an image URL using a native Image element (no fetch/CORS issues).
 * Returns the original URL once the image has loaded, or throws if it errors.
 * The browser's HTTP cache handles deduplication automatically.
 */
const preloadedUrls = new Set<string>();

export function preloadImage(url: string): Promise<string> {
  if (!url) return Promise.reject(new Error('No url'));
  if (preloadedUrls.has(url)) return Promise.resolve(url);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      preloadedUrls.add(url);
      resolve(url);
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

/** @deprecated Use preloadImage instead. Kept for backward compat. */
export async function fetchAndCacheImage(url: string): Promise<string> {
  return preloadImage(url);
}
