"use client";

import { formatMoney, isKbzPaymentMethod, paymentMethodLabel, paymentPlanLabel, resolvePaymentPlan } from "@/types/database";
import type { Product } from "@/types/database";

type PackingSlipOrder = {
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
  payment_method?: string | null;
  payment_plan?: string | null;
  payment_status?: string | null;
  created_at: string;
  order_items: {
    id: string;
    quantity: number;
    price_at_time: number;
    products: Product | null;
  }[];
};

function shortOrderId(id: string) {
  return `ORD-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

/** Print-only packing slip / invoice (black & white A4). */
export function OrderPackingSlip({
  order,
  locale,
}: {
  order: PackingSlipOrder;
  locale: string;
}) {
  const info = order.customer_info ?? {};
  const paymentLabel = paymentMethodLabel(order.payment_method);
  const plan = resolvePaymentPlan(order.payment_method, order.payment_plan);
  const paymentStatus = (order.payment_status ?? "pending").replace("_", " ");

  return (
    <div className="packing-slip hidden print:block">
      <header className="mb-8 border-b border-black pb-4">
        <p className="text-xs tracking-widest uppercase">Packing slip</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          The supplier Kaung Set
        </h1>
        <p className="mt-2 text-sm">
          Order {shortOrderId(order.id)} · Tracking {order.tracking_number}
        </p>
        <p className="text-sm">
          Date: {new Date(order.created_at).toLocaleString(locale)}
        </p>
      </header>

      <section className="mb-6 grid grid-cols-2 gap-6 text-sm">
        <div>
          <p className="text-xs font-bold tracking-wide uppercase">Ship to</p>
          <p className="mt-1 font-semibold">{info.name || "—"}</p>
          <p>{info.phone || "—"}</p>
          <p>{info.email || "—"}</p>
          <p className="mt-1 whitespace-pre-wrap">
            {[info.address, info.city].filter(Boolean).join(", ") || "—"}
          </p>
          {info.notes ? (
            <p className="mt-2 text-xs">Notes: {info.notes}</p>
          ) : null}
        </div>
        <div>
          <p className="text-xs font-bold tracking-wide uppercase">Payment</p>
          <p className="mt-1">{paymentLabel}</p>
          {plan ? <p>{paymentPlanLabel(plan)}</p> : null}
          {isKbzPaymentMethod(order.payment_method) ? (
            <p className="capitalize">Status: {paymentStatus}</p>
          ) : null}
          {order.courier_name ? (
            <p className="mt-2">Courier: {order.courier_name}</p>
          ) : null}
        </div>
      </section>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-black text-left">
            <th className="py-2 pr-2 font-bold">Item</th>
            <th className="py-2 pr-2 font-bold">Qty</th>
            <th className="py-2 pr-2 text-right font-bold">Unit</th>
            <th className="py-2 text-right font-bold">Line</th>
          </tr>
        </thead>
        <tbody>
          {(order.order_items ?? []).map((item) => {
            const name =
              locale === "mm"
                ? item.products?.name_mm || item.products?.name_en
                : item.products?.name_en || item.products?.name_mm;
            const unit = Number(item.price_at_time);
            return (
              <tr key={item.id} className="border-b border-black/30">
                <td className="py-2 pr-2">{name || "Product"}</td>
                <td className="py-2 pr-2">{item.quantity}</td>
                <td className="py-2 pr-2 text-right">{formatMoney(unit)}</td>
                <td className="py-2 text-right">
                  {formatMoney(unit * item.quantity)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end border-t-2 border-black pt-3 text-base font-bold">
        <span>Total&nbsp;&nbsp;{formatMoney(Number(order.total_amount))}</span>
      </div>

      <footer className="mt-10 text-xs text-black/70">
        Thank you for shopping with The supplier Kaung Set.
      </footer>
    </div>
  );
}
