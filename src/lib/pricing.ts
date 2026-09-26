import type { LoyaltyTier, Product, Profile, Category } from "@/types/database";
import { getUnitPrice } from "@/types/database";
import { categoryMatchesRule } from "@/lib/categories";

export type DiscountRule = {
  tier_id: string;
  category_id: string | null;
  brand_id: string | null;
};

export type DiscountedPriceResult = {
  basePrice: number;
  finalPrice: number;
  discountPercent: number;
  isVipPrice: boolean;
};

export type PricingEligibility = {
  /** Selected category links (not expanded). Empty array for a tier = unrestricted. */
  tierCategories: { tier_id: string; category_id: string }[];
  /** Optional brand rules from loyalty_discount_rules */
  brandRules?: { tier_id: string; brand_id: string }[];
  categories: Category[];
};

/**
 * VIP tier price when the product is eligible for the user's loyalty tier.
 * Category eligibility uses hierarchical match (parent includes descendants).
 * No category rows for the tier ⇒ unrestricted (all products).
 *
 * Pass the spend-resolved `tier` from getStorefrontPricingContext so the
 * discount % and eligible categories match Admin → Loyalty settings.
 */
export function calculateDiscountedPrice(
  product: Product,
  userProfile: Pick<Profile, "loyalty_tier_id"> | null | undefined,
  tier: LoyaltyTier | null | undefined,
  eligibility: DiscountRule[] | PricingEligibility = []
): DiscountedPriceResult {
  const basePrice = getUnitPrice(product);

  const tierId = tier?.id ?? userProfile?.loyalty_tier_id ?? null;
  if (!tierId || !tier) {
    return {
      basePrice,
      finalPrice: basePrice,
      discountPercent: 0,
      isVipPrice: false,
    };
  }

  let eligible = false;

  if (Array.isArray(eligibility)) {
    // Legacy flat rules (exact category/brand match)
    eligible = eligibility.some(
      (rule) =>
        rule.tier_id === tierId &&
        ((rule.category_id && rule.category_id === product.category_id) ||
          (rule.brand_id && rule.brand_id === product.brand_id))
    );
  } else {
    const links = eligibility.tierCategories.filter((r) => r.tier_id === tierId);
    const brandOk =
      eligibility.brandRules?.some(
        (r) => r.tier_id === tierId && r.brand_id === product.brand_id
      ) ?? false;

    if (links.length === 0) {
      eligible = true; // unrestricted categories
    } else {
      eligible =
        brandOk ||
        links.some((link) =>
          categoryMatchesRule(
            eligibility.categories,
            product.category_id,
            link.category_id
          )
        );
    }
  }

  if (!eligible || Number(tier.discount_percentage) <= 0) {
    return {
      basePrice,
      finalPrice: basePrice,
      discountPercent: 0,
      isVipPrice: false,
    };
  }

  const discountPercent = Number(tier.discount_percentage);
  const finalPrice = Math.round(basePrice * (1 - discountPercent / 100));

  return {
    basePrice,
    finalPrice,
    discountPercent,
    isVipPrice: finalPrice < basePrice,
  };
}
