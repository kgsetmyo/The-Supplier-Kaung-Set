import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getAdminStats } from "@/lib/admin";
import {
  getDashboardMetrics,
  getTopViewedProducts,
} from "@/lib/analytics";
import { formatMoney } from "@/types/database";
import {
  Package,
  ShoppingBag,
  Users,
  AlertTriangle,
  Eye,
  MousePointerClick,
  UserRound,
  type LucideIcon,
} from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminOverviewPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const [stats, analytics, topProducts] = await Promise.all([
    getAdminStats(),
    getDashboardMetrics(),
    getTopViewedProducts(10),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t("overview")}
        </h1>
        <p className="mt-1 text-sm font-normal text-foreground">
          {t("overviewSubtitle")}
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-wide text-foreground uppercase">
          {t("analyticsTitle")}
        </h2>
        {analytics ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              label={t("analyticsActiveUsers")}
              value={analytics.activeUsers.toLocaleString()}
              hint={t("analyticsLast7Days")}
              icon={UserRound}
            />
            <StatCard
              label={t("analyticsPageViews")}
              value={analytics.pageViews.toLocaleString()}
              hint={t("analyticsLast7Days")}
              icon={Eye}
            />
            <StatCard
              label={t("analyticsProductClicks")}
              value={analytics.productClicks.toLocaleString()}
              hint={t("analyticsLast7Days")}
              icon={MousePointerClick}
            />
          </div>
        ) : (
          <p className="border border-dashed border-border bg-surface px-4 py-6 text-sm font-normal text-foreground">
            {t("analyticsUnavailable")}
          </p>
        )}
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("totalProducts")}
          value={String(stats.totalProducts)}
          icon={Package}
        />
        <StatCard
          label={t("totalOrders")}
          value={String(stats.totalOrders)}
          icon={ShoppingBag}
        />
        <StatCard
          label={t("totalCustomers")}
          value={String(stats.totalCustomers)}
          icon={Users}
        />
        <StatCard
          label={t("pendingOrders")}
          value={String(stats.pendingOrders)}
          icon={AlertTriangle}
        />
      </div>

      <section className="border border-border bg-surface shadow-sm">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold tracking-wide text-foreground uppercase">
            {t("trendingProducts")}
          </h2>
          <p className="mt-0.5 text-xs font-normal text-foreground">
            {t("trendingProductsHint")}
          </p>
        </div>
        {topProducts.length === 0 ? (
          <p className="px-4 py-8 text-sm font-normal text-foreground">
            {t("trendingProductsEmpty")}
          </p>
        ) : (
          <ol className="divide-y divide-border">
            {topProducts.map((item, index) => (
              <li
                key={`${item.name}-${index}`}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-background text-xs font-semibold text-foreground">
                    {index + 1}
                  </span>
                  <p className="truncate font-semibold text-foreground">
                    {item.name}
                  </p>
                </div>
                <span className="shrink-0 rounded border border-border bg-background px-2 py-1 text-xs font-bold tabular-nums text-foreground">
                  {item.views.toLocaleString()} {t("trendingViews")}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="border border-border bg-surface shadow-sm">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold tracking-wide text-foreground uppercase">
            {t("lowStock")}
          </h2>
        </div>
        {stats.lowStock.length === 0 ? (
          <p className="px-4 py-8 text-sm font-normal text-foreground">
            {t("noLowStock")}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {stats.lowStock.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-foreground">
                    {locale === "mm" ? p.name_mm : p.name_en}
                  </p>
                  <p className="text-xs font-normal text-foreground">
                    {formatMoney(Number(p.price))}
                  </p>
                </div>
                <StockBadge
                  quantity={p.stock_quantity}
                  labels={{
                    out: t("stockOut"),
                    low: t("stockLow"),
                    ok: t("stockOk"),
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
}) {
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
      <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs font-normal text-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function StockBadge({
  quantity,
  labels,
}: {
  quantity: number;
  labels: { out: string; low: string; ok: string };
}) {
  if (quantity <= 0) {
    return (
      <span className="rounded border border-sale/40 bg-sale/10 px-2 py-1 text-xs font-semibold text-sale">
        {labels.out} · {quantity}
      </span>
    );
  }
  if (quantity <= 5) {
    return (
      <span className="rounded border border-amber-600/40 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">
        {labels.low} · {quantity}
      </span>
    );
  }
  return (
    <span className="rounded border border-emerald-700/30 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">
      {labels.ok} · {quantity}
    </span>
  );
}
