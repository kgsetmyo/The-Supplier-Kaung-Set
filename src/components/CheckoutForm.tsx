"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  validatePromoCode,
  type AppliedPromo,
} from "@/lib/promotions";
import { placeOrder } from "@/lib/orders";
import { useCartStore } from "@/store/cart";
import {
  formatMoney,
  getUnitPrice,
  isKbzPaymentMethod,
  paymentMethodLabel,
  type CustomerInfo,
  type PaymentMethod,
  type PaymentPlan,
} from "@/types/database";

type CheckoutFormProps = {
  defaults?: Partial<CustomerInfo> | null;
};

type PlacedOrder = {
  orderId: string;
  trackingNumber: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  promoCode?: string | null;
  promoPercent?: number | null;
  promoDiscount?: number | null;
};

const FREE_SHIPPING_THRESHOLD = 50_000;
const SHIPPING_FEE = 3_000;

const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ?? "";

const PAYMENT_CHANNELS: PaymentMethod[] = [
  "kbz_pay",
  "kbz_banking",
  "kbz_special",
];

function shortOrderId(id: string) {
  return `ORD-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

function whatsappProofHref(
  order: PlacedOrder,
  totalLabel: string,
  currencyPrefix: string
) {
  if (!WHATSAPP_NUMBER) return null;
  const lines = [
    "Hello! I just placed an order.",
    `Order ID: #${shortOrderId(order.orderId)}`,
    `Total Amount: ${totalLabel}`,
    `Payment Method: ${paymentMethodLabel(order.paymentMethod)}`,
  ];
  if (order.promoCode && order.promoDiscount && order.promoDiscount > 0) {
    const pct =
      order.promoPercent && order.promoPercent > 0
        ? ` (${order.promoPercent}% off)`
        : "";
    lines.push(
      `Promo Code: ${order.promoCode}${pct} −${formatMoney(order.promoDiscount, currencyPrefix)}`
    );
  }
  lines.push(
    "I will attach my payment screenshot here for verification."
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export function CheckoutForm({ defaults }: CheckoutFormProps) {
  const t = useTranslations();
  const locale = useLocale();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const currencyPrefix = t("currency.prefix");

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("kbz_pay");
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan>("full");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const [promoInput, setPromoInput] = useState("");
  const [promoPending, setPromoPending] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);

  const merchandise = useMemo(
    () =>
      items.reduce((sum, i) => {
        const unit =
          typeof i.unitPrice === "number"
            ? i.unitPrice
            : getUnitPrice(i.product);
        return sum + unit * i.quantity;
      }, 0),
    [items]
  );

  const catalogSavings = useMemo(
    () =>
      items.reduce((sum, i) => {
        const list = Number(i.product.price);
        const unit =
          typeof i.unitPrice === "number"
            ? i.unitPrice
            : getUnitPrice(i.product);
        return sum + Math.max(0, list - unit) * i.quantity;
      }, 0),
    [items]
  );

  const couponDiscount = appliedPromo?.discountAmount ?? 0;
  const afterCoupon = Math.max(0, merchandise - couponDiscount);
  const shipping =
    afterCoupon >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = afterCoupon + shipping;
  const payNowAmount =
    paymentPlan === "half" ? Math.ceil(total / 2) : total;
  const balanceOnDelivery =
    paymentPlan === "half" ? Math.max(0, total - payNowAmount) : 0;

  // Re-validate when cart total changes so discount stays accurate
  useEffect(() => {
    if (!appliedPromo) return;
    let cancelled = false;
    void (async () => {
      const result = await validatePromoCode(appliedPromo.code, merchandise);
      if (cancelled) return;
      if (!result.ok) {
        setAppliedPromo(null);
        setPromoSuccess(null);
        setPromoError(t("checkout.promoRecheckFailed"));
        return;
      }
      setAppliedPromo(result.promo);
      if (result.promo.discountPercentage > 0) {
        setPromoSuccess(
          t("checkout.promoPercentApplied", {
            percent: result.promo.discountPercentage,
          })
        );
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when merchandise changes
  }, [merchandise]);

  async function onApplyPromo() {
    setPromoPending(true);
    setPromoError(null);
    setPromoSuccess(null);
    const result = await validatePromoCode(promoInput, merchandise);
    setPromoPending(false);

    if (!result.ok) {
      setAppliedPromo(null);
      if (result.code === "empty") {
        setPromoError(t("checkout.promoEmpty"));
      } else {
        setPromoError(t("checkout.promoInvalidExpired"));
      }
      return;
    }

    setAppliedPromo(result.promo);
    setPromoInput(result.promo.code);
    setPromoError(null);
    if (result.promo.discountPercentage > 0) {
      setPromoSuccess(
        t("checkout.promoPercentApplied", {
          percent: result.promo.discountPercentage,
        })
      );
    } else {
      setPromoSuccess(t("checkout.promoApplied", { code: result.promo.code }));
    }
  }

  function onRemovePromo() {
    setAppliedPromo(null);
    setPromoError(null);
    setPromoSuccess(null);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (items.length === 0) return;

    setPending(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const paymentReference = String(form.get("payment_reference") ?? "").trim();

    if (isKbzPaymentMethod(paymentMethod) && !paymentReference && !receiptFile) {
      setPending(false);
      setError(t("checkout.kbzProofRequired"));
      return;
    }

    let couponId: string | null = null;
    let discountApplied = 0;
    let promoSnapshot: AppliedPromo | null = null;

    if (appliedPromo) {
      const recheck = await validatePromoCode(appliedPromo.code, merchandise);
      if (!recheck.ok) {
        setPending(false);
        setAppliedPromo(null);
        setPromoSuccess(null);
        setPromoError(t("checkout.promoInvalidExpired"));
        setError(t("checkout.promoRecheckFailed"));
        return;
      }
      promoSnapshot = recheck.promo;
      couponId = recheck.promo.couponId;
      discountApplied = recheck.promo.discountAmount;
    }

    const afterDiscount = Math.max(0, merchandise - discountApplied);
    const shippingFee =
      afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const chargedTotal = afterDiscount + shippingFee;

    const result = await placeOrder({
      customer: {
        name: String(form.get("name") ?? "").trim(),
        phone: String(form.get("phone") ?? "").trim(),
        email: String(form.get("email") ?? "").trim(),
        address: String(form.get("address") ?? "").trim(),
        city: String(form.get("city") ?? "").trim(),
        notes: String(form.get("notes") ?? "").trim() || undefined,
      },
      items,
      paymentMethod,
      paymentPlan,
      totalAmount: chargedTotal,
      couponId,
      discountApplied,
      paymentReference: isKbzPaymentMethod(paymentMethod)
        ? paymentReference
        : undefined,
      paymentReceipt: isKbzPaymentMethod(paymentMethod) ? receiptFile : null,
    });

    setPending(false);

    if (!result.ok) {
      setError(
        result.message === "kbz_proof_required"
          ? t("checkout.kbzProofRequired")
          : result.message || t("checkout.error")
      );
      return;
    }

    clearCart();
    setPlacedOrder({
      orderId: result.orderId,
      trackingNumber: result.trackingNumber,
      totalAmount: chargedTotal,
      paymentMethod,
      promoCode: promoSnapshot?.code ?? null,
      promoPercent: promoSnapshot?.discountPercentage ?? null,
      promoDiscount: promoSnapshot?.discountAmount ?? null,
    });
  }

  if (placedOrder) {
    const totalLabel = formatMoney(placedOrder.totalAmount, currencyPrefix);
    const waHref = whatsappProofHref(
      placedOrder,
      totalLabel,
      currencyPrefix
    );

    return (
      <div className="mx-auto max-w-lg border border-border bg-surface px-6 py-12 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t("checkout.successTitle")}
        </h1>
        <p className="mt-2 text-sm font-normal text-foreground">
          {t("checkout.successBody")}
        </p>
        <p className="mt-6 text-xs font-semibold tracking-wide text-foreground uppercase">
          {t("checkout.trackingLabel")}
        </p>
        <p className="mt-2 font-mono text-xl font-semibold tracking-wide text-foreground">
          {placedOrder.trackingNumber}
        </p>
        <p className="mt-3 text-xs font-normal text-foreground">
          {t("checkout.trackingHint")}
        </p>

        {waHref ? (
          <div className="mt-8 space-y-2">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#20b958] sm:w-auto"
            >
              <MessageCircle className="size-5 fill-current" aria-hidden />
              {t("checkout.whatsappProof")}
            </a>
            <p className="text-xs font-normal text-foreground">
              {t("checkout.whatsappProofHint")}
            </p>
          </div>
        ) : null}

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/track?code=${encodeURIComponent(placedOrder.trackingNumber)}`}
            className="inline-block rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg"
          >
            {t("checkout.trackNow")}
          </Link>
          <Link
            href="/"
            className="inline-block text-sm font-normal text-foreground underline underline-offset-4"
          >
            {t("checkout.backHome")}
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg border border-dashed border-border px-6 py-12 text-center">
        <p className="text-sm font-normal text-foreground">
          {t("checkout.emptyCart")}
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-semibold text-foreground underline underline-offset-4"
        >
          {t("checkout.backHome")}
        </Link>
      </div>
    );
  }

  const fieldClass =
    "mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm font-normal text-foreground outline-none transition focus:border-foreground";
  const labelClass = "block text-xs font-semibold text-foreground";

  return (
    <div className="flex flex-col items-start gap-8 lg:grid lg:grid-cols-12 lg:gap-10">
      <form onSubmit={onSubmit} className="w-full space-y-5 lg:col-span-7">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl lg:text-4xl">
            {t("checkout.title")}
          </h1>
          <p className="mt-1.5 text-sm font-normal text-foreground">
            {t("checkout.subtitle")}
          </p>
        </div>

        <section className="border border-border bg-surface p-5 sm:p-6">
          <h2 className="text-sm font-bold tracking-wide text-foreground">
            {t("checkout.sectionContact")}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className={`${labelClass} sm:col-span-2`}>
              {t("checkout.name")}
              <input
                name="name"
                type="text"
                required
                autoComplete="name"
                defaultValue={defaults?.name ?? ""}
                className={fieldClass}
              />
            </label>
            <label className={labelClass}>
              {t("checkout.phone")}
              <input
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                defaultValue={defaults?.phone ?? ""}
                className={fieldClass}
              />
            </label>
            <label className={labelClass}>
              {t("checkout.email")}
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                defaultValue={defaults?.email ?? ""}
                className={fieldClass}
              />
            </label>
          </div>
        </section>

        <section className="border border-border bg-surface p-5 sm:p-6">
          <h2 className="text-sm font-bold tracking-wide text-foreground">
            {t("checkout.sectionShipping")}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className={`${labelClass} sm:col-span-2`}>
              {t("checkout.address")}
              <input
                name="address"
                type="text"
                required
                autoComplete="street-address"
                defaultValue={defaults?.address ?? ""}
                className={fieldClass}
              />
            </label>
            <label className={labelClass}>
              {t("checkout.city")}
              <input
                name="city"
                type="text"
                required
                autoComplete="address-level2"
                defaultValue={defaults?.city ?? ""}
                className={fieldClass}
              />
            </label>
            <label className={`${labelClass} sm:col-span-2`}>
              {t("checkout.notes")}
              <textarea name="notes" rows={3} className={fieldClass} />
            </label>
          </div>
        </section>

        <section className="border border-border bg-surface p-5 sm:p-6">
          <h2 className="text-sm font-bold tracking-wide text-foreground">
            {t("checkout.sectionPayment")}
          </h2>

          <fieldset className="mt-4 space-y-3">
            <legend className="text-xs font-semibold text-foreground">
              {t("checkout.paymentMethod")}
            </legend>

            {(
              [
                {
                  value: "kbz_pay" as const,
                  title: t("checkout.paymentKbzPay"),
                  hint: t("checkout.paymentKbzPayHint"),
                },
                {
                  value: "kbz_banking" as const,
                  title: t("checkout.paymentKbzBanking"),
                  hint: t("checkout.paymentKbzBankingHint"),
                },
                {
                  value: "kbz_special" as const,
                  title: t("checkout.paymentKbzSpecial"),
                  hint: t("checkout.paymentKbzSpecialHint"),
                },
              ] as const
            ).map((opt) => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-start gap-3 border border-border bg-background px-3 py-3 transition hover:border-foreground/30 has-[:checked]:border-foreground"
              >
                <input
                  type="radio"
                  name="payment_method"
                  value={opt.value}
                  checked={paymentMethod === opt.value}
                  onChange={() => setPaymentMethod(opt.value)}
                  className="mt-0.5"
                />
                <span>
                  <span className="block text-sm font-semibold text-foreground">
                    {opt.title}
                  </span>
                  <span className="mt-0.5 block text-xs font-normal text-foreground">
                    {opt.hint}
                  </span>
                </span>
              </label>
            ))}
          </fieldset>

          <fieldset className="mt-4 space-y-3">
            <legend className="text-xs font-semibold text-foreground">
              {t("checkout.paymentPlan")}
            </legend>

            <label className="flex cursor-pointer items-start gap-3 border border-border bg-background px-3 py-3 transition hover:border-foreground/30 has-[:checked]:border-foreground">
              <input
                type="radio"
                name="payment_plan"
                value="full"
                checked={paymentPlan === "full"}
                onChange={() => setPaymentPlan("full")}
                className="mt-0.5"
              />
              <span>
                <span className="block text-sm font-semibold text-foreground">
                  {t("checkout.paymentPlanFull")}
                </span>
                <span className="mt-0.5 block text-xs font-normal text-foreground">
                  {t("checkout.paymentPlanFullHint")}
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 border border-border bg-background px-3 py-3 transition hover:border-foreground/30 has-[:checked]:border-foreground">
              <input
                type="radio"
                name="payment_plan"
                value="half"
                checked={paymentPlan === "half"}
                onChange={() => setPaymentPlan("half")}
                className="mt-0.5"
              />
              <span>
                <span className="block text-sm font-semibold text-foreground">
                  {t("checkout.paymentPlanHalf")}
                </span>
                <span className="mt-0.5 block text-xs font-normal text-foreground">
                  {t("checkout.paymentPlanHalfHint")}
                </span>
              </span>
            </label>
          </fieldset>

          {PAYMENT_CHANNELS.includes(paymentMethod) ||
          isKbzPaymentMethod(paymentMethod) ? (
            <div className="mt-4 space-y-4 border border-border bg-background p-4">
              <p className="text-xs font-normal leading-relaxed text-foreground">
                {paymentPlan === "half"
                  ? t("checkout.kbzHalfInstructions", {
                      method: paymentMethodLabel(paymentMethod),
                      amount: formatMoney(payNowAmount, currencyPrefix),
                      balance: formatMoney(balanceOnDelivery, currencyPrefix),
                    })
                  : t("checkout.kbzFullInstructions", {
                      method: paymentMethodLabel(paymentMethod),
                      amount: formatMoney(payNowAmount, currencyPrefix),
                    })}
              </p>

              <div className="mx-auto w-full max-w-[220px] overflow-hidden border border-border bg-surface p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/kbz-qr-placeholder.svg"
                  alt={t("checkout.kbzQrAlt")}
                  className="h-auto w-full"
                />
              </div>

              <label className={labelClass}>
                {t("checkout.paymentReference")}
                <input
                  name="payment_reference"
                  type="text"
                  autoComplete="off"
                  placeholder={t("checkout.paymentReferencePlaceholder")}
                  className={fieldClass}
                />
              </label>

              <div>
                <p className={`${labelClass} mb-1.5`}>
                  {t("checkout.paymentReceipt")}
                </p>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) =>
                    setReceiptFile(e.target.files?.[0] ?? null)
                  }
                  className="block w-full text-xs font-normal text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-2 file:text-xs file:font-semibold file:text-accent-fg"
                />
                {receiptFile ? (
                  <p className="mt-1.5 text-xs font-normal text-foreground">
                    {receiptFile.name}
                  </p>
                ) : null}
                <p className="mt-1.5 text-xs font-normal text-foreground">
                  {t("checkout.kbzProofHint")}
                </p>
              </div>
            </div>
          ) : null}
        </section>

        {error ? <p className="text-sm font-normal text-sale">{error}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-accent px-4 py-3.5 text-sm font-semibold text-accent-fg transition hover:opacity-90 disabled:opacity-50 lg:sticky lg:bottom-4"
        >
          {pending ? t("checkout.placing") : t("checkout.placeOrder")}
        </button>
      </form>

      <aside className="w-full border border-border bg-surface p-4 sm:p-6 lg:col-span-5 lg:sticky lg:top-24">
        <h2 className="text-sm font-bold tracking-wide text-foreground uppercase">
          {t("checkout.orderSummary")}
        </h2>

        <ul className="mt-4 max-h-[40vh] space-y-3 overflow-y-auto pr-1">
          {items.map(({ product, quantity, unitPrice }) => {
            const name = locale === "mm" ? product.name_mm : product.name_en;
            const unit =
              typeof unitPrice === "number"
                ? unitPrice
                : getUnitPrice(product);
            const list = Number(product.price);
            return (
              <li key={product.id} className="flex gap-3 text-sm">
                <div className="relative size-14 shrink-0 overflow-hidden border border-border bg-background">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : null}
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-semibold text-background">
                    {quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {name}
                  </p>
                  <p className="mt-0.5 text-xs font-normal text-foreground">
                    {formatMoney(unit, currencyPrefix)}
                    {product.discount_price != null ? (
                      <span className="ml-1.5 line-through">
                        {formatMoney(list, currencyPrefix)}
                      </span>
                    ) : null}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-foreground">
                  {formatMoney(unit * quantity, currencyPrefix)}
                </p>
              </li>
            );
          })}
        </ul>

        <div className="mt-5 border-t border-border pt-4">
          <label className={labelClass}>
            {t("checkout.promoCode")}
          </label>
          <div className="mt-1.5 flex gap-2">
            <input
              type="text"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
              disabled={Boolean(appliedPromo) || promoPending}
              placeholder={t("checkout.promoPlaceholder")}
              autoComplete="off"
              className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm font-normal tracking-wide text-foreground uppercase outline-none transition focus:border-foreground disabled:opacity-60"
            />
            {appliedPromo ? (
              <button
                type="button"
                onClick={onRemovePromo}
                className="shrink-0 rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:border-foreground/40"
              >
                {t("checkout.promoRemove")}
              </button>
            ) : (
              <button
                type="button"
                onClick={onApplyPromo}
                disabled={promoPending || !promoInput.trim()}
                className="shrink-0 rounded-md bg-foreground px-3 py-2 text-xs font-semibold text-background transition hover:opacity-90 disabled:opacity-50"
              >
                {promoPending
                  ? t("checkout.promoApplying")
                  : t("checkout.promoApply")}
              </button>
            )}
          </div>
          {promoError ? (
            <p className="mt-1.5 text-xs font-normal text-sale">{promoError}</p>
          ) : null}
          {promoSuccess && !promoError ? (
            <p className="mt-1.5 text-xs font-semibold text-emerald-700">
              {promoSuccess}
            </p>
          ) : null}
        </div>

        <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-normal text-foreground">
              {t("checkout.subtotal")}
            </span>
            <span className="text-sm font-semibold text-foreground">
              {formatMoney(merchandise + catalogSavings, currencyPrefix)}
            </span>
          </div>

          {catalogSavings > 0 ? (
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-normal text-foreground">
                {t("checkout.discounts")}
              </span>
              <span className="text-sm font-semibold text-sale">
                −{formatMoney(catalogSavings, currencyPrefix)}
              </span>
            </div>
          ) : null}

          {couponDiscount > 0 ? (
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-normal text-foreground">
                {t("checkout.promoDiscount", {
                  code: appliedPromo?.code ?? "",
                })}
              </span>
              <span className="text-sm font-semibold text-sale">
                −{formatMoney(couponDiscount, currencyPrefix)}
              </span>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-normal text-foreground">
              {t("checkout.shipping")}
            </span>
            <span className="text-sm font-semibold text-foreground">
              {shipping === 0
                ? t("checkout.shippingFree")
                : formatMoney(shipping, currencyPrefix)}
            </span>
          </div>

          {shipping > 0 ? (
            <p className="text-[11px] font-normal leading-relaxed text-foreground">
              {t("checkout.shippingHint", {
                amount: formatMoney(FREE_SHIPPING_THRESHOLD, currencyPrefix),
              })}
            </p>
          ) : null}

          <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
            <span className="text-sm font-bold text-foreground">
              {t("checkout.total")}
            </span>
            <span className="text-base font-bold text-foreground">
              {formatMoney(total, currencyPrefix)}
            </span>
          </div>

          {paymentPlan === "half" ? (
            <>
              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="text-xs font-normal text-foreground">
                  {t("checkout.payNow")}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {formatMoney(payNowAmount, currencyPrefix)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-normal text-foreground">
                  {t("checkout.balanceOnDelivery")}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {formatMoney(balanceOnDelivery, currencyPrefix)}
                </span>
              </div>
            </>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
