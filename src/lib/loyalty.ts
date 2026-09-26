import type { LoyaltyTier } from "@/types/database";

/** Highest tier whose spend_threshold is <= spend; otherwise the lowest tier. */
export function resolveLoyaltyTierFromSpend(
  spend: number,
  tiers: LoyaltyTier[]
): LoyaltyTier | null {
  if (!tiers.length) return null;
  const amount = Number.isFinite(spend) ? Math.max(0, spend) : 0;
  const sorted = [...tiers].sort(
    (a, b) =>
      Number(a.spend_threshold) - Number(b.spend_threshold) ||
      Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)
  );
  const qualified = sorted
    .filter((t) => Number(t.spend_threshold) <= amount)
    .sort(
      (a, b) =>
        Number(b.spend_threshold) - Number(a.spend_threshold) ||
        Number(b.sort_order ?? 0) - Number(a.sort_order ?? 0)
    );
  return qualified[0] ?? sorted[0] ?? null;
}

export function nextLoyaltyTier(
  current: LoyaltyTier | null,
  tiers: LoyaltyTier[]
): LoyaltyTier | null {
  if (!tiers.length) return null;
  const sorted = [...tiers].sort(
    (a, b) => Number(a.spend_threshold) - Number(b.spend_threshold)
  );
  if (!current) return sorted[0] ?? null;
  return (
    sorted.find(
      (t) => Number(t.spend_threshold) > Number(current.spend_threshold)
    ) ?? null
  );
}
