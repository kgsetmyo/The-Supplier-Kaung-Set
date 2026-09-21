"use client";

import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { CartDrawer } from "@/components/CartDrawer";

export function TrackPageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Header showSearch={false} />
      <main className="page-shell storefront-container">{children}</main>
      <CartDrawer />
    </>
  );
}
