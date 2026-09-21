import { HeartOff } from "lucide-react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { CartDrawer } from "@/components/CartDrawer";
import { ProductCard } from "@/components/ProductCard";
import { Link } from "@/i18n/navigation";
import { getSessionUser } from "@/lib/auth";
import { getStorefrontPricingContext } from "@/lib/products";
import { getReviewSummariesByProductIds } from "@/lib/reviews";
import { getWishlistProducts } from "@/lib/wishlist";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function WishlistPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getSessionUser();
  if (!user) {
    redirect(`/${locale}/login?next=/${locale}/wishlist`);
  }

  const t = await getTranslations("wishlist");
  const [products, pricing] = await Promise.all([
    getWishlistProducts(),
    getStorefrontPricingContext(),
  ]);
  const reviewSummaries = await getReviewSummariesByProductIds(
    products.map((p) => p.id)
  );

  return (
    <>
      <Header showSearch={false} />
      <main className="page-shell storefront-container min-h-[calc(100vh-4rem)]">
        <div className="mb-6 max-w-xl md:mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-2 text-sm font-normal text-foreground md:text-base">
            {t("subtitle")}
          </p>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-border bg-surface px-4 py-16 text-center sm:px-6 sm:py-20">
            <HeartOff
              className="size-12 text-foreground"
              strokeWidth={1.25}
              aria-hidden
            />
            <p className="mt-4 text-base font-semibold text-foreground">
              {t("emptyTitle")}
            </p>
            <p className="mt-1.5 max-w-sm text-sm font-normal text-foreground">
              {t("emptyBody")}
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg transition hover:opacity-90"
            >
              {t("browse")}
            </Link>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                profile={pricing.profile}
                tier={pricing.tier}
                eligibility={pricing.eligibility}
                wishlisted
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
