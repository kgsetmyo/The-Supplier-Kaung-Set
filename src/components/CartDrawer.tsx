"use client";

import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/store/cart";
import { formatMoney, getUnitPrice } from "@/types/database";

export function CartDrawer() {
  const t = useTranslations();
  const locale = useLocale();
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());
  const currencyPrefix = t("currency.prefix");

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/30 transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeCart}
        aria-hidden={!isOpen}
      />

      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-surface shadow-xl transition-transform duration-300 sm:max-w-md ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
        aria-label={t("cart.title")}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5 sm:py-4">
          <h2 className="text-base font-semibold tracking-tight sm:text-lg">
            {t("cart.title")}
          </h2>
          <button
            type="button"
            onClick={closeCart}
            className="inline-flex size-11 items-center justify-center rounded-md border border-border sm:size-9"
            aria-label={t("cart.close")}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {items.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted">{t("cart.empty")}</p>
          ) : (
            <ul className="space-y-4">
              {items.map(({ product, quantity, unitPrice }) => {
                const name =
                  locale === "mm" ? product.name_mm : product.name_en;
                const unit =
                  typeof unitPrice === "number"
                    ? unitPrice
                    : getUnitPrice(product);
                return (
                  <li
                    key={product.id}
                    className="flex gap-3 border-b border-border pb-4 last:border-0"
                  >
                    <div className="relative size-16 shrink-0 overflow-hidden rounded border border-border bg-background">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-medium">{name}</p>
                        <button
                          type="button"
                          onClick={() => removeItem(product.id)}
                          className="text-xs text-muted hover:text-foreground"
                        >
                          {t("cart.remove")}
                        </button>
                      </div>
                      <p className="mt-1 text-sm">
                        {formatMoney(unit * quantity, currencyPrefix)}
                      </p>
                      <div className="mt-2 inline-flex items-center gap-2 rounded-md border border-border">
                        <button
                          type="button"
                          className="p-1.5"
                          onClick={() => setQuantity(product.id, quantity - 1)}
                          aria-label={t("cart.decrease")}
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="min-w-6 text-center text-sm">{quantity}</span>
                        <button
                          type="button"
                          className="p-1.5"
                          onClick={() => setQuantity(product.id, quantity + 1)}
                          aria-label={t("cart.increase")}
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="space-y-3 border-t border-border px-4 py-4 sm:px-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">{t("cart.subtotal")}</span>
            <span className="font-semibold">
              {formatMoney(subtotal, currencyPrefix)}
            </span>
          </div>
          <Link
            href="/checkout"
            onClick={closeCart}
            className={`block rounded-md bg-accent px-4 py-3.5 text-center text-sm font-medium text-accent-fg sm:py-3 ${
              items.length === 0 ? "pointer-events-none opacity-40" : ""
            }`}
          >
            {t("cart.checkout")}
          </Link>
          <button
            type="button"
            onClick={closeCart}
            className="w-full text-center text-sm text-muted hover:text-foreground"
          >
            {t("cart.continue")}
          </button>
        </div>
      </aside>
    </>
  );
}
