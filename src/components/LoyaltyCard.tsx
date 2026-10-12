import { formatMoney, type LoyaltyTier, type Profile } from "@/types/database";
import {
  nextLoyaltyTier,
  resolveLoyaltyTierFromSpend,
} from "@/lib/loyalty";

type LoyaltyCardProps = {
  profile: Profile;
  tiers: LoyaltyTier[];
  currencyPrefix?: string;
  labels: {
    lifetimeSpend: string;
    nextTier: string;
    maxTier: string;
    discount: string;
  };
};

export function LoyaltyCard({
  profile,
  tiers,
  currencyPrefix = "Ks ",
  labels,
}: LoyaltyCardProps) {
  const spend = Number(profile.lifetime_spend ?? 0);
  // Rank always comes from spend vs admin tier thresholds — not the stale
  // profiles.loyalty_tier text (which used to default to "Elite").
  const current = resolveLoyaltyTierFromSpend(spend, tiers);
  const next = nextLoyaltyTier(current, tiers);
  const tierName = current?.tier_name || "Member";
  const discount = Number(current?.discount_percentage ?? 0);
  const remaining = next
    ? Math.max(0, Number(next.spend_threshold) - spend)
    : 0;
  const progress = next
    ? Math.min(
        100,
        Math.round(
          ((spend - Number(current?.spend_threshold ?? 0)) /
            Math.max(
              1,
              Number(next.spend_threshold) -
                Number(current?.spend_threshold ?? 0)
            )) *
            100
        )
      )
    : 100;

  const lower = tierName.toLowerCase();
  const style = lower.includes("vvip")
    ? "from-[#1a1408] via-[#3d2e12] to-[#8a6a1f] text-[#f5e6b8] ring-[#c9a227]/40"
    : lower.includes("elite") || lower.includes("vip")
      ? "from-[#0c0c0c] via-[#1a1a1a] to-[#2a2a2a] text-white ring-white/10"
      : "from-[#f4fae8] via-white to-[#e8f7b8] text-foreground ring-[#c9dbb8]";

  const trackClass =
    lower.includes("vvip") || lower.includes("elite") || lower.includes("vip")
      ? "bg-white/20"
      : "bg-accent/35";

  const fillClass =
    lower.includes("vvip") || lower.includes("elite") || lower.includes("vip")
      ? "bg-current opacity-80"
      : "bg-[#14241c]";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-transparent bg-gradient-to-br p-6 shadow-[0_16px_40px_rgba(20,36,28,0.12)] ring-1 ${style}`}
    >
      <p className="text-[11px] font-semibold tracking-[0.2em] uppercase opacity-80">
        The supplier Kaung Set
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
        {tierName}
      </h2>
      {discount > 0 ? (
        <p className="mt-1 text-sm font-normal opacity-90">
          {labels.discount.replace("{pct}", String(discount))}
        </p>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold tracking-wide uppercase opacity-70">
            {labels.lifetimeSpend}
          </p>
          <p className="mt-1 text-xl font-semibold">
            {formatMoney(spend, currencyPrefix)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold tracking-wide uppercase opacity-70">
            {next ? labels.nextTier : labels.maxTier}
          </p>
          <p className="mt-1 text-sm font-semibold">
            {next
              ? `${next.tier_name} · ${formatMoney(remaining, currencyPrefix)}`
              : tierName}
          </p>
        </div>
      </div>

      <div className={`mt-5 h-1.5 overflow-hidden rounded-full ${trackClass}`}>
        <div
          className={`h-full rounded-full transition-all ${fillClass}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
