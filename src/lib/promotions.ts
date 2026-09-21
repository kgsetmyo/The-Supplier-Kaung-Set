"use server";

import { createClient } from "@/lib/supabase/server";
import { validateCoupon } from "@/lib/coupons";

export type AppliedPromo = {
  /** promotions.id or coupons.id */
  id: string;
  code: string;
  discountPercentage: number;
  discountAmount: number;
  /** When set, order.coupon_id can be linked for legacy coupon usage tracking. */
  couponId: string | null;
};

export type ValidatePromoResult =
  | { ok: true; promo: AppliedPromo }
  | { ok: false; message: string; code?: string };

/**
 * Validate a checkout promo code.
 * Prefers the `promotions` table (percentage), then falls back to `coupons`.
 */
export async function validatePromoCode(
  code: string,
  cartTotal: number
): Promise<ValidatePromoResult> {
  const raw = code.trim();
  if (!raw) {
    return { ok: false, message: "Enter a promo code", code: "empty" };
  }
  if (!(cartTotal >= 0) || !Number.isFinite(cartTotal)) {
    return { ok: false, message: "Invalid cart total", code: "invalid_total" };
  }

  const supabase = await createClient();
  const { data: promo, error } = await supabase
    .from("promotions")
    .select("id, code, discount_percentage, is_active")
    .ilike("code", raw)
    .maybeSingle();

  if (error && !/relation .* does not exist/i.test(error.message)) {
    // Table missing → fall through to coupons
    console.error("validatePromoCode promotions:", error.message);
  }

  if (promo) {
    if (!promo.is_active) {
      return {
        ok: false,
        message: "Invalid or expired code",
        code: "inactive",
      };
    }
    const pct = Number(promo.discount_percentage);
    if (!(pct > 0) || pct > 100) {
      return { ok: false, message: "Invalid or expired code", code: "invalid" };
    }
    const discountAmount = Math.min(
      cartTotal,
      Math.round((cartTotal * pct) / 100)
    );
    if (discountAmount <= 0) {
      return { ok: false, message: "Invalid or expired code", code: "zero" };
    }
    return {
      ok: true,
      promo: {
        id: String(promo.id),
        code: String(promo.code).toUpperCase(),
        discountPercentage: pct,
        discountAmount,
        couponId: null,
      },
    };
  }

  // Fallback: existing coupons engine
  const couponResult = await validateCoupon(raw, cartTotal);
  if (!couponResult.ok) {
    if (
      couponResult.code === "not_found" ||
      couponResult.code === "inactive" ||
      couponResult.code === "expired"
    ) {
      return {
        ok: false,
        message: "Invalid or expired code",
        code: couponResult.code,
      };
    }
    return {
      ok: false,
      message: couponResult.message,
      code: couponResult.code,
    };
  }

  const c = couponResult.coupon;
  const discountPercentage =
    c.discountType === "percentage" ? Number(c.discountValue) : 0;

  return {
    ok: true,
    promo: {
      id: c.id,
      code: c.code.toUpperCase(),
      discountPercentage,
      discountAmount: c.discountAmount,
      couponId: c.id,
    },
  };
}
