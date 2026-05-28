/**
 * Transform a Cloudinary URL to add auto-optimization transformations.
 * Since images are already on Cloudinary CDN, we skip Next.js image optimization
 * and let Cloudinary handle format conversion, quality, and resizing.
 */
export function cloudinaryUrl(url: string | undefined | null, width = 800): string {
  if (!url) return '';
  if (!url.includes('cloudinary.com')) return url;
  // Insert Cloudinary transformations right after /upload/
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
}

export function cloudinaryThumb(url: string | undefined | null): string {
  return cloudinaryUrl(url, 400);
}

export function cloudinaryLarge(url: string | undefined | null): string {
  return cloudinaryUrl(url, 1200);
}
