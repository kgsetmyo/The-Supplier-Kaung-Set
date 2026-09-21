"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { trackOrderByNumber } from "@/lib/orders";
import { formatMoney, type TrackedOrder } from "@/types/database";
import { Link } from "@/i18n/navigation";

export function TrackOrderForm() {
  const t = useTranslations("track");
  const tCurrency = useTranslations("currency");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") ?? "";

  const [code, setCode] = useState(initialCode);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  async function lookup(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;

    setPending(true);
    setError(null);
    setOrder(null);

    const result = await trackOrderByNumber(trimmed);
    setPending(false);

    if (!result) {
      setError(t("notFound"));
      return;
    }

    setOrder(result);
  }

  useEffect(() => {
    if (initialCode) {
      lookup(initialCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await lookup(code);
  }

  const fieldClass =
    "mt-1 w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-foreground";

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-muted">{t("subtitle")}</p>
      </div>

      <form onSubmit={onSubmit} className="border border-border bg-surface p-5">
        <label className="block text-sm">
          <span>{t("inputLabel")}</span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder={t("placeholder")}
            className={`${fieldClass} font-mono tracking-wide`}
            autoComplete="off"
          />
        </label>
        {error ? <p className="mt-3 text-sm text-sale">{error}</p> : null}
        <button
          type="submit"
          disabled={pending || !code.trim()}
          className="mt-4 w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg disabled:opacity-50"
        >
          {pending ? t("searching") : t("search")}
        </button>
      </form>

      {order ? (
        <div className="space-y-4 border border-border bg-surface p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs tracking-wide text-muted uppercase">
                {t("trackingNumber")}
              </p>
              <p className="mt-1 font-mono text-lg font-semibold">
                {order.tracking_number}
              </p>
            </div>
            <span className="rounded border border-border px-2.5 py-1 text-xs font-medium tracking-wide uppercase">
              {order.status}
            </span>
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted uppercase">{t("date")}</p>
              <p className="mt-1">
                {new Date(order.created_at).toLocaleString(locale)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted uppercase">{t("total")}</p>
              <p className="mt-1 font-medium">
                {formatMoney(order.total_amount, tCurrency("prefix"))}
              </p>
            </div>
            {order.customer_name ? (
              <div>
                <p className="text-xs text-muted uppercase">{t("customer")}</p>
                <p className="mt-1">{order.customer_name}</p>
              </div>
            ) : null}
            {order.customer_city ? (
              <div>
                <p className="text-xs text-muted uppercase">{t("city")}</p>
                <p className="mt-1">{order.customer_city}</p>
              </div>
            ) : null}
          </div>

          <div>
            <p className="text-xs tracking-wide text-muted uppercase">
              {t("items")}
            </p>
            <ul className="mt-2 divide-y divide-border border-t border-border">
              {order.items.map((item, idx) => (
                <li
                  key={`${item.name_en}-${idx}`}
                  className="flex justify-between gap-3 py-2 text-sm"
                >
                  <span>
                    {locale === "mm" ? item.name_mm : item.name_en} ×
                    {item.quantity}
                  </span>
                  <span className="text-muted">
                    {formatMoney(
                      item.price_at_time * item.quantity,
                      tCurrency("prefix")
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <p className="text-center text-sm text-muted">
        <Link href="/" className="underline underline-offset-4">
          {t("backHome")}
        </Link>
      </p>
    </div>
  );
}
