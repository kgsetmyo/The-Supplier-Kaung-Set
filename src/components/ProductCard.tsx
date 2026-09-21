"use client";

import Image from "next/image";
import { sendGTMEvent } from "@next/third-parties/google";
import { useLocale, useTranslations } from "next-intl";
import type { LoyaltyTier, Product, Profile } from "@/types/database";
import { formatMoney } from "@/types/database";
import { useCartStore } from "@/store/cart";
import {
  calculateDiscountedPrice,
  type PricingEligibility,
} from "@/lib/pricing";
import { productGalleryUrls } from "@/lib/product-media";
import { Link } from "@/i18n/navigation";
import { AuthenticityBadge } from "@/components/AuthenticityBadge";
import { WishlistButton } from "@/components/WishlistButton";
import { Star } from "lucide-react";

type ProductCardProps = {
  product: Product;
  profile?: Profile | null;
  tier?: LoyaltyTier | null;
  eligibility?: PricingEligibility;
  wishlisted?: boolean;
  ratingAverage?: number;
  ratingCount?: number;
  /** Mark above-the-fold images for LCP (eager + high priority). */
  priority?: boolean;
};

export function ProductCard({
  product,
  profile = null,
  tier = null,
  eligibility,
  wishlisted = false,
  ratingAverage = 0,
  ratingCount = 0,
  priority = false,
}: ProductCardProps) {
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
  const href = `/products/${product.id}`;
  const cover = productGalleryUrls(product)[0] ?? null;

  function trackViewItem() {
    sendGTMEvent({
      event: "view_item",
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
  }

  function trackAddToCart() {
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
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface text-foreground">
      <div className="absolute top-3 right-3 z-10">
        <WishlistButton
          productId={product.id}
          initialWishlisted={wishlisted}
        />
      </div>

      <Link
        href={href}
        onClick={trackViewItem}
        className="relative block aspect-[4/3] overflow-hidden bg-background"
      >
        {cover ? (
          <Image
            src={cover}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            priority={priority}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-normal text-foreground">
            —
          </div>
        )}
        {pricing.isVipPrice ? (
          <span className="absolute top-3 left-3 border border-border bg-surface px-2 py-0.5 text-[11px] font-semibold tracking-wide text-foreground uppercase">
            {t("product.vipPrice")}
          </span>
        ) : hasCatalogDiscount ? (
          <span
            className="absolute top-3 left-3 flex h-8 w-8 items-center justify-center rounded-full border border-sale bg-sale text-sm shadow-sm"
            aria-label={t("product.sale")}
            title={t("product.sale")}
          >
            🏷️
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <AuthenticityBadge authenticity={product.authenticity} size="sm" />
        <Link href={href} onClick={trackViewItem}>
          <h3 className="text-base font-semibold tracking-tight text-foreground hover:underline">
            {name}
          </h3>
        </Link>
        {ratingCount > 0 ? (
          <p className="inline-flex items-center gap-1 text-xs font-semibold text-foreground">
            <Star
              className="size-3.5 fill-amber-400 text-amber-400"
              aria-hidden
            />
            <span>
              {ratingAverage.toFixed(1)} ({ratingCount})
            </span>
          </p>
        ) : null}
        <p className="line-clamp-2 text-xs font-normal leading-relaxed text-foreground">
          {description}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-foreground">
                {formatMoney(pricing.finalPrice, currencyPrefix)}
              </span>
              {pricing.isVipPrice || hasCatalogDiscount ? (
                <span className="text-xs font-normal text-foreground line-through">
                  {formatMoney(
                    pricing.isVipPrice
                      ? pricing.basePrice
                      : Number(product.price),
                    currencyPrefix
                  )}
                </span>
              ) : null}
            </div>
            <p
              className={`mt-1 text-xs ${
                lowStock
                  ? "font-semibold text-orange-600"
                  : "font-normal text-foreground"
              }`}
            >
              {outOfStock
                ? t("product.outOfStock")
                : lowStock
                  ? t("product.lowStock", { count: product.stock_quantity })
                  : t("product.inStock", { count: product.stock_quantity })}
            </p>
          </div>

          <button
            type="button"
            disabled={outOfStock}
            onClick={trackAddToCart}
            className="rounded-md bg-accent px-3 py-2 text-xs font-semibold text-accent-fg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("product.addToCart")}
          </button>
        </div>
      </div>
    </article>
  );
}
