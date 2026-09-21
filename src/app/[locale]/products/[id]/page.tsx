import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/Header";
import { CartDrawer } from "@/components/CartDrawer";
import { ProductDetailView } from "@/components/ProductDetailView";
import { ProductReviews } from "@/components/ProductReviews";
import {
  getProductById,
  getStorefrontCategories,
  getStorefrontPricingContext,
} from "@/lib/products";
import { productGalleryUrls } from "@/lib/product-media";
import { getWishlistProductIds } from "@/lib/wishlist";
import { getProductReviews } from "@/lib/reviews";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

function siteOrigin() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}

function absoluteUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const origin = siteOrigin();
  return `${origin}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const product = await getProductById(id);
  const t = await getTranslations({ locale, namespace: "product" });

  if (!product) {
    return { title: t("notFound") };
  }

  const name = locale === "mm" ? product.name_mm : product.name_en;
  const description = (
    locale === "mm" ? product.description_mm : product.description_en
  )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);

  const cover = productGalleryUrls(product)[0];
  const images = cover
    ? [
        {
          url: absoluteUrl(cover),
          alt: name,
        },
      ]
    : undefined;

  const path = `/${locale}/products/${product.id}`;

  return {
    title: name,
    description: description || name,
    openGraph: {
      title: name,
      description: description || name,
      type: "website",
      locale: locale === "mm" ? "my_MM" : "en_US",
      url: absoluteUrl(path),
      siteName: "The supplier Kaung Set",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description: description || name,
      images: cover ? [absoluteUrl(cover)] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const [
    product,
    categories,
    pricing,
    wishlistIds,
    reviews,
    {
      data: { user },
    },
  ] = await Promise.all([
    getProductById(id),
    getStorefrontCategories(),
    getStorefrontPricingContext(),
    getWishlistProductIds(),
    getProductReviews(id),
    supabase.auth.getUser(),
  ]);

  if (!product) notFound();

  return (
    <>
      <Header showSearch={false} />
      <main className="page-shell storefront-container">
        <ProductDetailView
          product={product}
          categories={categories}
          profile={pricing.profile}
          tier={pricing.tier}
          eligibility={pricing.eligibility}
          wishlisted={wishlistIds.includes(product.id)}
          ratingAverage={
            reviews.length === 0
              ? 0
              : reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
          }
          ratingCount={reviews.length}
        />
        <ProductReviews
          productId={product.id}
          reviews={reviews}
          isSignedIn={Boolean(user)}
        />
      </main>
      <CartDrawer />
    </>
  );
}
