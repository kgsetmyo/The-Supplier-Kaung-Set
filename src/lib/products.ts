import { createClient } from "@/lib/supabase/server";
import type { PricingEligibility } from "@/lib/pricing";
import { resolveLoyaltyTierFromSpend } from "@/lib/loyalty";
import type {
  Category,
  ExplorerCategory,
  LoyaltyTier,
  Product,
  ProductAuthenticity,
  Profile,
  StoreSettings,
} from "@/types/database";
import { descendantIds } from "@/lib/categories";

export type ProductFilters = {
  q?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  authenticity?: ProductAuthenticity[];
  /** When true, only products with stock_quantity > 0 */
  inStockOnly?: boolean;
};

function mapProduct(row: Record<string, unknown>): Product {
  const auth = String(row.authenticity ?? "Genuine");
  const authenticity =
    auth === "OEM" || auth === "Replica" || auth === "Genuine"
      ? (auth as Product["authenticity"])
      : "Genuine";

  const rawUrls = row.image_urls;
  const image_urls = Array.isArray(rawUrls)
    ? rawUrls.map((u) => String(u).trim()).filter(Boolean)
    : [];

  const image_url = (row.image_url as string | null) ?? null;
  if (image_url?.trim() && !image_urls.includes(image_url.trim())) {
    image_urls.unshift(image_url.trim());
  }

  return {
    id: String(row.id),
    name_en: String(row.name_en),
    name_mm: String(row.name_mm),
    description_en: String(row.description_en ?? ""),
    description_mm: String(row.description_mm ?? ""),
    price: Number(row.price),
    discount_price:
      row.discount_price == null ? null : Number(row.discount_price),
    image_url,
    image_urls,
    stock_quantity: Number(row.stock_quantity ?? row.stock ?? 0),
    category_id: (row.category_id as string | null) ?? null,
    brand_id: (row.brand_id as string | null) ?? null,
    authenticity,
    is_active: row.is_active !== false,
    created_at: String(row.created_at),
  };
}

/** Strip PostgREST filter metacharacters from free-text search. */
function sanitizeSearchTerm(raw: string) {
  return raw.trim().replace(/[%_,.()]/g, " ").replace(/\s+/g, " ").trim();
}

export async function getProducts(
  filters: ProductFilters = {},
  categories: Category[] = []
): Promise<Product[]> {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  const term = filters.q ? sanitizeSearchTerm(filters.q) : "";
  if (term) {
    query = query.or(
      `name_en.ilike.%${term}%,name_mm.ilike.%${term}%,description_en.ilike.%${term}%,description_mm.ilike.%${term}%`
    );
  }

  if (filters.categoryId) {
    console.log("Current Selected Category ID:", filters.categoryId);

    let categoryIds: string[] = [];

    // Prefer DB recursive helper from migration 011
    const { data: rpcRows, error: rpcError } = await supabase.rpc(
      "category_descendant_ids",
      { p_root_id: filters.categoryId }
    );

    if (!rpcError && rpcRows && Array.isArray(rpcRows) && rpcRows.length > 0) {
      categoryIds = rpcRows.map((row: { id: string }) => String(row.id));
    } else {
      if (rpcError) {
        console.warn(
          "category_descendant_ids RPC failed, using in-memory tree:",
          rpcError.message
        );
      }
      categoryIds =
        categories.length > 0
          ? descendantIds(categories, filters.categoryId)
          : [filters.categoryId];
    }

    // Always include the selected node itself
    if (!categoryIds.includes(filters.categoryId)) {
      categoryIds = [filters.categoryId, ...categoryIds];
    }

    console.log("Category filter IDs (self + descendants):", categoryIds);
    query = query.in("category_id", categoryIds);
  }

  if (filters.minPrice != null && Number.isFinite(filters.minPrice)) {
    query = query.gte("price", filters.minPrice);
  }

  if (filters.maxPrice != null && Number.isFinite(filters.maxPrice)) {
    query = query.lte("price", filters.maxPrice);
  }

  if (filters.authenticity && filters.authenticity.length > 0) {
    query = query.in("authenticity", filters.authenticity);
  }

  if (filters.inStockOnly) {
    query = query.gt("stock_quantity", 0);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch products:", error.message);
    return [];
  }

  console.log("Supabase Fetch Results:", {
    count: data?.length ?? 0,
    filters,
    sampleCategoryIds: (data ?? [])
      .slice(0, 8)
      .map((row) => (row as { category_id?: string | null }).category_id),
  });

  return (data ?? []).map((row) => mapProduct(row as Record<string, unknown>));
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch product:", error.message);
    return null;
  }

  if (!data) return null;
  return mapProduct(data as Record<string, unknown>);
}

