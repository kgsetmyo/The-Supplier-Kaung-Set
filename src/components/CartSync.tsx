"use client";

import { useEffect, useRef } from "react";
import { syncSavedCart } from "@/lib/coupons";
import { useCartHasHydrated, useCartStore } from "@/store/cart";
import { getUnitPrice } from "@/types/database";

/**
 * Debounced sync of the Zustand cart → `saved_carts` for signed-in users.
 * Enables admin abandoned-cart follow-up.
 */
export function CartSync() {
  const hydrated = useCartHasHydrated();
  const items = useCartStore((s) => s.items);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!hydrated) return;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const payload = items.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
        unitPrice:
          typeof i.unitPrice === "number"
            ? i.unitPrice
            : getUnitPrice(i.product),
      }));
      void syncSavedCart(payload);
    }, 800);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [hydrated, items]);

  return null;
}
