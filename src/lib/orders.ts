"use client";

import { createClient } from "@/lib/supabase/client";
import type {
  CustomerInfo,
  PaymentMethod,
  PaymentPlan,
  Product,
  TrackedOrder,
} from "@/types/database";
import { generateTrackingNumber, getUnitPrice, isKbzPaymentMethod } from "@/types/database";

export type PlaceOrderInput = {
  customer: CustomerInfo;
  items: { product: Product; quantity: number; unitPrice?: number }[];
  paymentMethod: PaymentMethod;
  paymentPlan: PaymentPlan;
  /** Final charged total (merchandise − coupon + shipping). */
  totalAmount?: number;
  /** Applied coupon (validated server-side before submit). */
  couponId?: string | null;
  /** Coupon discount amount in MMK. */
  discountApplied?: number;
  /** KBZ transaction reference (optional if screenshot provided) */
  paymentReference?: string;
  /** KBZ payment receipt / screenshot file */
  paymentReceipt?: File | null;
};

export type PlaceOrderResult =
  | { ok: true; orderId: string; trackingNumber: string }
  | { ok: false; message: string };

async function uploadPaymentReceipt(
  file: File
): Promise<{ url: string } | { error: string }> {
  const supabase = createClient();
  const ext =
    file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ||
    "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("payment_receipts")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

  if (error) {
    return { error: error.message };
  }

  const { data } = supabase.storage.from("payment_receipts").getPublicUrl(path);
  return { url: data.publicUrl };
}

/** Inserts order + items with payment details and optional KBZ receipt upload. */
export async function placeOrder(
  input: PlaceOrderInput
): Promise<PlaceOrderResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isKbzPaymentMethod(input.paymentMethod)) {
    const hasRef = Boolean(input.paymentReference?.trim());
    const hasFile = Boolean(input.paymentReceipt);
    if (!hasRef && !hasFile) {
      return {
        ok: false,
        message: "kbz_proof_required",
      };
    }
  }

  let paymentScreenshotUrl: string | null = null;
  if (isKbzPaymentMethod(input.paymentMethod) && input.paymentReceipt) {
    const uploaded = await uploadPaymentReceipt(input.paymentReceipt);
    if ("error" in uploaded) {
      return { ok: false, message: uploaded.error };
    }
    paymentScreenshotUrl = uploaded.url;
  }

  const merchandise = input.items.reduce((sum, item) => {
    const unit =
      typeof item.unitPrice === "number"
        ? item.unitPrice
        : getUnitPrice(item.product);
    return sum + unit * item.quantity;
  }, 0);
  const total =
    typeof input.totalAmount === "number" && input.totalAmount >= 0
      ? input.totalAmount
      : merchandise;

  const discountApplied = Math.max(0, Number(input.discountApplied ?? 0));
  const couponId = input.couponId?.trim() || null;

  const orderItems = input.items.map((item) => {
    const unit =
      typeof item.unitPrice === "number"
        ? item.unitPrice
        : getUnitPrice(item.product);
    return {
      product_id: item.product.id,
      quantity: item.quantity,
      price_at_time: unit,
    };
  });

  let lastError = "Failed to create order";

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const trackingNumber = generateTrackingNumber();

    // SECURITY DEFINER RPC so guests (anon) can checkout without SELECT RLS blocks.
    const { data, error } = await supabase.rpc("create_storefront_order", {
      p_customer_info: input.customer,
      p_items: orderItems,
      p_total_amount: total,
      p_payment_method: input.paymentMethod,
      p_payment_plan: input.paymentPlan,
      p_payment_screenshot_url: paymentScreenshotUrl,
      p_payment_reference: isKbzPaymentMethod(input.paymentMethod)
        ? input.paymentReference?.trim() || null
        : null,
      p_coupon_id: couponId,
      p_discount_applied: discountApplied,
      p_tracking_number: trackingNumber,
    });

    if (error) {
      lastError = error.message || lastError;
      // Unique tracking collision — retry with a new number
      if (error.code === "23505" || /tracking/i.test(error.message)) {
        continue;
      }
      return { ok: false, message: lastError };
    }

    const row = data as {
      order_id?: string;
      tracking_number?: string;
    } | null;

    const orderId = row?.order_id ? String(row.order_id) : "";
    const tracking = row?.tracking_number
      ? String(row.tracking_number)
      : trackingNumber;

    if (!orderId) {
      return { ok: false, message: "Failed to create order" };
    }

    if (user?.id) {
      await supabase.from("saved_carts").delete().eq("user_id", user.id);
    }

    return {
      ok: true,
      orderId,
      trackingNumber: tracking,
    };
  }

  return { ok: false, message: lastError };
}

export async function trackOrderByNumber(
  trackingNumber: string
): Promise<TrackedOrder | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_order_by_tracking", {
    p_tracking: trackingNumber.trim(),
  });

  if (error) {
    console.error(error.message);
    return null;
  }

  if (!data) return null;

  const row = data as TrackedOrder;
  return {
    ...row,
    total_amount: Number(row.total_amount),
    items: (row.items ?? []).map((item) => ({
      ...item,
      price_at_time: Number(item.price_at_time),
    })),
  };
}
