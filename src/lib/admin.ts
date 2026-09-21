import { createClient } from "@/lib/supabase/server";
import type {
  Category,
  Coupon,
  Order,
  Product,
  StoreSettings,
} from "@/types/database";

export async function getAdminStats() {
  const supabase = await createClient();

  const [
    { count: totalOrders },
    { count: pendingOrders },
    { count: totalProducts },
    { count: totalCustomers },
    { data: products },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("*")
      .lte("stock_quantity", 10)
      .order("stock_quantity", { ascending: true }),
  ]);

  return {
    totalOrders: totalOrders ?? 0,
    pendingOrders: pendingOrders ?? 0,
    totalProducts: totalProducts ?? 0,
    totalCustomers: totalCustomers ?? 0,
    lowStock: (products ?? []) as Product[],
  };
}

export async function getAdminOrders() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        *,
        products (*)
      ),
      order_status_history (
        id,
        status,
        note,
        created_at
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error.message);
    return [];
  }

  return (data ?? []) as (Order & {
    order_items: {
      id: string;
      quantity: number;
      price_at_time: number;
      product_id: string;
      products: Product | null;
    }[];
  })[];
}

export async function getAdminProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    ...row,
    price: Number(row.price),
    discount_price:
      row.discount_price == null ? null : Number(row.discount_price),
    stock_quantity: Number(row.stock_quantity),
    category_id: (row.category_id as string | null) ?? null,
    brand_id: (row.brand_id as string | null) ?? null,
    image_url: (row.image_url as string | null) ?? null,
    image_urls: Array.isArray(row.image_urls)
      ? (row.image_urls as string[]).map(String).filter(Boolean)
      : [],
    authenticity:
      row.authenticity === "OEM" ||
      row.authenticity === "Replica" ||
      row.authenticity === "Genuine"
        ? row.authenticity
        : "Genuine",
  })) as Product[];
}

export async function getStoreSettingsAdmin(): Promise<StoreSettings | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("store_settings")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as StoreSettings | null;
}

export async function getAdminCoupons(): Promise<Coupon[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coupons")
    .select(
      `
      *,
      coupon_eligibility (
        id,
        coupon_id,
        product_id,
        category_id
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    ...row,
    discount_value: Number(row.discount_value),
    times_used: Number(row.times_used ?? 0),
    usage_limit: row.usage_limit == null ? null : Number(row.usage_limit),
    min_spend: row.min_spend == null ? null : Number(row.min_spend),
  })) as Coupon[];
}

export type AbandonedCartItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
  nameEn: string;
  nameMm: string;
};

export type AbandonedCartRow = {
  id: string;
  userId: string;
  customerName: string;
  phone: string | null;
  email: string | null;
  cartValue: number;
  updatedAt: string;
  items: AbandonedCartItem[];
};

/** Carts idle >2h with items and no order placed after last cart update. */
export async function getAbandonedCarts(): Promise<AbandonedCartRow[]> {
  const supabase = await createClient();
  const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  const { data: carts, error } = await supabase
    .from("saved_carts")
    .select(
      `
      id,
      user_id,
      updated_at,
      saved_cart_items (
        product_id,
        quantity,
        unit_price,
        products (
          name_en,
          name_mm
        )
      )
    `
    )
    .lt("updated_at", cutoff)
    .order("updated_at", { ascending: true });

  if (error || !carts?.length) {
    if (error) console.error(error.message);
    return [];
  }

  const userIds = [...new Set(carts.map((c) => String(c.user_id)))];

  const [{ data: profiles }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("id, phone_number").in("id", userIds),
    supabase
      .from("orders")
      .select("user_id, created_at, customer_info")
      .in("user_id", userIds)
      .order("created_at", { ascending: false }),
  ]);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [String(p.id), p] as const)
  );

  type ContactSnap = {
    name?: string;
    phone?: string;
    email?: string;
  };

  const latestOrderByUser = new Map<string, string>();
  const contactByUser = new Map<string, ContactSnap>();

  for (const o of orders ?? []) {
    if (!o.user_id) continue;
    const uid = String(o.user_id);
    if (!latestOrderByUser.has(uid)) {
      latestOrderByUser.set(uid, String(o.created_at));
    }
    if (!contactByUser.has(uid)) {
      const info = (o.customer_info ?? {}) as ContactSnap;
      contactByUser.set(uid, {
        name: info.name,
        phone: info.phone,
        email: info.email,
      });
    }
  }

  const rows: AbandonedCartRow[] = [];

  for (const cart of carts) {
    const rawItems = (cart.saved_cart_items ?? []) as unknown as {
      product_id: string;
      quantity: number;
      unit_price: number;
      products:
        | { name_en: string; name_mm: string }
        | { name_en: string; name_mm: string }[]
        | null;
    }[];

    if (rawItems.length === 0) continue;

    const userId = String(cart.user_id);
    const updatedAt = String(cart.updated_at);
    const lastOrderAt = latestOrderByUser.get(userId);
    if (lastOrderAt && new Date(lastOrderAt) >= new Date(updatedAt)) {
      continue;
    }

    const profile = profileMap.get(userId);
    const contact = contactByUser.get(userId);
    const phoneFromProfile = String(profile?.phone_number ?? "").trim();
    const phone =
      (contact?.phone?.trim() || phoneFromProfile || null) as string | null;

    const items: AbandonedCartItem[] = rawItems.map((i) => {
      const product = Array.isArray(i.products)
        ? i.products[0]
        : i.products;
      return {
        productId: String(i.product_id),
        quantity: Number(i.quantity),
        unitPrice: Number(i.unit_price),
        nameEn: product?.name_en ?? "Product",
        nameMm: product?.name_mm ?? product?.name_en ?? "Product",
      };
    });

    const cartValue = items.reduce(
      (sum, i) => sum + i.unitPrice * i.quantity,
      0
    );

    rows.push({
      id: String(cart.id),
      userId,
      customerName: contact?.name?.trim() || "—",
      phone,
      email: contact?.email?.trim() || null,
      cartValue,
      updatedAt,
      items,
    });
  }

  return rows;
}

export async function getAdminCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name_en", { ascending: true });

  if (error) {
    console.error(error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    name_en: String(row.name_en),
    name_mm: String(row.name_mm ?? ""),
    parent_id: (row.parent_id as string | null) ?? null,
    sort_order: Number(row.sort_order ?? 0),
    slug: (row.slug as string | null) ?? null,
    emoji_icon: String(row.emoji_icon ?? ""),
    created_at: row.created_at ? String(row.created_at) : undefined,
  })) as Category[];
}

export type ProductRequestRow = {
  id: string;
  name: string;
  email: string;
  item_name: string;
  details: string;
  image_url: string | null;
  status: "pending" | "sourced" | "rejected";
  created_at: string;
};

export type BugReportRow = {
  id: string;
  name: string;
  email: string;
  description: string;
  status: "open" | "resolved";
  created_at: string;
};

export async function getAdminProductRequests(): Promise<ProductRequestRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error.message);
    return [];
  }

  return (data ?? []) as ProductRequestRow[];
}

export async function getAdminBugReports(): Promise<BugReportRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bug_reports")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error.message);
    return [];
  }

  return (data ?? []) as BugReportRow[];
}

