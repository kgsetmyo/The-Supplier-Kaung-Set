"use client";

import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { CartDrawer } from "@/components/CartDrawer";

export function AccountPageShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <>
      <Header showSearch={false} />
      <main className="page-shell storefront-container">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">
          {title}
        </h1>
        {children}
      </main>
      <CartDrawer />
    </>
  );
}
