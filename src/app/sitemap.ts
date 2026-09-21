import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { routing } from "@/i18n/routing";

function siteOrigin() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}

/** Public Supabase client for sitemap generation (no cookies). */
function createSitemapClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

const STATIC_PATHS = [
  "",
  "/products",
  "/search",
  "/track",
  "/contact",
  "/faq",
  "/privacy",
  "/terms",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteOrigin();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of STATIC_PATHS) {
      entries.push({
        url: `${origin}/${locale}${path}`,
        lastModified: now,
        changeFrequency: path === "" ? "daily" : "weekly",
        priority: path === "" ? 1 : 0.7,
      });
    }
  }

  const supabase = createSitemapClient();
  if (!supabase) return entries;

  const { data: products, error } = await supabase
    .from("products")
    .select("id, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[sitemap] products fetch failed:", error.message);
    return entries;
  }

  for (const product of products ?? []) {
    const lastModified = product.created_at
      ? new Date(String(product.created_at))
      : now;
    for (const locale of routing.locales) {
      entries.push({
        url: `${origin}/${locale}/products/${product.id}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  return entries;
}
