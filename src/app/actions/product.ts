"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { userHasAdminAccess } from "@/lib/admin-access";
import {
  PRODUCT_IMAGE_BUCKET,
  collectProductImageUrls,
  storageObjectPathFromUrl,
} from "@/lib/product-storage";

export type ProductActionResult =
  | { ok: true }
  | { ok: false; message: string };

const productIdSchema = z
  .string()
  .trim()
  .min(1, "Invalid product id.")
  .regex(
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    "Invalid product id."
  );

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
  const idParsed = productIdSchema.safeParse(productId);
  if (!idParsed.success) {
    return {
      ok: false,
      message: idParsed.error.issues[0]?.message ?? "Invalid id",
    };
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

  const paths = collectProductImageUrls(product)
    .map((url) => storageObjectPathFromUrl(url, PRODUCT_IMAGE_BUCKET))
    .filter((p): p is string => Boolean(p));

  if (paths.length > 0) {
    const { error: storageError } = await auth.supabase.storage
      .from(PRODUCT_IMAGE_BUCKET)
      .remove(paths);
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
