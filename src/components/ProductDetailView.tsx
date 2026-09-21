"use client";

import { sendGTMEvent } from "@next/third-parties/google";
import { useLocale, useTranslations } from "next-intl";
import type { Category, LoyaltyTier, Product, Profile } from "@/types/database";
import { formatMoney } from "@/types/database";
import { useCartStore } from "@/store/cart";
import {
  calculateDiscountedPrice,
  type PricingEligibility,
} from "@/lib/pricing";
import { productGalleryUrls } from "@/lib/product-media";
import { AuthenticityBadge } from "@/components/AuthenticityBadge";
import { ProductImageGallery } from "@/components/ProductImageGallery";
import { WishlistButton } from "@/components/WishlistButton";
import { StarRating } from "@/components/StarRating";
import { categoryBreadcrumb } from "@/lib/categories";
import { Link } from "@/i18n/navigation";

export function ProductDetailView({
  product,
  categories,
  profile = null,
  tier = null,
  eligibility,
  wishlisted = false,
  ratingAverage = 0,
  ratingCount = 0,
}: {
  product: Product;
  categories: Category[];
  profile?: Profile | null;
  tier?: LoyaltyTier | null;
  eligibility?: PricingEligibility;
  wishlisted?: boolean;
  ratingAverage?: number;
  ratingCount?: number;
}) {
  const locale = useLocale();
  const t = useTranslations();
  const addItem = useCartStore((s) => s.addItem);

  const name = locale === "mm" ? product.name_mm : product.name_en;
  const description =
    locale === "mm" ? product.description_mm : product.description_en;
  const hasCatalogDiscount = product.discount_price != null;
  const pricing = calculateDiscountedPrice(
    product,
    profile,
    tier,
    eligibility ?? { tierCategories: [], brandRules: [], categories: [] }
  );
  const outOfStock = product.stock_quantity <= 0;
  const lowStock =
    product.stock_quantity > 0 && product.stock_quantity <= 10;
  const currencyPrefix = t("currency.prefix");
  const categoryLabel = categoryBreadcrumb(
    categories,
    product.category_id,
    locale
  );
  const gallery = productGalleryUrls(product);

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-16">
      <div className="w-full min-w-0 lg:w-1/2">
        <ProductImageGallery urls={gallery} alt={name} />
      </div>

      <div className="flex w-full min-w-0 flex-col lg:w-1/2">
        <div className="mb-4">
          <Link
            href="/"
            className="text-sm font-normal text-foreground underline-offset-4 hover:underline"
          >
            ← {t("product.backToShop")}
          </Link>
        </div>

        <AuthenticityBadge authenticity={product.authenticity} />

        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground md:text-4xl">
          {name}
        </h1>

        {ratingCount > 0 ? (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StarRating rating={ratingAverage} size="md" />
            <span className="text-sm font-semibold text-foreground">
              {ratingAverage.toFixed(1)}
            </span>
            <span className="text-sm font-normal text-foreground">
              ({t("reviews.countLabel", { count: ratingCount })})
            </span>
          </div>
        ) : null}

        {categoryLabel !== "—" ? (
          <p className="mt-2 text-sm font-normal text-foreground">
            {categoryLabel}
          </p>
        ) : null}

        <div className="mt-5 flex items-baseline gap-3">
          <span className="text-2xl font-semibold text-foreground">
            {formatMoney(pricing.finalPrice, currencyPrefix)}
          </span>
          {pricing.isVipPrice || hasCatalogDiscount ? (
            <span className="text-base font-normal text-foreground line-through">
              {formatMoney(
                pricing.isVipPrice ? pricing.basePrice : Number(product.price),
                currencyPrefix
              )}
            </span>
          ) : null}
          {pricing.isVipPrice ? (
            <span className="text-xs font-semibold tracking-wide text-foreground uppercase">
              {t("product.vipPrice")}
            </span>
          ) : hasCatalogDiscount ? (
            <span className="text-xs font-semibold tracking-wide text-sale uppercase">
              {t("product.sale")}
            </span>
          ) : null}
        </div>

        {outOfStock ? (
          <p className="mt-2 text-sm font-normal text-foreground">
            {t("product.outOfStock")}
          </p>
        ) : !lowStock ? (
          <p className="mt-2 text-sm font-normal text-foreground">
            {t("product.inStock", { count: product.stock_quantity })}
          </p>
        ) : null}

        <p className="mt-6 text-base leading-relaxed whitespace-pre-wrap text-foreground">
          {description}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          {lowStock ? (
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600">
              <span
                className="size-2 shrink-0 animate-pulse rounded-full bg-orange-600"
                aria-hidden
              />
              {t("product.lowStock", { count: product.stock_quantity })}
            </p>
          ) : null}
          <button
            type="button"
            disabled={outOfStock}
            onClick={() => {
              sendGTMEvent({
                event: "add_to_cart",
                product_name: name,
                product_id: product.id,
                item_name: name,
                item_id: product.id,
                price: pricing.finalPrice,
                ecommerce: {
                  items: [
                    {
                      item_id: product.id,
                      item_name: name,
                      price: pricing.finalPrice,
                      quantity: 1,
                    },
                  ],
                },
              });
              addItem(product, 1, pricing.finalPrice);
            }}
            className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("product.addToCart")}
          </button>
          <WishlistButton
            productId={product.id}
            initialWishlisted={wishlisted}
            variant="label"
          />
        </div>
      </div>
    </div>
  );
}
