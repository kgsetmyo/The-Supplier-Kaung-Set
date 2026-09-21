"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, ChevronDown, ChevronUp, Copy } from "lucide-react";
import { Link } from "@/i18n/navigation";
import {
  formatMoney,
  type OrderStatus,
  type OrderWithItems,
} from "@/types/database";
import { OrderStatusTimeline } from "@/components/OrderStatusTimeline";

function shortOrderId(id: string) {
  return `#ORD-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

function OrderStatusBadge({ status }: { status: OrderStatus | string }) {
  const styles: Record<string, string> = {
    pending: "border-amber-600/40 bg-amber-50 text-amber-900",
    processing: "border-sky-600/40 bg-sky-50 text-sky-900",
    shipped: "border-indigo-600/40 bg-indigo-50 text-indigo-900",
    in_transit: "border-violet-600/40 bg-violet-50 text-violet-900",
    delivered: "border-emerald-700/30 bg-emerald-50 text-emerald-900",
    cancelled: "border-sale/40 bg-sale/10 text-sale",
  };
  return (
    <span
      className={`inline-flex rounded border px-2 py-0.5 text-xs font-semibold capitalize ${
        styles[status] ?? "border-border bg-background text-foreground"
      }`}
    >
      {String(status).replace("_", " ")}
    </span>
  );
}

function CopyTrackingButton({ value }: { value: string }) {
  const t = useTranslations("account");
  const [copied, setCopied] = useState(false);

  async function onCopy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore clipboard failures
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-background text-foreground transition hover:bg-surface"
      aria-label={copied ? t("copied") : t("copyTracking")}
      title={copied ? t("copied") : t("copyTracking")}
    >
      {copied ? (
        <Check className="size-3.5 text-emerald-700" aria-hidden />
      ) : (
        <Copy className="size-3.5" aria-hidden />
      )}
    </button>
  );
}

export function OrderHistoryList({ orders }: { orders: OrderWithItems[] }) {
  const t = useTranslations("account");
  const tCurrency = useTranslations("currency");
  const locale = useLocale();
  const [openId, setOpenId] = useState<string | null>(null);

  if (orders.length === 0) {
    return (
      <div className="border border-dashed border-border px-4 py-12 text-center">
        <p className="text-sm font-normal text-foreground">{t("empty")}</p>
        <Link
          href="/"
          className="mt-4 inline-block text-sm font-semibold underline underline-offset-4"
        >
          {t("shopNow")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const expanded = openId === order.id;
        const items = order.order_items ?? [];

        return (
          <article
            key={order.id}
            className="overflow-hidden border border-border bg-surface"
          >
            <div className="flex w-full items-start justify-between gap-3 px-4 py-4 transition hover:bg-background/60">
              <button
                type="button"
                onClick={() => setOpenId(expanded ? null : order.id)}
                aria-expanded={expanded}
                className="min-w-0 flex-1 space-y-2 text-left"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-mono text-sm font-bold text-foreground">
                    {shortOrderId(order.id)}
                  </p>
                  <OrderStatusBadge status={order.status} />
                </div>

                <p className="text-xs font-normal text-foreground">
                  {t("date")}:{" "}
                  {new Date(order.created_at).toLocaleString(locale)}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold tracking-wide text-foreground uppercase">
                    {t("tracking")}
                  </span>
                  <span className="font-mono text-sm font-semibold text-foreground">
                    {order.tracking_number || "—"}
                  </span>
                </div>
              </button>

              <div className="flex shrink-0 items-center gap-2 self-start pt-0.5">
                {order.tracking_number ? (
                  <CopyTrackingButton value={order.tracking_number} />
                ) : null}
                <span className="text-sm font-bold text-foreground">
                  {formatMoney(order.total_amount, tCurrency("prefix"))}
                </span>
                <button
                  type="button"
                  onClick={() => setOpenId(expanded ? null : order.id)}
                  aria-expanded={expanded}
                  aria-label={expanded ? t("collapseOrder") : t("expandOrder")}
                  className="inline-flex size-8 items-center justify-center rounded-md text-foreground transition hover:bg-background"
                >
                  {expanded ? (
                    <ChevronUp className="size-4" aria-hidden />
                  ) : (
                    <ChevronDown className="size-4" aria-hidden />
                  )}
                </button>
              </div>
            </div>

            {expanded ? (
              <div className="space-y-5 border-t border-border px-4 py-4">
                <div className="grid gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-foreground uppercase">
                      {t("status")}
                    </p>
                    <div className="mt-1">
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-foreground uppercase">
                      {t("courier")}
                    </p>
                    <p className="mt-1 font-normal text-foreground">
                      {order.courier_name || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-foreground uppercase">
                      {t("tracking")}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="font-mono text-xs font-semibold text-foreground sm:text-sm">
                        {order.tracking_number || "—"}
                      </p>
                      {order.tracking_number ? (
                        <CopyTrackingButton value={order.tracking_number} />
                      ) : null}
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold tracking-wide text-foreground uppercase">
                    {t("items")}
                  </p>
                  {items.length === 0 ? (
                    <p className="text-sm font-normal text-foreground">
                      {t("noItems")}
                    </p>
                  ) : (
                    <ul className="divide-y divide-border border border-border">
                      {items.map((item) => {
                        const name =
                          locale === "mm"
                            ? item.products?.name_mm || item.products?.name_en
                            : item.products?.name_en || item.products?.name_mm;
                        return (
                          <li
                            key={item.id}
                            className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm text-foreground"
                          >
                            <span className="min-w-0 truncate font-normal">
                              {name || t("unknownItem")} ×{item.quantity}
                            </span>
                            <span className="shrink-0 font-semibold">
                              {formatMoney(
                                Number(item.price_at_time) * item.quantity,
                                tCurrency("prefix")
                              )}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold tracking-wide text-foreground uppercase">
                    {t("timeline")}
                  </p>
                  <OrderStatusTimeline
                    history={order.order_status_history ?? []}
                  />
                </div>

                <div className="flex justify-end border-t border-border pt-3 text-sm">
                  <span className="font-normal text-foreground">
                    {t("total")}
                  </span>
                  <span className="ml-3 font-bold text-foreground">
                    {formatMoney(order.total_amount, tCurrency("prefix"))}
                  </span>
                </div>
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
