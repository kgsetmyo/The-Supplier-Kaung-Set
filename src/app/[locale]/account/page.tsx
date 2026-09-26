import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import {
  getLoyaltyTiers,
  getMyOrders,
  getMyProfile,
} from "@/lib/user-orders";
import { AccountPageShell } from "@/components/AccountPageShell";
import { LoyaltyCard } from "@/components/LoyaltyCard";
import { OrderHistoryList } from "@/components/OrderHistoryList";
import { Link } from "@/i18n/navigation";
import { formatMoney } from "@/types/database";
import { resolveLoyaltyTierFromSpend } from "@/lib/loyalty";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AccountDashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getSessionUser();
  if (!user) {
    redirect(`/${locale}/login?next=/${locale}/account`);
  }

  const [t, tProfile, profile, orders, tiers] = await Promise.all([
    getTranslations("account"),
    getTranslations("profile"),
    getMyProfile(),
    getMyOrders(),
    getLoyaltyTiers(),
  ]);

  if (!profile) {
    redirect(`/${locale}/login?next=/${locale}/account`);
  }

  const currencyPrefix = "Ks ";
  const resolvedTier = resolveLoyaltyTierFromSpend(
    Number(profile.lifetime_spend ?? 0),
    tiers
  );
  const displayTier = resolvedTier?.tier_name || "Member";

  return (
    <AccountPageShell title={t("dashboardTitle")}>
      <p className="mb-6 text-sm font-normal text-foreground">
        {t("dashboardSubtitle")}
      </p>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <LoyaltyCard
          profile={profile}
          tiers={tiers}
          currencyPrefix={currencyPrefix}
          labels={{
            lifetimeSpend: tProfile("spend"),
            nextTier: t("nextTierSpend"),
            maxTier: t("maxTier"),
            // raw: LoyaltyCard fills {pct} after resolving the current tier
            discount: t.raw("tierDiscount"),
          }}
        />

        <div className="border border-border bg-surface p-5">
          <h2 className="text-sm font-bold tracking-wide text-foreground uppercase">
            {tProfile("title")}
          </h2>
          <dl className="mt-4 space-y-3 text-sm text-foreground">
            <div>
              <dt className="text-xs font-semibold uppercase">
                {tProfile("email")}
              </dt>
              <dd className="mt-0.5 font-normal">{profile.email ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase">
                {tProfile("phone")}
              </dt>
              <dd className="mt-0.5 font-normal">
                {profile.phone_number || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase">
                {tProfile("tier")}
              </dt>
              <dd className="mt-0.5 font-semibold">{displayTier}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase">
                {tProfile("spend")}
              </dt>
              <dd className="mt-0.5 font-semibold">
                {formatMoney(Number(profile.lifetime_spend ?? 0), currencyPrefix)}
              </dd>
            </div>
          </dl>
          <Link
            href="/profile"
            className="mt-5 inline-block text-sm font-semibold underline underline-offset-4"
          >
            {t("editProfile")}
          </Link>
        </div>
      </div>

      <section className="mt-10">
        <div className="mb-2">
          <h2 className="text-lg font-semibold text-foreground">
            {t("ordersTitle")}
          </h2>
          <p className="mt-1 text-sm font-normal text-foreground">
            {t("ordersSubtitle")}
          </p>
        </div>
        <OrderHistoryList orders={orders} />
      </section>
    </AccountPageShell>
  );
}
