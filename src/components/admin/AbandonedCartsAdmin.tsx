"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Copy, Check, MessageCircle } from "lucide-react";
import { formatMoney } from "@/types/database";
import type { AbandonedCartRow } from "@/lib/admin";

type Props = {
  carts: AbandonedCartRow[];
};

function whatsappUrl(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  // Myanmar local numbers often start with 09 → country code 95
  const intl =
    digits.startsWith("95")
      ? digits
      : digits.startsWith("0")
        ? `95${digits.slice(1)}`
        : digits;
  return `https://wa.me/${intl}`;
}

export function AbandonedCartsAdmin({ carts }: Props) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const currencyPrefix = useTranslations()("currency.prefix");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copyPhone(cartId: string, phone: string) {
    try {
      await navigator.clipboard.writeText(phone);
      setCopiedId(cartId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t("abandonedCarts")}
        </h1>
        <p className="mt-1 text-sm font-normal text-foreground">
          {t("abandonedCartsSubtitle")}
        </p>
      </div>

      {carts.length === 0 ? (
        <p className="border border-dashed border-border px-4 py-10 text-center text-sm text-foreground">
          {t("noAbandonedCarts")}
        </p>
      ) : (
        <div className="overflow-x-auto border border-border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-background text-xs font-semibold tracking-wide text-foreground uppercase">
              <tr>
                <th className="px-3 py-3">{t("customer")}</th>
                <th className="px-3 py-3">{t("phone")}</th>
                <th className="px-3 py-3">{t("cartValue")}</th>
                <th className="px-3 py-3">{t("cartItems")}</th>
                <th className="px-3 py-3">{t("lastUpdated")}</th>
                <th className="px-3 py-3">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {carts.map((cart) => {
                const wa = cart.phone ? whatsappUrl(cart.phone) : null;
                return (
                  <tr
                    key={cart.id}
                    className="border-b border-border align-top last:border-0"
                  >
                    <td className="px-3 py-3">
                      <p className="font-semibold text-foreground">
                        {cart.customerName || "—"}
                      </p>
                      {cart.email ? (
                        <p className="mt-0.5 text-xs text-foreground">
                          {cart.email}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-foreground">
                      {cart.phone || "—"}
                    </td>
                    <td className="px-3 py-3 font-semibold text-foreground">
                      {formatMoney(cart.cartValue, currencyPrefix)}
                    </td>
                    <td className="px-3 py-3">
                      <ul className="space-y-1 text-xs text-foreground">
                        {cart.items.map((item) => {
                          const name =
                            locale === "mm" ? item.nameMm : item.nameEn;
                          return (
                            <li key={item.productId}>
                              {name} × {item.quantity}
                            </li>
                          );
                        })}
                      </ul>
                    </td>
                    <td className="px-3 py-3 text-xs text-foreground">
                      {new Date(cart.updatedAt).toLocaleString(
                        locale === "mm" ? "my-MM" : "en-US"
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col gap-2">
                        {cart.phone ? (
                          <button
                            type="button"
                            onClick={() => copyPhone(cart.id, cart.phone!)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground transition hover:border-foreground/40"
                          >
                            {copiedId === cart.id ? (
                              <Check className="size-3.5" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                            {copiedId === cart.id
                              ? t("copied")
                              : t("copyPhone")}
                          </button>
                        ) : null}
                        {wa ? (
                          <a
                            href={wa}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1.5 text-xs font-semibold text-accent-fg transition hover:opacity-90"
                          >
                            <MessageCircle className="size-3.5" />
                            {t("whatsapp")}
                          </a>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
