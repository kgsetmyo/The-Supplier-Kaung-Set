"use client";

import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Megaphone,
  Store,
  Crown,
  TicketPercent,
  Layers3,
  ShoppingCart,
  ClipboardList,
  Bug,
} from "lucide-react";

const links = [
  { href: "/admin", labelKey: "overview", icon: LayoutDashboard },
  { href: "/admin/orders", labelKey: "orders", icon: ShoppingBag },
  { href: "/admin/inventory", labelKey: "inventory", icon: Package },
  { href: "/admin/categories", labelKey: "categories", icon: Layers3 },
  { href: "/admin/coupons", labelKey: "coupons", icon: TicketPercent },
  { href: "/admin/abandoned-carts", labelKey: "abandonedCarts", icon: ShoppingCart },
  { href: "/admin/requests", labelKey: "productRequests", icon: ClipboardList },
  { href: "/admin/bugs", labelKey: "bugReports", icon: Bug },
  { href: "/admin/loyalty", labelKey: "loyalty", icon: Crown },
  { href: "/admin/marketing", labelKey: "marketing", icon: Megaphone },
] as const;

export function AdminSidebar() {
  const t = useTranslations("admin");
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col border-b border-border bg-surface lg:w-56 lg:border-r lg:border-b-0">
      <div className="border-b border-border px-4 py-4">
        <p className="text-xs tracking-wide text-muted uppercase">{t("title")}</p>
        <p className="brand-logo mt-1 text-[10px] leading-snug">
          The supplier Kaung Set
        </p>
      </div>
      <nav className="flex gap-1 overflow-x-auto p-2 lg:flex-col">
        {links.map(({ href, labelKey, icon: Icon }) => {
          const active =
            href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
                active
                  ? "bg-accent text-accent-fg"
                  : "text-foreground hover:bg-background"
              }`}
            >
              <Icon className="size-4" />
              {t(labelKey)}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-border p-2">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted hover:bg-background hover:text-foreground"
        >
          <Store className="size-4" />
          {t("backToStore")}
        </Link>
      </div>
    </aside>
  );
}
