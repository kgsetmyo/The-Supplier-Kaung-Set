"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Package, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { trackOrderByNumber } from "@/lib/orders";
import { formatMoney, type TrackedOrder } from "@/types/database";
import { OrderStatusTimeline } from "@/components/OrderStatusTimeline";

type TrackOrderModalProps = {
  open: boolean;
  onClose: () => void;
};

export function TrackOrderModal({ open, onClose }: TrackOrderModalProps) {
  const t = useTranslations("track");
  const tCurrency = useTranslations("currency");
  const locale = useLocale();
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  useEffect(() => {
    if (!open) return;

    setCode("");
    setError(null);
    setOrder(null);
    setPending(false);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = window.setTimeout(() => inputRef.current?.focus(), 50);

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(timer);
    };
  }, [open, onClose]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label={t("close")}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-lg border border-border bg-surface shadow-xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Package className="size-5 text-foreground" aria-hidden />
            <h2 id={titleId} className="text-lg font-semibold tracking-tight">
              {t("modalTitle")}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-8 items-center justify-center rounded-md border border-border text-muted transition hover:text-foreground"
            aria-label={t("close")}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <p className="text-sm text-muted">{t("subtitle")}</p>

          <form onSubmit={onSubmit} className="space-y-3">
            <label className="block text-sm">
              <span>{t("inputLabel")}</span>
              <input
                ref={inputRef}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder={t("placeholder")}
                autoComplete="off"
                className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2.5 font-mono text-sm tracking-wide outline-none focus:border-foreground"
              />
            </label>

            {error ? <p className="text-sm text-sale">{error}</p> : null}

            <button
              type="submit"
              disabled={pending || !code.trim()}
              className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg disabled:opacity-50"
            >
              {pending ? t("searching") : t("search")}
            </button>
          </form>

          {order ? (
            <div className="space-y-3 rounded-md border border-border bg-background p-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs tracking-wide text-muted uppercase">
                    {t("trackingNumber")}
                  </p>
                  <p className="mt-0.5 font-mono font-semibold">
                    {order.tracking_number}
                  </p>
                </div>
                <span className="rounded border border-border bg-surface px-2 py-1 text-xs font-medium tracking-wide uppercase">
                  {order.status}
                </span>
              </div>

              {order.courier_name ? (
                <div>
                  <p className="text-xs text-muted uppercase">{t("courier")}</p>
                  <p className="mt-0.5">{order.courier_name}</p>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted uppercase">{t("date")}</p>
                  <p className="mt-0.5">
                    {new Date(order.created_at).toLocaleDateString(locale)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase">{t("total")}</p>
                  <p className="mt-0.5 font-medium">
                    {formatMoney(order.total_amount, tCurrency("prefix"))}
                  </p>
                </div>
              </div>

              {order.history?.length ? (
                <div className="border-t border-border pt-3">
                  <p className="mb-2 text-xs tracking-wide text-muted uppercase">
                    {t("timeline")}
                  </p>
                  <OrderStatusTimeline history={order.history} />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
