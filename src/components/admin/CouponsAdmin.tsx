"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createCoupon, setCouponActive } from "@/lib/actions";
import type { Category, Coupon, Product } from "@/types/database";
import { formatMoney } from "@/types/database";

type Props = {
  coupons: Coupon[];
  products: Product[];
  categories: Category[];
};

export function CouponsAdmin({ coupons, products, categories }: Props) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "flat">(
    "percentage"
  );
  const [discountValue, setDiscountValue] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [productFilter, setProductFilter] = useState("");

  const filteredProducts = useMemo(() => {
    const q = productFilter.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name_en.toLowerCase().includes(q) ||
        p.name_mm.toLowerCase().includes(q)
    );
  }, [products, productFilter]);

  function resetForm() {
    setCode("");
    setDiscountType("percentage");
    setDiscountValue("");
    setExpiresAt("");
    setUsageLimit("");
    setSelectedProducts([]);
    setSelectedCategories([]);
    setProductFilter("");
    setError(null);
    setSaved(false);
  }

  function toggleId(
    list: string[],
    id: string,
    setter: (next: string[]) => void
  ) {
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const result = await createCoupon({
      code,
      discountType,
      discountValue: Number(discountValue),
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      productIds: selectedProducts,
      categoryIds: selectedCategories,
      isActive: true,
    });

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setSaved(true);
    resetForm();
    setShowForm(false);
    startTransition(() => router.refresh());
  }

  async function toggleActive(coupon: Coupon) {
    setError(null);
    const result = await setCouponActive(coupon.id, !coupon.is_active);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    startTransition(() => router.refresh());
  }

  const fieldClass =
    "mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-foreground";

  function productLabel(id: string | null) {
    if (!id) return null;
    const p = products.find((x) => x.id === id);
    if (!p) return id.slice(0, 8);
    return locale === "mm" ? p.name_mm : p.name_en;
  }

  function categoryLabel(id: string | null) {
    if (!id) return null;
    const c = categories.find((x) => x.id === id);
    if (!c) return id.slice(0, 8);
    return locale === "mm" ? c.name_mm || c.name_en : c.name_en;
  }

  function isExpired(coupon: Coupon) {
    return Boolean(coupon.expires_at && new Date(coupon.expires_at) < new Date());
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("coupons")}
          </h1>
          <p className="mt-1 text-sm text-muted">{t("couponsSubtitle")}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowForm((v) => !v);
            setError(null);
            setSaved(false);
          }}
          className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-fg"
        >
          {showForm ? t("cancel") : t("createCoupon")}
        </button>
      </div>

      {showForm ? (
        <form
          onSubmit={onSubmit}
          className="space-y-4 border border-border bg-surface p-5"
        >
          <h2 className="text-sm font-semibold tracking-wide uppercase">
            {t("createCoupon")}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span>{t("couponCode")}</span>
              <input
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className={`${fieldClass} font-mono tracking-wide`}
                placeholder="SAVE10"
              />
            </label>

            <label className="block text-sm">
              <span>{t("discountAmount")}</span>
              <input
                required
                type="number"
                min={0.01}
                step="0.01"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className={fieldClass}
              />
            </label>
          </div>

          <div className="block text-sm">
            <span>{t("discountType")}</span>
            <div className="mt-1 inline-flex rounded-md border border-border p-0.5">
              {(["percentage", "flat"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setDiscountType(type)}
                  className={`rounded px-3 py-1.5 text-sm transition ${
                    discountType === type
                      ? "bg-accent text-accent-fg"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {type === "percentage" ? t("percentage") : t("flat")}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span>{t("expiresAt")}</span>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="block text-sm">
              <span>{t("usageLimit")}</span>
              <input
                type="number"
                min={1}
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder={t("usageLimitHint")}
                className={fieldClass}
              />
            </label>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <fieldset className="border border-border p-3">
              <legend className="px-1 text-sm font-medium">
                {t("assignCategories")}
              </legend>
              <p className="mb-2 text-xs text-muted">{t("eligibilityHint")}</p>
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {categories.length === 0 ? (
                  <p className="text-xs text-muted">{t("noCategories")}</p>
                ) : (
                  categories.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.id)}
                        onChange={() =>
                          toggleId(
                            selectedCategories,
                            cat.id,
                            setSelectedCategories
                          )
                        }
                      />
                      <span>
                        {locale === "mm" ? cat.name_mm || cat.name_en : cat.name_en}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </fieldset>

            <fieldset className="border border-border p-3">
              <legend className="px-1 text-sm font-medium">
                {t("assignProducts")}
              </legend>
              <input
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                placeholder={t("searchProducts")}
                className="mb-2 w-full rounded-md border border-border px-2 py-1.5 text-sm"
              />
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <label
                    key={product.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() =>
                        toggleId(
                          selectedProducts,
                          product.id,
                          setSelectedProducts
                        )
                      }
                    />
                    <span>
                      {locale === "mm" ? product.name_mm : product.name_en}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          {error ? <p className="text-sm text-sale">{error}</p> : null}
          {saved ? <p className="text-sm text-muted">{t("saved")}</p> : null}

          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg disabled:opacity-50"
          >
            {pending ? t("saving") : t("saveCoupon")}
          </button>
        </form>
      ) : null}

      <div className="overflow-x-auto border border-border bg-surface">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border bg-background text-xs tracking-wide text-muted uppercase">
            <tr>
              <th className="px-3 py-2 font-medium">{t("couponCode")}</th>
              <th className="px-3 py-2 font-medium">{t("discountType")}</th>
              <th className="px-3 py-2 font-medium">{t("discountAmount")}</th>
              <th className="px-3 py-2 font-medium">{t("expiresAt")}</th>
              <th className="px-3 py-2 font-medium">{t("usage")}</th>
              <th className="px-3 py-2 font-medium">{t("eligibility")}</th>
              <th className="px-3 py-2 font-medium">{t("status")}</th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-10 text-center text-muted">
                  {t("noCoupons")}
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => {
                const expired = isExpired(coupon);
                const rules = coupon.coupon_eligibility ?? [];
                return (
                  <tr
                    key={coupon.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-3 py-3 font-mono font-medium">
                      {coupon.code}
                    </td>
                    <td className="px-3 py-3 capitalize">
                      {coupon.discount_type === "percentage"
                        ? t("percentage")
                        : t("flat")}
                    </td>
                    <td className="px-3 py-3">
                      {coupon.discount_type === "percentage"
                        ? `${coupon.discount_value}%`
                        : formatMoney(coupon.discount_value)}
                    </td>
                    <td className="px-3 py-3 text-muted">
                      {coupon.expires_at
                        ? new Date(coupon.expires_at).toLocaleString(locale)
                        : t("noExpiry")}
                    </td>
                    <td className="px-3 py-3">
                      {coupon.times_used}
                      {coupon.usage_limit != null
                        ? ` / ${coupon.usage_limit}`
                        : ""}
                    </td>
                    <td className="px-3 py-3 text-xs text-muted">
                      {rules.length === 0 ? (
                        t("allItems")
                      ) : (
                        <span className="line-clamp-2">
                          {rules
                            .map(
                              (r) =>
                                productLabel(r.product_id) ||
                                categoryLabel(r.category_id)
                            )
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded border px-2 py-0.5 text-xs ${
                          !coupon.is_active || expired
                            ? "border-border text-muted"
                            : "border-border text-foreground"
                        }`}
                      >
                        {!coupon.is_active
                          ? t("inactive")
                          : expired
                            ? t("expired")
                            : t("activeStatus")}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => toggleActive(coupon)}
                        className="text-sm underline underline-offset-4"
                      >
                        {coupon.is_active ? t("deactivate") : t("activate")}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
