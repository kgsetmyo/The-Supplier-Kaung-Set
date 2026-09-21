"use client";

import { BadgeCheck, CircleAlert, Cog } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ProductAuthenticity } from "@/types/database";

const STYLES: Record<
  ProductAuthenticity,
  { wrap: string; icon: typeof BadgeCheck }
> = {
  Genuine: {
    wrap: "border-emerald-800/25 bg-emerald-50 text-emerald-950",
    icon: BadgeCheck,
  },
  OEM: {
    wrap: "border-neutral-300 bg-neutral-50 text-neutral-800",
    icon: Cog,
  },
  Replica: {
    wrap: "border-amber-800/20 bg-amber-50 text-amber-950",
    icon: CircleAlert,
  },
};

export function AuthenticityBadge({
  authenticity = "Genuine",
  size = "md",
}: {
  authenticity?: ProductAuthenticity | null;
  size?: "sm" | "md";
}) {
  const t = useTranslations("product");
  const value = authenticity ?? "Genuine";
  const style = STYLES[value] ?? STYLES.Genuine;
  const Icon = style.icon;
  const label = t(`authenticity${value}` as "authenticityGenuine");
  const hint = t(`authenticity${value}Hint` as "authenticityGenuineHint");

  const pad = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1.5 text-sm";

  return (
    <div
      className={`inline-flex max-w-full items-start gap-2 rounded-md border ${style.wrap} ${pad}`}
      title={hint}
    >
      <Icon
        className={size === "sm" ? "mt-0.5 size-3.5 shrink-0" : "mt-0.5 size-4 shrink-0"}
        aria-hidden
      />
      <span className="min-w-0">
        <span className="font-semibold tracking-wide uppercase">{label}</span>
        {size === "md" ? (
          <span className="mt-0.5 block text-xs font-normal opacity-80">
            {hint}
          </span>
        ) : null}
      </span>
    </div>
  );
}
