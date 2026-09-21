"use client";

import { useTranslations } from "next-intl";
import type {
  LoyaltyTier,
  Product,
  Profile,
  StoreSettings,
} from "@/types/database";
import type { PricingEligibility } from "@/lib/pricing";
import type { ReviewSummary } from "@/lib/reviews";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { CartDrawer } from "@/components/CartDrawer";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";

type ProductCatalogProps = {
  products: Product[];
  announcement: StoreSettings | null;
  profile?: Profile | null;
  tier?: LoyaltyTier | null;
  eligibility?: PricingEligibility;
  wishlistIds?: string[];
  reviewSummaries?: Record<string, ReviewSummary>;
};

export function ProductCatalog({
  products,
  announcement,
  profile = null,
  tier = null,
  eligibility,
  wishlistIds = [],
  reviewSummaries = {},
}: ProductCatalogProps) {
  const t = useTranslations("home");
  const wishlisted = new Set(wishlistIds);

  return (
    <>
      <AnnouncementBanner announcement={announcement} />
      <Header />
      <main className="page-shell storefront-container min-h-[calc(100vh-4rem)]">
        <div className="mb-6 max-w-xl md:mb-8">
          <h1 className="text-2xl font-semibold tracking-tight md:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-2 text-sm text-muted md:text-base">{t("subtitle")}</p>
        </div>

        {products.length === 0 ? (
          <p className="border border-dashed border-border px-4 py-16 text-center text-muted">
            {t("empty")}
          </p>
        ) : (
          <div className="product-grid">
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
      </main>
      <CartDrawer />
    </>
  );
}
