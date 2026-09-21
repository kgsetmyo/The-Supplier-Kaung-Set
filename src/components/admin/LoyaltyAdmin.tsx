"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { updateLoyaltyTierConfig } from "@/lib/actions";
import {
  formatMoney,
  type Category,
  type LoyaltyTier,
  type Order,
  type Profile,
} from "@/types/database";
import { CategoryMultiSelect } from "@/components/admin/CategoryMultiSelect";

type CustomerRow = {
  profile: Profile;
  orders: Partial<Order>[];
};

export function LoyaltyAdmin({
  customers,
  tiers,
  categories,
  tierCategoryMap,
}: {
  customers: CustomerRow[];
  tiers: LoyaltyTier[];
  categories: Category[];
  tierCategoryMap: Record<string, string[]>;
}) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(
    customers[0]?.profile.id ?? null
  );
  const [pending, startTransition] = useTransition();
  const [drafts, setDrafts] = useState<
    Record<string, { spend: string; discount: string; categoryIds: string[] }>
  >(() =>
    Object.fromEntries(
      tiers.map((tier) => [
        tier.id,
        {
          spend: String(tier.spend_threshold),
          discount: String(tier.discount_percentage),
          categoryIds: tierCategoryMap[tier.id] ?? [],
        },
      ])
    )
  );
  const [message, setMessage] = useState<string | null>(null);

  const selected = customers.find((c) => c.profile.id === selectedId) ?? null;

  async function saveTier(tierId: string) {
    const draft = drafts[tierId];
    if (!draft) return;
    setMessage(null);
    const result = await updateLoyaltyTierConfig(
      tierId,
      Number(draft.spend),
      Number(draft.discount),
      draft.categoryIds
    );
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setMessage(t("saved"));
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("loyalty")}</h1>
        <p className="mt-1 text-sm text-muted">{t("loyaltySubtitle")}</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-wide uppercase">
          {t("tierManagement")}
        </h2>
        <p className="text-xs text-muted">{t("eligibleCategoriesHint")}</p>
        <div className="overflow-x-auto border border-border bg-surface">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-border bg-background text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-3 py-2 font-medium">{t("tierName")}</th>
                <th className="px-3 py-2 font-medium">{t("spendThreshold")}</th>
                <th className="px-3 py-2 font-medium">{t("discountPct")}</th>
                <th className="px-3 py-2 font-medium">
                  {t("eligibleCategories")}
                </th>
                <th className="px-3 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier) => (
                <tr key={tier.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-3 font-medium">{tier.tier_name}</td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      min={0}
                      className="w-32 rounded-md border border-border px-2 py-1"
                      value={drafts[tier.id]?.spend ?? ""}
                      onChange={(e) =>
                        setDrafts((d) => ({
                          ...d,
                          [tier.id]: {
                            spend: e.target.value,
                            discount: d[tier.id]?.discount ?? "0",
                            categoryIds: d[tier.id]?.categoryIds ?? [],
                          },
                        }))
                      }
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="0.1"
                      className="w-24 rounded-md border border-border px-2 py-1"
                      value={drafts[tier.id]?.discount ?? ""}
                      onChange={(e) =>
                        setDrafts((d) => ({
                          ...d,
                          [tier.id]: {
                            discount: e.target.value,
                            spend: d[tier.id]?.spend ?? "0",
                            categoryIds: d[tier.id]?.categoryIds ?? [],
                          },
                        }))
                      }
                    />
                  </td>
                  <td className="px-3 py-3 align-top">
                    <CategoryMultiSelect
                      categories={categories}
                      value={drafts[tier.id]?.categoryIds ?? []}
                      onChange={(categoryIds) =>
                        setDrafts((d) => ({
                          ...d,
                          [tier.id]: {
                            spend: d[tier.id]?.spend ?? "0",
                            discount: d[tier.id]?.discount ?? "0",
                            categoryIds,
                          },
                        }))
                      }
                    />
                  </td>
                  <td className="px-3 py-3 text-right align-top">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => saveTier(tier.id)}
                      className="text-sm underline underline-offset-4"
                    >
                      {t("save")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {message ? <p className="text-sm text-muted">{message}</p> : null}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-wide uppercase">
          {t("customerLtv")}
        </h2>
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="overflow-x-auto border border-border bg-surface">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="border-b border-border bg-background text-xs tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-3 py-2 font-medium">{t("customer")}</th>
                  <th className="px-3 py-2 font-medium">{t("lifetimeSpend")}</th>
                  <th className="px-3 py-2 font-medium">{t("tierName")}</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(({ profile }) => (
                  <tr
                    key={profile.id}
                    onClick={() => setSelectedId(profile.id)}
                    className={`cursor-pointer border-b border-border last:border-0 hover:bg-background ${
                      selectedId === profile.id ? "bg-background" : ""
                    }`}
                  >
                    <td className="px-3 py-3">
                      <p className="font-medium">
                        {profile.email || profile.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-muted">{profile.role}</p>
                    </td>
                    <td className="px-3 py-3">
                      {formatMoney(Number(profile.lifetime_spend ?? 0))}
                    </td>
                    <td className="px-3 py-3">
                      {profile.loyalty_tier || "Elite"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border border-border bg-surface p-4 text-sm">
            {!selected ? (
              <p className="text-muted">{t("selectCustomer")}</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-xs tracking-wide text-muted uppercase">
                    {t("customer")}
                  </p>
                  <p className="mt-1 font-medium">
                    {selected.profile.email || selected.profile.id}
                  </p>
                  <p className="text-muted">
                    {t("tierName")}: {selected.profile.loyalty_tier || "Elite"}
                  </p>
                  <p className="text-muted">
                    {t("lifetimeSpend")}:{" "}
                    {formatMoney(Number(selected.profile.lifetime_spend ?? 0))}
                  </p>
                </div>
                <div>
                  <p className="text-xs tracking-wide text-muted uppercase">
                    {t("orders")}
                  </p>
                  {selected.orders.length === 0 ? (
                    <p className="mt-2 text-muted">{t("noOrders")}</p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {selected.orders.map((order) => (
                        <li
                          key={order.id}
                          className="flex justify-between gap-2 border-b border-border pb-2 last:border-0"
                        >
                          <span>
                            <span className="font-mono text-xs">
                              {order.tracking_number}
                            </span>
                            <span className="ml-2 capitalize text-muted">
                              {String(order.status ?? "").replace("_", " ")}
                            </span>
                            <span className="mt-0.5 block text-xs text-muted">
                              {order.created_at
                                ? new Date(order.created_at).toLocaleDateString(
                                    locale
                                  )
                                : ""}
                            </span>
                          </span>
                          <span>
                            {formatMoney(Number(order.total_amount ?? 0))}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
