import { Suspense } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Header } from "@/components/Header";
import { CartDrawer } from "@/components/CartDrawer";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { HomeHero } from "@/components/HomeHero";
import { HomeWhyShop } from "@/components/HomeWhyShop";
import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/skeletons";
import {
  getActiveAnnouncement,
  getProducts,
  getStorefrontPricingContext,
} from "@/lib/products";
import { getReviewSummariesByProductIds } from "@/lib/reviews";
import { getWishlistProductIds } from "@/lib/wishlist";
import { productGalleryUrls } from "@/lib/product-media";
import { Link } from "@/i18n/navigation";

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
      <p className="rounded-xl border border-dashed border-border bg-surface px-4 py-16 text-center text-muted">
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

async function HomeHeroSection() {
  const products = await getProducts();
  const featured =
    products.find((p) => productGalleryUrls(p).length > 0) ?? products[0] ?? null;
  return <HomeHero featured={featured} />;
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <>
      <Suspense fallback={null}>
        <HomeAnnouncement />
      </Suspense>
      <Header />
      <Suspense
        fallback={
          <div className="min-h-[min(92vh,46rem)] w-full animate-pulse bg-[#eef8d4]" />
        }
      >
        <HomeHeroSection />
      </Suspense>
      <HomeWhyShop />
      <main
        id="shop"
        className="page-shell storefront-container scroll-mt-24 min-h-[calc(100vh-4rem)]"
      >
        <div className="mb-8 flex flex-col gap-3 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-extrabold tracking-[0.18em] text-[#6a8f2e] uppercase">
              {t("shelfEyebrow")}
            </p>
            <h2 className="font-display mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">
              {t("shelfTitle")}
            </h2>
            <p className="mt-2 text-sm text-muted md:text-base">
              {t("shelfSubtitle")}
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex w-fit items-center justify-center rounded-md bg-accent px-4 py-2.5 text-sm font-extrabold text-accent-fg transition hover:brightness-105"
          >
            {t("shelfCta")}
          </Link>
        </div>
        <Suspense fallback={<ProductGridSkeleton count={8} />}>
          <HomeProductGrid />
        </Suspense>
      </main>
      <CartDrawer />
    </>
  );
}
