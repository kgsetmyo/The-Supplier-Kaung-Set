import { setRequestLocale } from "next-intl/server";
import { SearchResults } from "@/components/SearchResults";
import {
  getProducts,
  getStorefrontCategories,
  getStorefrontPricingContext,
} from "@/lib/products";
import { getReviewSummariesByProductIds } from "@/lib/reviews";
import {
  parseStorefrontFilters,
  type StorefrontSearchParams,
} from "@/lib/storefront-filters";
import { getWishlistProductIds } from "@/lib/wishlist";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<StorefrontSearchParams>;
};

export default async function ProductsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const filters = parseStorefrontFilters(sp);
  const categories = await getStorefrontCategories();

  const [products, pricing, wishlistIds] = await Promise.all([
    getProducts(filters, categories),
    getStorefrontPricingContext(),
    getWishlistProductIds(),
  ]);

  const reviewSummaries = await getReviewSummariesByProductIds(
    products.map((p) => p.id)
  );

  return (
    <SearchResults
      products={products}
      categories={categories}
      queryLabel={filters.queryLabel}
      profile={pricing.profile}
      tier={pricing.tier}
      eligibility={pricing.eligibility}
      wishlistIds={wishlistIds}
      reviewSummaries={reviewSummaries}
    />
  );
}
