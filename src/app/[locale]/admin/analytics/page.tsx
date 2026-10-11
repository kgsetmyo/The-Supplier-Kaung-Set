import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getProfitAnalytics } from "@/lib/admin";
import { formatMoney } from "@/types/database";
import {
  Banknote,
  CircleDollarSign,
  Package,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminAnalyticsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");
  const profit = await getProfitAnalytics();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t("profitAnalytics")}
        </h1>
        <p className="mt-1 text-sm font-normal text-foreground">
          {t("profitAnalyticsSubtitle")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label={t("grossRevenue")}
          value={formatMoney(profit.grossRevenue)}
          hint={t("grossRevenueHint", { count: profit.unitsSold })}
          icon={Banknote}
        />
        <MetricCard
          label={t("totalCosts")}
          value={formatMoney(profit.totalCosts)}
          hint={t("totalCostsHint", {
            product: formatMoney(profit.totalProductCost),
            delivery: formatMoney(profit.totalDeliveryCost),
          })}
          icon={Package}
        />
        <MetricCard
          label={t("netProfit")}
          value={formatMoney(profit.netProfit)}
          hint={t("netProfitHint")}
          icon={TrendingUp}
          emphasize={profit.netProfit >= 0 ? "positive" : "negative"}
        />
        <MetricCard
          label={t("completedOrders")}
          value={String(profit.orderCount)}
          hint={t("completedOrdersHint", { units: profit.unitsSold })}
          icon={CircleDollarSign}
        />
      </div>

      {profit.missingCostUnits > 0 ? (
        <p className="border border-amber-600/40 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {t("missingCostWarning", { count: profit.missingCostUnits })}
        </p>
      ) : null}

      <section className="border border-border bg-surface p-5 shadow-sm">
        <h2 className="text-sm font-semibold tracking-wide text-foreground uppercase">
          {t("profitBreakdown")}
        </h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <BreakdownRow
            label={t("grossRevenue")}
            value={formatMoney(profit.grossRevenue)}
          />
          <BreakdownRow
            label={t("productCostTotal")}
            value={formatMoney(profit.totalProductCost)}
          />
          <BreakdownRow
            label={t("deliveryCostTotal")}
            value={formatMoney(profit.totalDeliveryCost)}
          />
          <BreakdownRow
            label={t("totalCosts")}
            value={formatMoney(profit.totalCosts)}
          />
          <BreakdownRow
            label={t("netProfit")}
            value={formatMoney(profit.netProfit)}
            strong
          />
        </dl>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  emphasize,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  emphasize?: "positive" | "negative";
}) {
  const valueClass =
    emphasize === "positive"
      ? "text-emerald-800"
      : emphasize === "negative"
        ? "text-sale"
        : "text-foreground";

  return (
    <div className="border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold tracking-wide text-foreground uppercase">
          {label}
        </p>
        <span className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-background">
          <Icon className="size-4 text-foreground" aria-hidden />
        </span>
      </div>
      <p
        className={`mt-3 text-3xl font-semibold tracking-tight tabular-nums ${valueClass}`}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs font-normal text-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-2 last:border-0">
      <dt className="text-sm text-muted">{label}</dt>
      <dd
        className={`text-sm tabular-nums ${
          strong ? "font-semibold text-foreground" : "text-foreground"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
