import { Suspense } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Header } from "@/components/Header";
import { CartDrawer } from "@/components/CartDrawer";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { HomeHero } from "@/components/HomeHero";
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
          <div className="min-h-[min(88vh,44rem)] w-full animate-pulse bg-[#14241c]" />
        }
      >
        <HomeHeroSection />
      </Suspense>
      <main
        id="shop"
        className="page-shell storefront-container scroll-mt-24 min-h-[calc(100vh-4rem)]"
      >
        <div className="mb-6 md:mb-8">
          <h2 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">
            {t("shelfTitle")}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted md:text-base">
            {t("shelfSubtitle")}
          </p>
        </div>
        <Suspense fallback={<ProductGridSkeleton count={8} />}>
          <HomeProductGrid />
        </Suspense>
      </main>
      <CartDrawer />
    </>
  );
}
