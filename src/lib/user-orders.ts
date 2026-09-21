import { createClient } from "@/lib/supabase/server";
import type { LoyaltyTier, OrderWithItems, Profile } from "@/types/database";

export async function getMyOrders(): Promise<OrderWithItems[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        id,
        quantity,
        price_at_time,
        product_id,
        products (
          id,
          name_en,
          name_mm,
          image_url
        )
      ),
      order_status_history (
        id,
        status,
        note,
        created_at
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    ...row,
    total_amount: Number(row.total_amount),
    order_items: Array.isArray(row.order_items)
      ? row.order_items.map(
          (item: {
            id: string;
            quantity: number;
            price_at_time: number;
            product_id: string;
            products?: unknown;
          }) => ({
            ...item,
            price_at_time: Number(item.price_at_time),
          })
        )
      : [],
  })) as OrderWithItems[];
}

export async function getMyProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!data) {
    return {
      id: user.id,
      role: "user",
      phone_number: "",
      address: "",
      created_at: user.created_at,
      email: user.email,
    };
  }

  return {
    ...data,
    lifetime_spend: Number(data.lifetime_spend ?? 0),
    email: user.email,
  } as Profile;
}

export async function getLoyaltyTiers(): Promise<LoyaltyTier[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("loyalty_tiers")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error(error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    ...row,
    spend_threshold: Number(row.spend_threshold),
    discount_percentage: Number(row.discount_percentage),
  })) as LoyaltyTier[];
}

/** Map of tier_id → selected category ids from loyalty_tier_categories */
export async function getLoyaltyTierCategoryMap(): Promise<
  Record<string, string[]>
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("loyalty_tier_categories")
    .select("tier_id, category_id");

  if (error) {
    console.error(error.message);
    return {};
  }

  const map: Record<string, string[]> = {};
  for (const row of data ?? []) {
    const tierId = String(row.tier_id);
    const categoryId = String(row.category_id);
    if (!map[tierId]) map[tierId] = [];
    map[tierId].push(categoryId);
  }
  return map;
}

export async function getAdminCustomers() {
  const supabase = await createClient();

  const [{ data: profiles, error }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select(
        "id, user_id, total_amount, status, tracking_number, courier_name, created_at, customer_info"
      )
      .not("user_id", "is", null)
      .order("created_at", { ascending: false }),
  ]);

  if (error) {
    console.error(error.message);
    return [];
  }

  return (profiles ?? []).map((profile) => {
    const userOrders = (orders ?? []).filter((o) => o.user_id === profile.id);
    const emailFromOrder = userOrders[0]?.customer_info as
      | { email?: string }
      | undefined;

    return {
      profile: {
        ...profile,
        lifetime_spend: Number(profile.lifetime_spend ?? 0),
        email: emailFromOrder?.email,
      } as Profile,
      orders: userOrders.map((o) => ({
        ...o,
        total_amount: Number(o.total_amount),
        customer_info: o.customer_info,
      })),
    };
  });
}
