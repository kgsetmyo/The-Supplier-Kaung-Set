import { Suspense } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Header } from "@/components/Header";
import { CartDrawer } from "@/components/CartDrawer";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/skeletons";
import {
  getActiveAnnouncement,
  getProducts,
  getStorefrontPricingContext,
} from "@/lib/products";
import { getReviewSummariesByProductIds } from "@/lib/reviews";
import { getWishlistProductIds } from "@/lib/wishlist";

type Props = {
  params: Promise<{ locale: string }>;
};

async function HomeAnnouncement() {
  const announcement = await getActiveAnnouncement();
  return <AnnouncementBanner announcement={announcement} />;
}

async function HomeProductGrid() {
  const [products, pricing, wishlistIds] = await Promise.all([
    getProducts(),
    getStorefrontPricingContext(),
    getWishlistProductIds(),
  ]);

  const reviewSummaries = await getReviewSummariesByProductIds(
    products.map((p) => p.id)
  );
  const wishlisted = new Set(wishlistIds);
  const t = await getTranslations("home");

  if (products.length === 0) {
    return (
      <p className="border border-dashed border-border px-4 py-16 text-center text-muted">
        {t("empty")}
      </p>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          profile={pricing.profile}
          tier={pricing.tier}
          eligibility={pricing.eligibility}
          wishlisted={wishlisted.has(product.id)}
          ratingAverage={reviewSummaries[product.id]?.average ?? 0}
          ratingCount={reviewSummaries[product.id]?.count ?? 0}
          priority={index < 3}
        />
      ))}
    </div>
  );
}

async function HomeHeading() {
  const t = await getTranslations("home");
  return (
    <div className="mb-6 max-w-xl md:mb-8">
      <h1 className="text-2xl font-semibold tracking-tight md:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-2 text-sm text-muted md:text-base">{t("subtitle")}</p>
    </div>
  );
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Suspense fallback={null}>
        <HomeAnnouncement />
      </Suspense>
      <Header />
      <main className="page-shell storefront-container min-h-[calc(100vh-4rem)]">
        <Suspense
          fallback={
            <div className="mb-6 max-w-xl space-y-3 md:mb-8">
              <div className="h-8 w-48 animate-pulse rounded bg-gray-200 md:h-9 dark:bg-gray-800" />
              <div className="h-4 w-72 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            </div>
          }
        >
          <HomeHeading />
        </Suspense>
        <Suspense fallback={<ProductGridSkeleton count={8} />}>
          <HomeProductGrid />
        </Suspense>
      </main>
      <CartDrawer />
    </>
  );
}
