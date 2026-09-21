"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import type {
  Category,
  LoyaltyTier,
  Product,
  Profile,
} from "@/types/database";
import type { PricingEligibility } from "@/lib/pricing";
import type { ReviewSummary } from "@/lib/reviews";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { CartDrawer } from "@/components/CartDrawer";
import { SearchFilters } from "@/components/SearchFilters";
import { Link } from "@/i18n/navigation";

export function SearchResults({
  products,
  categories,
  queryLabel,
  profile = null,
  tier = null,
  eligibility,
  wishlistIds = [],
  reviewSummaries = {},
}: {
  products: Product[];
  categories: Category[];
  queryLabel?: string;
  profile?: Profile | null;
  tier?: LoyaltyTier | null;
  eligibility?: PricingEligibility;
  wishlistIds?: string[];
  reviewSummaries?: Record<string, ReviewSummary>;
}) {
  const t = useTranslations("search");
  const wishlisted = new Set(wishlistIds);

  return (
    <>
      <Header />
      <main className="page-shell storefront-container min-h-[calc(100vh-4rem)]">
        <div className="mb-6 text-foreground md:mb-8">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
            {queryLabel
              ? t("resultsFor", { q: queryLabel })
              : t("title")}
          </h1>
          {products.length > 0 ? (
            <p className="mt-1 text-sm font-normal text-foreground">
              {t("resultCount", { count: products.length })}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[16rem_1fr] lg:gap-8">
          <Suspense
            fallback={
              <div className="h-10 animate-pulse rounded-md border border-border bg-surface lg:h-64" />
            }
          >
            <SearchFilters categories={categories} />
          </Suspense>

          <div className="min-w-0">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center border border-dashed border-border bg-surface px-4 py-16 text-center sm:px-6">
                <p className="max-w-md text-sm font-normal text-foreground">
                  {queryLabel
                    ? t("emptyForQuery", { q: queryLabel })
                    : t("empty")}
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  {queryLabel ? (
                    <Link
                      href="/search"
                      className="inline-flex rounded-md border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-foreground/40"
                    >
                      {t("clearSearch")}
                    </Link>
                  ) : null}
                  <Link
                    href="/products"
                    className="inline-flex rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg transition hover:opacity-90"
                  >
                    {t("browseAll")}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="product-grid-filtered">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    profile={profile}
                    tier={tier}
                    eligibility={eligibility}
                    wishlisted={wishlisted.has(product.id)}
                    ratingAverage={reviewSummaries[product.id]?.average ?? 0}
                    ratingCount={reviewSummaries[product.id]?.count ?? 0}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <CartDrawer />
    </>
  );
}
