"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ExternalLink } from "lucide-react";
import {
  updateProductRequestStatus,
  type ProductRequestStatus,
} from "@/app/actions/discord";
import type { ProductRequestRow } from "@/lib/admin";

type Props = {
  requests: ProductRequestRow[];
};

const STATUSES: ProductRequestStatus[] = ["pending", "sourced", "rejected"];

export function ProductRequestsAdmin({ requests }: Props) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onStatusChange(id: string, status: ProductRequestStatus) {
    setError(null);
    setPendingId(id);
    startTransition(async () => {
      const result = await updateProductRequestStatus(id, status);
      setPendingId(null);
      if (!result.ok) setError(result.message);
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t("productRequests")}
        </h1>
        <p className="mt-1 text-sm font-normal text-foreground">
          {t("productRequestsSubtitle")}
        </p>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-foreground">
          {error}
        </p>
      ) : null}

      {requests.length === 0 ? (
        <p className="border border-dashed border-border px-4 py-10 text-center text-sm text-foreground">
          {t("noProductRequests")}
        </p>
      ) : (
        <div className="overflow-x-auto border border-border">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-border bg-background text-xs font-semibold tracking-wide text-foreground uppercase">
              <tr>
                <th className="px-3 py-3">{t("customer")}</th>
                <th className="px-3 py-3">{t("requestItem")}</th>
                <th className="px-3 py-3">{t("requestDetails")}</th>
                <th className="px-3 py-3">{t("requestImage")}</th>
                <th className="px-3 py-3">{t("date")}</th>
                <th className="px-3 py-3">{t("status")}</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border align-top last:border-0"
                >
                  <td className="px-3 py-3">
                    <p className="font-semibold text-foreground">{row.name}</p>
                    <a
                      href={`mailto:${row.email}`}
                      className="mt-0.5 block text-xs text-foreground underline-offset-2 hover:underline"
                    >
                      {row.email}
                    </a>
                  </td>
                  <td className="px-3 py-3 font-medium text-foreground">
                    {row.item_name}
                  </td>
                  <td className="max-w-xs px-3 py-3 text-xs whitespace-pre-wrap text-foreground">
                    {row.details}
                  </td>
                  <td className="px-3 py-3">
                    {row.image_url ? (
                      <a
                        href={row.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex flex-col gap-1"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={row.image_url}
                          alt=""
                          className="h-16 w-16 rounded-md border border-border object-cover"
                        />
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-foreground underline-offset-2 group-hover:underline">
                          <ExternalLink className="size-3" aria-hidden />
                          {t("viewImage")}
                        </span>
                      </a>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-xs text-foreground">
                    {new Date(row.created_at).toLocaleString(
                      locale === "mm" ? "my-MM" : "en-US"
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <select
                      value={row.status}
                      disabled={isPending && pendingId === row.id}
                      onChange={(e) =>
                        onStatusChange(
                          row.id,
                          e.target.value as ProductRequestStatus
                        )
                      }
                      className="rounded-md border border-border bg-background px-2 py-1.5 text-xs font-semibold text-foreground outline-none"
                      aria-label={t("status")}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {t(`requestStatus_${s}`)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
