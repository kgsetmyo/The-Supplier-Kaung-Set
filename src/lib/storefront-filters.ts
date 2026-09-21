import type { ProductAuthenticity } from "@/types/database";
import type { ProductFilters } from "@/lib/products";

function first(value?: string | string[]): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseAuth(raw?: string): ProductAuthenticity[] | undefined {
  if (!raw?.trim()) return undefined;
  const list = raw
    .split(",")
    .map((s) => s.trim())
    .filter(
      (s): s is ProductAuthenticity =>
        s === "Genuine" || s === "OEM" || s === "Replica"
    );
  return list.length ? list : undefined;
}

function parsePrice(raw?: string): number | undefined {
  if (raw == null || raw.trim() === "") return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export type StorefrontSearchParams = {
  q?: string | string[];
  search?: string | string[];
  categoryId?: string | string[];
  category?: string | string[];
  minPrice?: string | string[];
  maxPrice?: string | string[];
  auth?: string | string[];
  inStock?: string | string[];
};

/** Normalize storefront listing URL params into product filters. */
export function parseStorefrontFilters(
  sp: StorefrontSearchParams
): ProductFilters & { queryLabel?: string } {
  const q = first(sp.q)?.trim() || first(sp.search)?.trim() || undefined;
  const categoryId =
    first(sp.categoryId)?.trim() || first(sp.category)?.trim() || undefined;
  const inStockRaw = first(sp.inStock)?.trim();

  return {
    q,
    queryLabel: q,
    categoryId,
    minPrice: parsePrice(first(sp.minPrice)),
    maxPrice: parsePrice(first(sp.maxPrice)),
    authenticity: parseAuth(first(sp.auth)),
    inStockOnly: inStockRaw === "1" || inStockRaw === "true",
  };
}
