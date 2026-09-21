import type { Product } from "@/types/database";

/** Ordered gallery URLs for carousels (falls back to legacy image_url). */
export function productGalleryUrls(product: Product): string[] {
  const urls = (product.image_urls ?? [])
    .map((u) => u.trim())
    .filter(Boolean);
  if (urls.length > 0) return urls;
  if (product.image_url?.trim()) return [product.image_url.trim()];
  return [];
}
