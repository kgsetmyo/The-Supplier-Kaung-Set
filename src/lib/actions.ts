"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/types/database";

export type UpdateFulfillmentInput = {
  orderId: string;
  status: OrderStatus;
  courierName: string;
  trackingNumber: string;
};

export type ActionResult =
  | { ok: true }
  | { ok: false; message: string };

async function requireAdminClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" as const, supabase, user: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return { error: "Forbidden" as const, supabase, user };
  }
  return { error: null, supabase, user };
}

export async function updateOrderFulfillment(
  input: UpdateFulfillmentInput
): Promise<ActionResult> {
  const auth = await requireAdminClient();
  if (auth.error || !auth.user) {
    return { ok: false, message: auth.error ?? "Unauthorized" };
  }

  const tracking = input.trackingNumber.trim().toUpperCase();
  if (!tracking) {
    return { ok: false, message: "Tracking number is required" };
  }

  const { data: order, error } = await auth.supabase
    .from("orders")
    .update({
      status: input.status,
      courier_name: input.courierName.trim() || null,
      tracking_number: tracking,
    })
    .eq("id", input.orderId)
    .select("id, tracking_number, courier_name, customer_info, status")
    .single();

  if (error) {
    return { ok: false, message: error.message };
  }

  if (input.status === "shipped" && order) {
    const info = (order.customer_info ?? {}) as {
      email?: string;
      name?: string;
    };
    const { sendOrderShippedEmail } = await import("@/lib/email");
    await sendOrderShippedEmail({
      to: info.email ?? "",
      customerName: info.name,
      orderId: String(order.id),
      trackingNumber: String(order.tracking_number ?? tracking),
      courierName: (order.courier_name as string | null) ?? null,
    });
  }

  revalidatePath("/[locale]/admin/orders", "page");
  revalidatePath("/[locale]/account/orders", "page");
  revalidatePath("/[locale]/account", "page");
  revalidatePath("/[locale]/profile", "page");
  return { ok: true };
}

export async function updateOrderPaymentStatus(
  orderId: string,
  paymentStatus: "pending" | "verified" | "rejected"
): Promise<ActionResult> {
  const auth = await requireAdminClient();
  if (auth.error || !auth.user) {
    return { ok: false, message: auth.error ?? "Unauthorized" };
  }

  const id = orderId.trim();
  if (!id) return { ok: false, message: "Invalid order" };

  const patch: Record<string, unknown> = {
    payment_status: paymentStatus,
  };
  // Auto-advance fulfillment when KBZ payment is verified
  if (paymentStatus === "verified") {
    patch.status = "processing";
  }

  const { error } = await auth.supabase
    .from("orders")
    .update(patch)
    .eq("id", id);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/[locale]/admin/orders", "page");
  return { ok: true };
}

export type BulkOrderAction = "verify_kbz" | "mark_shipped";

export type BulkOrdersResult =
  | { ok: true; updated: number }
  | { ok: false; message: string };

/** Bulk-update selected orders (KBZ verify or mark shipped). */
export async function bulkUpdateOrders(
  orderIds: string[],
  action: BulkOrderAction
): Promise<BulkOrdersResult> {
  const auth = await requireAdminClient();
  if (auth.error || !auth.user) {
    return { ok: false, message: auth.error ?? "Unauthorized" };
  }

  const ids = [...new Set(orderIds.map((id) => id.trim()).filter(Boolean))];
  if (ids.length === 0) {
    return { ok: false, message: "No orders selected" };
  }

  if (action === "verify_kbz") {
    const { data, error } = await auth.supabase
      .from("orders")
      .update({
        payment_status: "verified",
        status: "processing",
      })
      .in("id", ids)
      .select("id");

    if (error) return { ok: false, message: error.message };

    revalidatePath("/[locale]/admin/orders", "page");
    return { ok: true, updated: data?.length ?? ids.length };
  }

  if (action === "mark_shipped") {
    const { data: orders, error: fetchError } = await auth.supabase
      .from("orders")
      .select("id, tracking_number, courier_name, customer_info, status")
      .in("id", ids);

    if (fetchError) return { ok: false, message: fetchError.message };

    const { data, error } = await auth.supabase
      .from("orders")
      .update({ status: "shipped" })
      .in("id", ids)
      .select("id");

    if (error) return { ok: false, message: error.message };

    const { sendOrderShippedEmail } = await import("@/lib/email");
    for (const order of orders ?? []) {
      if (String(order.status) === "shipped") continue;
      const info = (order.customer_info ?? {}) as {
        email?: string;
        name?: string;
      };
      const tracking = String(order.tracking_number ?? "").trim();
      if (!info.email || !tracking) continue;
      await sendOrderShippedEmail({
        to: info.email,
        customerName: info.name,
        orderId: String(order.id),
        trackingNumber: tracking,
        courierName: (order.courier_name as string | null) ?? null,
      });
    }

    revalidatePath("/[locale]/admin/orders", "page");
    revalidatePath("/[locale]/account/orders", "page");
    revalidatePath("/[locale]/account", "page");
    return { ok: true, updated: data?.length ?? ids.length };
  }

  return { ok: false, message: "Unknown action" };
}