/** Fetch products by id list (preserves input order). */
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .in("id", unique);

  if (error) {
    console.error("getProductsByIds:", error.message);
    return [];
  }

  const byId = new Map(
    (data ?? []).map((row) => {
      const p = mapProduct(row as Record<string, unknown>);
      return [p.id, p] as const;
    })
  );

  return ids.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p));
}

export async function getStorefrontCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name_en, name_mm, parent_id, sort_order, slug, emoji_icon, created_at")
    .order("sort_order", { ascending: true })
    .order("name_en", { ascending: true });

  if (error) {
    console.error("Failed to fetch categories:", error.message);
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

/**
 * Categories for the floating explorer, each with a representative product image
 * (direct product first, otherwise first image found among descendants).
 */
export async function getExplorerCategories(): Promise<ExplorerCategory[]> {
  const supabase = await createClient();
  const categories = await getStorefrontCategories();
  if (categories.length === 0) return [];

  const { data: products, error } = await supabase
    .from("products")
    .select("category_id, image_url, image_urls")
    .eq("is_active", true)
    .not("category_id", "is", null);

  if (error) {
    console.error("Failed to fetch category cover images:", error.message);
  }

  const imageByCategory = new Map<string, string>();
  for (const row of products ?? []) {
    const cid = row.category_id ? String(row.category_id) : "";
    if (!cid || imageByCategory.has(cid)) continue;

    const gallery = Array.isArray(row.image_urls)
      ? (row.image_urls as string[])
          .map((u) => String(u).trim())
          .filter(Boolean)
      : [];
    const primary =
      gallery[0] ||
      (typeof row.image_url === "string" ? row.image_url.trim() : "");
    if (primary) imageByCategory.set(cid, primary);
  }

  return categories.map((cat) => {
    let image_url: string | null = imageByCategory.get(cat.id) ?? null;
    if (!image_url) {
      for (const id of descendantIds(categories, cat.id)) {
        const found = imageByCategory.get(id);
        if (found) {
          image_url = found;
          break;
        }
      }
    }
    return { ...cat, image_url };
  });
}

export async function getActiveAnnouncement(): Promise<StoreSettings | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("store_settings")
    .select("*")
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch announcement:", error.message);
    return null;
  }

  return data as StoreSettings | null;
}

export async function getStorefrontPricingContext(): Promise<{
  profile: Profile | null;
  tier: LoyaltyTier | null;
  eligibility: PricingEligibility;
}> {
  const emptyEligibility: PricingEligibility = {
    tierCategories: [],
    brandRules: [],
    categories: [],
  };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { profile: null, tier: null, eligibility: emptyEligibility };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return { profile: null, tier: null, eligibility: emptyEligibility };
  }

  const spend = Number(profile.lifetime_spend ?? 0);

  // Resolve rank from spend + admin thresholds (same rules as LoyaltyCard).
  const { data: tierRows } = await supabase
    .from("loyalty_tiers")
    .select("*")
    .order("spend_threshold", { ascending: true });

  const allTiers = (tierRows ?? []).map((row) => ({
    ...row,
    spend_threshold: Number(row.spend_threshold),
    discount_percentage: Number(row.discount_percentage),
  })) as LoyaltyTier[];

  const tier = resolveLoyaltyTierFromSpend(spend, allTiers);

  const mappedProfile = {
    ...profile,
    lifetime_spend: spend,
    email: user.email,
    // Keep pricing helpers aligned with the spend-resolved tier.
    loyalty_tier_id: tier?.id ?? null,
    loyalty_tier: tier?.tier_name ?? "Member",
  } as Profile;

  if (!tier) {
    return {
      profile: mappedProfile,
      tier: null,
      eligibility: emptyEligibility,
    };
  }

  const [{ data: tierCats }, { data: brandRules }, categories] =
    await Promise.all([
      supabase
        .from("loyalty_tier_categories")
        .select("tier_id, category_id")
        .eq("tier_id", tier.id),
      supabase
        .from("loyalty_discount_rules")
        .select("tier_id, brand_id")
        .eq("tier_id", tier.id)
        .not("brand_id", "is", null),
      getStorefrontCategories(),
    ]);

  return {
    profile: mappedProfile,
    tier,
    eligibility: {
      tierCategories: (tierCats ?? []).map((r) => ({
        tier_id: String(r.tier_id),
        category_id: String(r.category_id),
      })),
      brandRules: (brandRules ?? [])
        .filter((r) => r.brand_id)
        .map((r) => ({
          tier_id: String(r.tier_id),
          brand_id: String(r.brand_id),
        })),
      categories,
    },
  };
}
