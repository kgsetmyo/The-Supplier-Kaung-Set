import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/database";
import { getProductsByIds } from "@/lib/products";

/** Product IDs currently wishlisted by the signed-in user (empty if guest). */
export async function getWishlistProductIds(): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("wishlists")
    .select("product_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getWishlistProductIds:", error.message);
    return [];
  }

  return (data ?? []).map((row) => String(row.product_id));
}

/**
 * Products joined via wishlists for the signed-in user (newest saves first).
 */
export async function getWishlistProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("wishlists")
    .select("product_id, created_at, products(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getWishlistProducts:", error.message);
    // Fallback if embed fails
    const ids = await getWishlistProductIds();
    return getProductsByIds(ids);
  }

  const ids = (data ?? [])
    .map((row) => String(row.product_id))
    .filter(Boolean);

  // Prefer mapped products via getProductsByIds for consistent Product shape
  return getProductsByIds(ids);
}
