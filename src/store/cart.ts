"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/database";
import { getUnitPrice } from "@/types/database";

export type CartItem = {
  product: Product;
  quantity: number;
  /** Effective unit price when added (catalog + loyalty). */
  unitPrice?: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product, quantity?: number, unitPrice?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: () => number;
  subtotal: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      addItem: (product, quantity = 1, unitPrice) => {
        const price =
          typeof unitPrice === "number" && unitPrice >= 0
            ? unitPrice
            : getUnitPrice(product);
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? {
                      ...i,
                      quantity: Math.min(
                        i.quantity + quantity,
                        product.stock_quantity || i.quantity + quantity
                      ),
                      unitPrice: price,
                    }
                  : i
              ),
              isOpen: true,
            };
          }
          return {
            items: [
              ...state.items,
              { product, quantity, unitPrice: price },
            ],
            isOpen: true,
          };
        });
      },

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        })),

      setQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.product.id !== productId)
              : state.items.map((i) =>
                  i.product.id === productId
                    ? {
                        ...i,
                        quantity: Math.min(
                          quantity,
                          i.product.stock_quantity || quantity
                        ),
                      }
                    : i
                ),
        })),

      clearCart: () => set({ items: [] }),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => {
          const unit =
            typeof i.unitPrice === "number"
              ? i.unitPrice
              : getUnitPrice(i.product);
          return sum + unit * i.quantity;
        }, 0),
    }),
    {
      name: "minimal-store-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);

/** Avoid cart badge hydration mismatches after localStorage rehydrate */
export function useCartHasHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(useCartStore.persist.hasHydrated());
    return useCartStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  return hydrated;
}