export async function updateLoyaltyTierConfig(
  tierId: string,
  spendThreshold: number,
  discountPercentage: number,
  categoryIds: string[] = []
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") return { ok: false, message: "Forbidden" };

  const { error } = await supabase
    .from("loyalty_tiers")
    .update({
      spend_threshold: spendThreshold,
      discount_percentage: discountPercentage,
      updated_at: new Date().toISOString(),
    })
    .eq("id", tierId);

  if (error) return { ok: false, message: error.message };

  const { error: deleteError } = await supabase
    .from("loyalty_tier_categories")
    .delete()
    .eq("tier_id", tierId);

  if (deleteError) return { ok: false, message: deleteError.message };

  const uniqueIds = [...new Set(categoryIds.filter(Boolean))];
  if (uniqueIds.length > 0) {
    const { error: insertError } = await supabase
      .from("loyalty_tier_categories")
      .insert(
        uniqueIds.map((category_id) => ({
          tier_id: tierId,
          category_id,
        }))
      );

    if (insertError) return { ok: false, message: insertError.message };
  }

  revalidatePath("/[locale]/admin/loyalty", "page");
  return { ok: true };
}

export async function updateMyProfile(input: {
  phoneNumber: string;
  address: string;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Unauthorized" };

  const { error } = await supabase
    .from("profiles")
    .update({
      phone_number: input.phoneNumber.trim(),
      address: input.address.trim(),
    })
    .eq("id", user.id);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/[locale]/profile", "page");
  revalidatePath("/[locale]/checkout", "page");
  return { ok: true };
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, error: "Unauthorized" as const };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return { supabase, error: "Forbidden" as const };
  }

  return { supabase, error: null };
}

export type CreateCouponInput = {
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  expiresAt: string | null;
  usageLimit: number | null;
  productIds: string[];
  categoryIds: string[];
  isActive?: boolean;
};

/**
 * Inserts coupon + eligibility rows. Rolls back the coupon if eligibility fails.
 */
export async function createCoupon(
  input: CreateCouponInput
): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (auth.error) return { ok: false, message: auth.error };

  const code = input.code.trim().toUpperCase();
  if (!code) return { ok: false, message: "Coupon code is required" };
  if (!(input.discountValue > 0)) {
    return { ok: false, message: "Discount value must be greater than 0" };
  }
  if (input.discountType === "percentage" && input.discountValue > 100) {
    return { ok: false, message: "Percentage cannot exceed 100" };
  }

  const { data: coupon, error: couponError } = await auth.supabase
    .from("coupons")
    .insert({
      code,
      discount_type: input.discountType,
      discount_value: input.discountValue,
      is_active: input.isActive ?? true,
      expires_at: input.expiresAt || null,
      usage_limit: input.usageLimit,
      times_used: 0,
    })
    .select("id")
    .single();

  if (couponError || !coupon) {
    return { ok: false, message: couponError?.message ?? "Failed to create coupon" };
  }

  const eligibilityRows = [
    ...input.productIds.map((product_id) => ({
      coupon_id: coupon.id,
      product_id,
      category_id: null as string | null,
    })),
    ...input.categoryIds.map((category_id) => ({
      coupon_id: coupon.id,
      product_id: null as string | null,
      category_id,
    })),
  ];

  if (eligibilityRows.length > 0) {
    const { error: eligibilityError } = await auth.supabase
      .from("coupon_eligibility")
      .insert(eligibilityRows);

    if (eligibilityError) {
      await auth.supabase.from("coupons").delete().eq("id", coupon.id);
      return { ok: false, message: eligibilityError.message };
    }
  }

  revalidatePath("/[locale]/admin/coupons", "page");
  return { ok: true };
}

export async function setCouponActive(
  couponId: string,
  isActive: boolean
): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (auth.error) return { ok: false, message: auth.error };

  const { error } = await auth.supabase
    .from("coupons")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", couponId);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/[locale]/admin/coupons", "page");
  return { ok: true };
}

export type SubmitReviewResult =
  | { ok: true }
  | { ok: false; message: string; code?: "unauthenticated" | "invalid" };

/** Create or update the signed-in user's review for a product. */
export async function submitProductReview(input: {
  productId: string;
  rating: number;
  comment: string;
}): Promise<SubmitReviewResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: "Sign in to leave a review",
      code: "unauthenticated",
    };
  }

  const productId = input.productId.trim();
  const rating = Math.round(Number(input.rating));
  const comment = input.comment.trim();

  if (!productId || rating < 1 || rating > 5) {
    return { ok: false, message: "Invalid rating", code: "invalid" };
  }
  if (!comment) {
    return { ok: false, message: "Comment is required", code: "invalid" };
  }

  // Prefer linking a purchase order that includes this product
  let orderId: string | null = null;
  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_items(product_id)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(25);

  for (const order of orders ?? []) {
    const items = (order.order_items ?? []) as { product_id?: string }[];
    if (items.some((i) => String(i.product_id) === productId)) {
      orderId = String(order.id);
      break;
    }
  }

  const reviewerName =
    (user.user_metadata?.full_name as string | undefined)?.trim() ||
    user.email?.split("@")[0] ||
    "Customer";
  const reviewerEmail = user.email ?? null;

  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("reviews")
      .update({
        rating,
        comment,
        order_id: orderId,
        reviewer_name: reviewerName,
        reviewer_email: reviewerEmail,
        status: "pending",
      })
      .eq("id", existing.id);
    if (error) return { ok: false, message: error.message };
  } else {
    const { error } = await supabase.from("reviews").insert({
      user_id: user.id,
      product_id: productId,
      order_id: orderId,
      rating,
      comment,
      reviewer_name: reviewerName,
      reviewer_email: reviewerEmail,
      status: "pending",
    });
    if (error) return { ok: false, message: error.message };
  }

  revalidatePath(`/[locale]/products/${productId}`, "page");
  return { ok: true };
}

