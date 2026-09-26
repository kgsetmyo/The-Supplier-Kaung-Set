"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { userHasAdminAccess } from "@/lib/admin-access";

export type ProductActionResult =
  | { ok: true }
  | { ok: false; message: string };

/** Public product image bucket used by inventory uploads / pasted Supabase URLs. */
export const PRODUCT_IMAGE_BUCKET = "products";

const uuidSchema = z.string().uuid("Invalid product id.");

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
      // Signed URLs may include a token segment after the path; keep path only.
      const path = decodeURIComponent(raw.split("?")[0] ?? "");
      return path || null;
    }
    return null;
  } catch {
    return null;
  }
}

function collectImageUrls(row: {
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

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" as const, supabase, user: null };
  }
  if (!(await userHasAdminAccess(supabase, user))) {
    return { error: "Forbidden" as const, supabase, user };
  }
  return { error: null, supabase, user };
}

/**
 * Admin-only: remove product images from Storage (when hosted in the products
 * bucket), then delete the products row.
 */
export async function deleteProduct(
  productId: string
): Promise<ProductActionResult> {
  const idParsed = uuidSchema.safeParse(productId);
  if (!idParsed.success) {
    return { ok: false, message: idParsed.error.issues[0]?.message ?? "Invalid id" };
  }

  const auth = await requireAdmin();
  if (auth.error || !auth.user) {
    return { ok: false, message: auth.error ?? "Unauthorized" };
  }

  const { data: product, error: fetchError } = await auth.supabase
    .from("products")
    .select("id, image_url, image_urls")
    .eq("id", idParsed.data)
    .maybeSingle();

  if (fetchError) {
    return { ok: false, message: fetchError.message };
  }
  if (!product) {
    return { ok: false, message: "Product not found." };
  }

  const paths = collectImageUrls(product)
    .map((url) => storageObjectPathFromUrl(url, PRODUCT_IMAGE_BUCKET))
    .filter((p): p is string => Boolean(p));

  if (paths.length > 0) {
    const { error: storageError } = await auth.supabase.storage
      .from(PRODUCT_IMAGE_BUCKET)
      .remove(paths);
    // Best-effort: missing objects / empty bucket should not block DB delete.
    if (storageError) {
      console.warn(
        "[deleteProduct] storage cleanup:",
        storageError.message,
        paths
      );
    }
  }

  const { error: deleteError } = await auth.supabase
    .from("products")
    .delete()
    .eq("id", idParsed.data);

  if (deleteError) {
    return { ok: false, message: deleteError.message };
  }

  revalidatePath("/[locale]/admin/inventory", "page");
  revalidatePath("/[locale]/admin", "page");
  revalidatePath("/[locale]", "page");
  revalidatePath("/[locale]/products", "page");
  revalidatePath("/[locale]/search", "page");
  revalidatePath(`/[locale]/products/${idParsed.data}`, "page");
  revalidatePath("/", "layout");

  return { ok: true };
}
