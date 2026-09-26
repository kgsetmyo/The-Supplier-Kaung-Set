/** Public product image bucket used by inventory uploads / pasted Supabase URLs. */
export const PRODUCT_IMAGE_BUCKET = "products";

/**
 * Extract object path from a Supabase public (or signed) storage URL for a bucket.
 * External hosts (Unsplash, etc.) return null — nothing to remove.
 */
export function storageObjectPathFromUrl(
  url: string,
  bucket: string = PRODUCT_IMAGE_BUCKET
): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    const publicMarker = `/storage/v1/object/public/${bucket}/`;
    const signMarker = `/storage/v1/object/sign/${bucket}/`;
    const pathname = parsed.pathname;
    for (const marker of [publicMarker, signMarker]) {
      const idx = pathname.indexOf(marker);
      if (idx === -1) continue;
      const raw = pathname.slice(idx + marker.length);
      const path = decodeURIComponent(raw.split("?")[0] ?? "");
      return path || null;
    }
    return null;
  } catch {
    return null;
  }
}

export function collectProductImageUrls(row: {
  image_url?: string | null;
  image_urls?: unknown;
}): string[] {
  const urls: string[] = [];
  if (typeof row.image_url === "string" && row.image_url.trim()) {
    urls.push(row.image_url.trim());
  }
  if (Array.isArray(row.image_urls)) {
    for (const item of row.image_urls) {
      if (typeof item === "string" && item.trim()) urls.push(item.trim());
    }
  }
  return [...new Set(urls)];
}
