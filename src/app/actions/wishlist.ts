"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type WishlistToggleResult =
  | { ok: true; wishlisted: boolean }
  | { ok: false; message: string; code?: "unauthenticated" };

/** Toggle wishlist membership for the signed-in user. */
export async function toggleWishlist(
  productId: string
): Promise<WishlistToggleResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: "Sign in to save favorites",
      code: "unauthenticated",
    };
  }

  const id = productId.trim();
  if (!id) {
    return { ok: false, message: "Invalid product" };
  }

  const { data: existing, error: findError } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", id)
    .maybeSingle();

  if (findError) {
    return { ok: false, message: findError.message };
  }

  if (existing) {
    const { error } = await supabase
      .from("wishlists")
      .delete()
      .eq("id", existing.id);
    if (error) return { ok: false, message: error.message };
    revalidatePath("/", "layout");
    revalidatePath("/[locale]/wishlist", "page");
    revalidatePath("/[locale]/products/[id]", "page");
    return { ok: true, wishlisted: false };
  }

  const { error } = await supabase.from("wishlists").insert({
    user_id: user.id,
    product_id: id,
  });

  if (error) return { ok: false, message: error.message };
  revalidatePath("/", "layout");
  revalidatePath("/[locale]/wishlist", "page");
  revalidatePath("/[locale]/products/[id]", "page");
  return { ok: true, wishlisted: true };
}
