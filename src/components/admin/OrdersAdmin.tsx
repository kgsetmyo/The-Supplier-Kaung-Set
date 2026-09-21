"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Printer } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  ORDER_STATUSES,
  formatMoney,
  isKbzPaymentMethod,
  paymentMethodLabel,
  paymentPlanLabel,
  resolvePaymentPlan,
  type OrderStatus,
  type OrderStatusHistory,
  type Product,
} from "@/types/database";
import { useRouter } from "@/i18n/navigation";
import {
  updateOrderFulfillment,
  updateOrderPaymentStatus,
  bulkUpdateOrders,
  type BulkOrderAction,
} from "@/lib/actions";
import { OrderStatusTimeline } from "@/components/OrderStatusTimeline";
import { OrderPackingSlip } from "@/components/admin/OrderPackingSlip";

type AdminOrder = {
  id: string;
  tracking_number: string;
  courier_name?: string | null;
  customer_info: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    notes?: string;
  };
  total_amount: number;
  status: OrderStatus;
  payment_method?: string | null;
  payment_plan?: string | null;
  payment_screenshot_url?: string | null;
  payment_reference?: string | null;
  payment_status?: string | null;
  created_at: string;
  order_items: {
    id: string;
    quantity: number;
    price_at_time: number;
    products: Product | null;
  }[];
  order_status_history?: OrderStatusHistory[];
};

function OrderStatusBadge({ status }: { status: string }) {
  const label = status.replace("_", " ");
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
      {label}
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "border-amber-600/40 bg-amber-50 text-amber-900",
    verified: "border-emerald-700/30 bg-emerald-50 text-emerald-900",
    rejected: "border-sale/40 bg-sale/10 text-sale",
  };
  return (
    <span
      className={`inline-flex rounded border px-2 py-0.5 text-xs font-semibold capitalize ${
        styles[status] ?? "border-border bg-background text-foreground"
      }`}
    >
      {status}
    </span>
  );
}

