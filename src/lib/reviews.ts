import { createClient } from "@/lib/supabase/server";
import type { Review } from "@/types/database";

export type ReviewSummary = {
  average: number;
  count: number;
};

function mapReview(row: Record<string, unknown>): Review {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    product_id: String(row.product_id),
    order_id: row.order_id ? String(row.order_id) : null,
    rating: Number(row.rating),
    comment: String(row.comment ?? ""),
    status: (row.status as Review["status"]) ?? "approved",
    reviewer_name: (row.reviewer_name as string | null) ?? null,
    reviewer_email: (row.reviewer_email as string | null) ?? null,
    created_at: String(row.created_at),
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
  };
}

/** Approved reviews for a product (storefront). */
export async function getProductReviews(productId: string): Promise<Review[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getProductReviews:", error.message);
    return [];
  }

  return (data ?? []).map((row) => mapReview(row as Record<string, unknown>));
}

export function summarizeReviews(reviews: Review[]): ReviewSummary {
  if (reviews.length === 0) return { average: 0, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return {
    average: Math.round((sum / reviews.length) * 10) / 10,
    count: reviews.length,
  };
}

/** Batch average + count of approved reviews for product cards. */
export async function getReviewSummariesByProductIds(
  productIds: string[]
): Promise<Record<string, ReviewSummary>> {
  const ids = [...new Set(productIds.filter(Boolean))];
  const empty: Record<string, ReviewSummary> = {};
  if (ids.length === 0) return empty;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("product_id, rating")
    .in("product_id", ids)
    .eq("status", "approved");

  if (error) {
    console.error("getReviewSummariesByProductIds:", error.message);
    return empty;
  }

  const buckets = new Map<string, { sum: number; count: number }>();
  for (const row of data ?? []) {
    const pid = String(row.product_id);
    const cur = buckets.get(pid) ?? { sum: 0, count: 0 };
    cur.sum += Number(row.rating);
    cur.count += 1;
    buckets.set(pid, cur);
  }

  const out: Record<string, ReviewSummary> = {};
  for (const id of ids) {
    const b = buckets.get(id);
    out[id] = b
      ? { average: Math.round((b.sum / b.count) * 10) / 10, count: b.count }
      : { average: 0, count: 0 };
  }
  return out;
}
