"use client";

import { useLocale, useTranslations } from "next-intl";
import type { OrderStatusHistory } from "@/types/database";

type Props = {
  history: OrderStatusHistory[] | { status: string; note: string | null; created_at: string }[];
};

export function OrderStatusTimeline({ history }: Props) {
  const t = useTranslations("track");
  const locale = useLocale();

  if (!history?.length) {
    return (
      <p className="text-sm text-muted">{t("noHistory")}</p>
    );
  }

  const sorted = [...history].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <ol className="relative space-y-0 border-l border-border ml-2">
      {sorted.map((item, index) => {
        const isLast = index === sorted.length - 1;
        return (
          <li key={`${item.created_at}-${item.status}-${index}`} className="relative pb-5 pl-6 last:pb-0">
            <span
              className={`absolute top-1 -left-[5px] size-2.5 rounded-full border border-border ${
                isLast ? "bg-accent" : "bg-surface"
              }`}
            />
            <p className="text-sm font-medium capitalize">{item.status.replace("_", " ")}</p>
            {item.note ? (
              <p className="mt-0.5 text-sm text-muted">{item.note}</p>
            ) : null}
            <p className="mt-1 text-xs text-muted">
              {new Date(item.created_at).toLocaleString(locale)}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