export function OrdersAdmin({ orders }: { orders: AdminOrder[] }) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(
    orders[0]?.id ?? null
  );
  const [pending, startTransition] = useTransition();
  const [statusDraft, setStatusDraft] = useState<OrderStatus | null>(null);
  const [trackingDraft, setTrackingDraft] = useState("");
  const [courierDraft, setCourierDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);

  const selected = useMemo(
    () => orders.find((o) => o.id === selectedId) ?? null,
    [orders, selectedId]
  );

  useEffect(() => {
    if (selected) {
      setStatusDraft(selected.status);
      setTrackingDraft(selected.tracking_number ?? "");
      setCourierDraft(selected.courier_name ?? "");
      setError(null);
      setSaved(false);
    }
  }, [selected]);

  function selectOrder(order: AdminOrder) {
    setSelectedId(order.id);
  }

  async function saveOrder() {
    if (!selected || !statusDraft) return;

    setError(null);
    setSaved(false);

    const result = await updateOrderFulfillment({
      orderId: selected.id,
      status: statusDraft,
      courierName: courierDraft,
      trackingNumber: trackingDraft,
    });

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setSaved(true);
    startTransition(() => router.refresh());
  }

  async function setPayment(status: "verified" | "rejected" | "pending") {
    if (!selected) return;
    setError(null);
    setSaved(false);
    const result = await updateOrderPaymentStatus(selected.id, status);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setSaved(true);
    startTransition(() => router.refresh());
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      if (prev.size === orders.length) return new Set();
      return new Set(orders.map((o) => o.id));
    });
  }

  async function runBulk(action: BulkOrderAction) {
    if (selectedIds.size === 0) return;
    setBulkMessage(null);
    setError(null);
    const result = await bulkUpdateOrders([...selectedIds], action);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setBulkMessage(t("bulkUpdated", { count: result.updated }));
    setSelectedIds(new Set());
    startTransition(() => router.refresh());
  }

  const allSelected =
    orders.length > 0 && selectedIds.size === orders.length;
  const someSelected = selectedIds.size > 0;

  const fieldClass =
    "mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-foreground";

  return (
    <div className="space-y-6">
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t("orderTracking")}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          {someSelected ? (
            <>
              <span className="text-xs font-normal text-foreground">
                {t("bulkSelected", { count: selectedIds.size })}
              </span>
              <button
                type="button"
                disabled={pending}
                onClick={() => runBulk("verify_kbz")}
                className="rounded-md bg-emerald-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
              >
                {t("bulkVerifyKbz")}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => runBulk("mark_shipped")}
                className="rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground disabled:opacity-40"
              >
                {t("bulkMarkShipped")}
              </button>
            </>
          ) : null}
          {selected ? (
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:border-foreground/40"
            >
              <Printer className="size-4" aria-hidden />
              {t("printPackingSlip")}
            </button>
          ) : null}
        </div>
      </div>

      {bulkMessage ? (
        <p className="print:hidden text-sm font-normal text-foreground">
          {bulkMessage}
        </p>
      ) : null}

      {selected ? (
        <OrderPackingSlip order={selected} locale={locale} />
      ) : null}

      {orders.length === 0 ? (
        <p className="print:hidden border border-dashed border-border px-4 py-10 text-center text-sm text-foreground">
          {t("noOrders")}
        </p>
      ) : (
        <div className="print:hidden grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="overflow-x-auto border border-border bg-surface">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b border-border bg-background text-xs tracking-wide text-foreground uppercase">
                <tr>
                  <th className="w-10 px-3 py-2">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      aria-label={t("bulkSelectAll")}
                      className="size-4 accent-foreground"
                    />
                  </th>
                  <th className="px-3 py-2 font-semibold">{t("trackingNumber")}</th>
                  <th className="px-3 py-2 font-semibold">{t("customer")}</th>
                  <th className="px-3 py-2 font-semibold">{t("amount")}</th>
                  <th className="px-3 py-2 font-semibold">{t("status")}</th>
                  <th className="px-3 py-2 font-semibold">{t("payment")}</th>
                  <th className="px-3 py-2 font-semibold">{t("date")}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => selectOrder(order)}
                    className={`cursor-pointer border-b border-border last:border-0 hover:bg-background ${
                      selectedId === order.id ? "bg-background" : ""
                    }`}
                  >
                    <td
                      className="px-3 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(order.id)}
                        onChange={() => toggleSelect(order.id)}
                        aria-label={t("bulkSelectOrder", {
                          tracking: order.tracking_number,
                        })}
                        className="size-4 accent-foreground"
                      />
                    </td>
                    <td className="px-3 py-3 font-mono text-xs">
                      {order.tracking_number}
                    </td>
                    <td className="px-3 py-3">
                      {order.customer_info?.name ?? "—"}
                    </td>
                    <td className="px-3 py-3">
                      {formatMoney(Number(order.total_amount))}
                    </td>
                    <td className="px-3 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-3 py-3">
                      {isKbzPaymentMethod(order.payment_method) ? (
                        <PaymentStatusBadge
                          status={order.payment_status ?? "pending"}
                        />
                      ) : (
                        <span className="text-xs font-normal text-foreground">
                          {paymentMethodLabel(order.payment_method)}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-xs text-foreground">
                      {new Date(order.created_at).toLocaleDateString(locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 border border-border bg-surface p-4">
            {!selected ? (
              <p className="text-sm text-foreground">{t("selectOrder")}</p>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <OrderStatusBadge status={selected.status} />
                  {isKbzPaymentMethod(selected.payment_method) ? (
                    <PaymentStatusBadge
                      status={selected.payment_status ?? "pending"}
                    />
                  ) : null}
                </div>

                <div className="text-sm text-foreground">
                  <p className="text-xs font-semibold tracking-wide uppercase">
                    {t("customer")}
                  </p>
                  <p className="mt-1 font-semibold">
                    {selected.customer_info?.name}
                  </p>
                  <p className="text-xs font-normal">
                    {selected.customer_info?.email}
                  </p>
                  <p className="text-xs font-normal">
                    {selected.customer_info?.phone}
                  </p>
                  <p className="mt-2 text-xs font-normal">
                    {selected.customer_info?.address}
                    {selected.customer_info?.city
                      ? `, ${selected.customer_info.city}`
                      : ""}
                  </p>
                </div>

                <div className="text-sm">
                  <p className="text-xs font-semibold tracking-wide uppercase">
                    {t("items")}
                  </p>
                  <ul className="mt-2 space-y-2">
                    {selected.order_items?.map((item) => (
                      <li
                        key={item.id}
                        className="flex justify-between gap-2 border-b border-border pb-2 text-foreground last:border-0"
                      >
                        <span>
                          {locale === "mm"
                            ? item.products?.name_mm
                            : item.products?.name_en}{" "}
                          ×{item.quantity}
                        </span>
                        <span>
                          {formatMoney(
                            Number(item.price_at_time) * item.quantity
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {selected.payment_method ? (
                  <section className="space-y-3 border-t border-border pt-4">
                    <h2 className="text-sm font-semibold tracking-wide uppercase">
                      {t("payment")}
                    </h2>
                    <p className="text-sm font-semibold text-foreground">
                      {paymentMethodLabel(selected.payment_method)}
                      {resolvePaymentPlan(
                        selected.payment_method,
                        selected.payment_plan
                      )
                        ? ` · ${paymentPlanLabel(
                            resolvePaymentPlan(
                              selected.payment_method,
                              selected.payment_plan
                            )
                          )}`
                        : ""}
                    </p>
                    {selected.payment_reference ? (
                      <p className="font-mono text-xs text-foreground">
                        {t("paymentReference")}: {selected.payment_reference}
                      </p>
                    ) : null}

                    {isKbzPaymentMethod(selected.payment_method) &&
                    selected.payment_screenshot_url ? (
                      <div className="overflow-hidden rounded-md border border-border bg-background">
                        <p className="border-b border-border px-3 py-2 text-xs font-semibold uppercase">
                          {t("paymentReceipt")}
                        </p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selected.payment_screenshot_url}
                          alt={t("paymentReceipt")}
                          className="max-h-80 w-full object-contain bg-background p-2"
                        />
                        <a
                          href={selected.payment_screenshot_url}
                          target="_blank"
                          rel="noreferrer"
                          className="block border-t border-border px-3 py-2 text-xs font-semibold underline underline-offset-2"
                        >
                          {t("openReceipt")}
                        </a>
                      </div>
                    ) : null}

                    {isKbzPaymentMethod(selected.payment_method) ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={pending || selected.payment_status === "verified"}
                          onClick={() => setPayment("verified")}
                          className="rounded-md bg-emerald-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
                        >
                          {t("verifyPayment")}
                        </button>
                        <button
                          type="button"
                          disabled={pending || selected.payment_status === "rejected"}
                          onClick={() => setPayment("rejected")}
                          className="rounded-md border border-sale bg-sale/10 px-3 py-2 text-xs font-semibold text-sale disabled:opacity-40"
                        >
                          {t("rejectPayment")}
                        </button>
                        {selected.payment_status === "rejected" ? (
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => setPayment("pending")}
                            className="rounded-md border border-border px-3 py-2 text-xs font-semibold"
                          >
                            {t("resetPayment")}
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </section>
                ) : null}

                <section className="space-y-3 border-t border-border pt-4">
                  <h2 className="text-sm font-semibold tracking-wide uppercase">
                    {t("fulfillmentTitle")}
                  </h2>

                  <label className="block text-sm">
                    <span>{t("updateStatus")}</span>
                    <select
                      className={fieldClass}
                      value={statusDraft ?? selected.status}
                      onChange={(e) =>
                        setStatusDraft(e.target.value as OrderStatus)
                      }
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm">
                    <span>{t("courierName")}</span>
                    <input
                      className={fieldClass}
                      value={courierDraft}
                      onChange={(e) => setCourierDraft(e.target.value)}
                      placeholder={t("courierPlaceholder")}
                    />
                  </label>

                  <label className="block text-sm">
                    <span>{t("trackingNumber")}</span>
                    <input
                      className={`${fieldClass} font-mono`}
                      value={trackingDraft}
                      onChange={(e) =>
                        setTrackingDraft(e.target.value.toUpperCase())
                      }
                      placeholder="KS-…"
                    />
                    <p className="mt-1 text-xs text-foreground">
                      {t("trackingHint")}
                    </p>
                  </label>

                  {error ? <p className="text-sm text-sale">{error}</p> : null}
                  {saved ? (
                    <p className="text-sm text-foreground">{t("saved")}</p>
                  ) : null}

                  <button
                    type="button"
                    disabled={pending}
                    onClick={saveOrder}
                    className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-fg disabled:opacity-50"
                  >
                    {pending ? t("saving") : t("save")}
                  </button>
                </section>

                <section className="border-t border-border pt-4">
                  <h2 className="mb-3 text-sm font-semibold tracking-wide uppercase">
                    {t("timeline")}
                  </h2>
                  <OrderStatusTimeline
                    history={selected.order_status_history ?? []}
                  />
                </section>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
