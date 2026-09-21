import { formatMoney, type LoyaltyTier, type Profile } from "@/types/database";

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
  const sorted = [...tiers].sort(
    (a, b) => Number(a.spend_threshold) - Number(b.spend_threshold)
  );
  const current =
    sorted
      .filter((t) => Number(t.spend_threshold) <= spend)
      .sort((a, b) => Number(b.spend_threshold) - Number(a.spend_threshold))[0] ??
    sorted[0];
  const next = sorted.find(
    (t) => Number(t.spend_threshold) > Number(current?.spend_threshold ?? 0)
  );
  const tierName = profile.loyalty_tier || current?.tier_name || "Member";
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
              Number(next.spend_threshold) - Number(current?.spend_threshold ?? 0)
            )) *
            100
        )
      )
    : 100;

  const style =
    tierName.toLowerCase().includes("vvip")
      ? "from-[#1a1408] via-[#3d2e12] to-[#8a6a1f] text-[#f5e6b8] ring-[#c9a227]/40"
      : tierName.toLowerCase().includes("elite") ||
          tierName.toLowerCase().includes("vip")
        ? "from-[#0c0c0c] via-[#1a1a1a] to-[#2a2a2a] text-white ring-white/10"
        : "from-[#f7f7f7] via-[#ffffff] to-[#ececec] text-foreground ring-border";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 shadow-[0_16px_40px_rgba(0,0,0,0.12)] ring-1 ${style}`}
    >
      <p className="text-[11px] font-semibold tracking-[0.2em] uppercase opacity-80">
        The supplier Kaung Set
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">{tierName}</h2>
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

      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-black/20">
        <div
          className="h-full rounded-full bg-current opacity-80 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
