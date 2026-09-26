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
  | { ok: true; mode: "deleted" | "unlisted" }
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

function revalidateProductPaths(productId: string) {
  revalidatePath("/[locale]/admin/inventory", "page");
  revalidatePath("/[locale]/admin", "page");
  revalidatePath("/[locale]", "page");
  revalidatePath("/[locale]/products", "page");
  revalidatePath("/[locale]/search", "page");
  revalidatePath(`/[locale]/products/${productId}`, "page");
  revalidatePath("/", "layout");
}

/**
 * Admin-only delete.
 * - No order history → remove storage images + hard-delete the row.
 * - Referenced by order_items → unlist (is_active=false) so order history stays intact.
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
    .select("id, image_url, image_urls, is_active")
    .eq("id", idParsed.data)
    .maybeSingle();

  if (fetchError) {
    return { ok: false, message: fetchError.message };
  }
  if (!product) {
    return { ok: false, message: "Product not found." };
  }

  const { count: orderItemCount, error: countError } = await auth.supabase
    .from("order_items")
    .select("id", { count: "exact", head: true })
    .eq("product_id", idParsed.data);

  if (countError) {
    return { ok: false, message: countError.message };
  }

  const referencedByOrders = (orderItemCount ?? 0) > 0;

  if (referencedByOrders) {
    const { error: unlistError } = await auth.supabase
      .from("products")
      .update({ is_active: false, stock_quantity: 0 })
      .eq("id", idParsed.data);

    if (unlistError) {
      // Column may be missing if migration 031 was not applied yet.
      if (/is_active/i.test(unlistError.message)) {
        return {
          ok: false,
          message:
            "This product is used in past orders, so it cannot be deleted. Run migration 031_product_is_active.sql in Supabase, then try again to unlist it from the store.",
        };
      }
      return { ok: false, message: unlistError.message };
    }

    revalidateProductPaths(idParsed.data);
    return { ok: true, mode: "unlisted" };
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
    if (/order_items_product_id_fkey|foreign key/i.test(deleteError.message)) {
      return {
        ok: false,
        message:
          "This product is used in past orders, so it cannot be permanently deleted. Run migration 031_product_is_active.sql, then try Delete again to unlist it.",
      };
    }
    return { ok: false, message: deleteError.message };
  }

  revalidateProductPaths(idParsed.data);
  return { ok: true, mode: "deleted" };
}

/** Admin: put an unlisted product back on the storefront. */
export async function restoreProduct(
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

  const { error } = await auth.supabase
    .from("products")
    .update({ is_active: true })
    .eq("id", idParsed.data);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidateProductPaths(idParsed.data);
  return { ok: true, mode: "unlisted" };
}
