"use server";

import { createClient } from "@/lib/supabase/server";
import type { DiscountType } from "@/types/database";

export type ValidatedCoupon = {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  minSpend: number | null;
};

export type ValidateCouponResult =
  | { ok: true; coupon: ValidatedCoupon }
  | {
      ok: false;
      message: string;
      code?: string;
      minSpend?: number | null;
    };

function computeDiscountAmount(
  discountType: DiscountType,
  discountValue: number,
  cartTotal: number
) {
  if (discountType === "percentage") {
    return Math.min(
      cartTotal,
      Math.round((cartTotal * Number(discountValue)) / 100)
    );
  }
  // "flat" / fixed amount
  return Math.min(cartTotal, Math.round(Number(discountValue)));
}

/** Validate a promo code against the current merchandise subtotal. */
export async function validateCoupon(
  code: string,
  cartTotal: number
): Promise<ValidateCouponResult> {
  const raw = code.trim();
  if (!raw) {
    return { ok: false, message: "Enter a promo code", code: "empty" };
  }
  if (!(cartTotal >= 0) || !Number.isFinite(cartTotal)) {
    return { ok: false, message: "Invalid cart total", code: "invalid_total" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .ilike("code", raw)
    .maybeSingle();

  if (error) {
    return { ok: false, message: error.message };
  }
  if (!data) {
    return { ok: false, message: "Promo code not found", code: "not_found" };
  }

  if (!data.is_active) {
    return { ok: false, message: "This promo code is inactive", code: "inactive" };
  }
  if (data.expires_at && new Date(data.expires_at) <= new Date()) {
    return { ok: false, message: "This promo code has expired", code: "expired" };
  }
  if (
    data.usage_limit != null &&
    Number(data.times_used) >= Number(data.usage_limit)
  ) {
    return {
      ok: false,
      message: "This promo code has reached its usage limit",
      code: "limit",
    };
  }

  const minSpend =
    data.min_spend == null ? null : Number(data.min_spend);
  if (minSpend != null && cartTotal < minSpend) {
    return {
      ok: false,
      message: `Minimum spend is ${minSpend}`,
      code: "min_spend",
      minSpend,
    };
  }

  const discountType = data.discount_type as DiscountType;
  const discountValue = Number(data.discount_value);
  const discountAmount = computeDiscountAmount(
    discountType,
    discountValue,
    cartTotal
  );

  if (discountAmount <= 0) {
    return { ok: false, message: "Coupon does not apply", code: "zero" };
  }

  return {
    ok: true,
    coupon: {
      id: String(data.id),
      code: String(data.code),
      discountType,
      discountValue,
      discountAmount,
      minSpend,
    },
  };
}

export type SyncCartItemInput = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

/** Upsert the signed-in user's saved cart (for abandoned-cart recovery). */
export async function syncSavedCart(
  items: SyncCartItemInput[]
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "unauthenticated" };
  }

  if (items.length === 0) {
    await supabase.from("saved_carts").delete().eq("user_id", user.id);
    return { ok: true };
  }

  const { data: cart, error: cartError } = await supabase
    .from("saved_carts")
    .upsert(
      { user_id: user.id, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    )
    .select("id")
    .single();

  if (cartError || !cart) {
    return { ok: false, message: cartError?.message ?? "Failed to save cart" };
  }

  await supabase.from("saved_cart_items").delete().eq("cart_id", cart.id);

  const rows = items.map((i) => ({
    cart_id: cart.id,
    product_id: i.productId,
    quantity: i.quantity,
    unit_price: i.unitPrice,
  }));

  const { error: itemsError } = await supabase
    .from("saved_cart_items")
    .insert(rows);

  if (itemsError) {
    return { ok: false, message: itemsError.message };
  }

  return { ok: true };
}

export async function clearSavedCart(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("saved_carts").delete().eq("user_id", user.id);
}
