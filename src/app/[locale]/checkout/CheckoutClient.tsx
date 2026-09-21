"use client";

import { Header } from "@/components/Header";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutForm } from "@/components/CheckoutForm";
import type { CustomerInfo } from "@/types/database";

export function CheckoutClient({
  defaults,
}: {
  defaults?: Partial<CustomerInfo> | null;
}) {
  return (
    <>
      <Header showSearch={false} />
      <main className="page-shell storefront-container">
        <CheckoutForm defaults={defaults} />
      </main>
      <CartDrawer />
    </>
  );
}
