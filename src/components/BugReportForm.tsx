"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { submitBugReport } from "@/app/actions/discord";

export function BugReportForm() {
  const t = useTranslations("reportBug");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = e.currentTarget;
    const result = await submitBugReport(new FormData(form));
    setPending(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setSent(true);
    form.reset();
  }

  const fieldClass =
    "mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm font-normal text-foreground outline-none transition focus:border-foreground";
  const labelClass = "block text-xs font-semibold text-foreground";

  return (
    <div className="border border-border bg-surface p-5 sm:p-6">
      {sent ? (
        <div
          role="status"
          className="mb-5 flex items-start gap-3 border border-border bg-background px-4 py-3 text-sm text-foreground"
        >
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-foreground" />
          <p className="font-normal">{t("success")}</p>
        </div>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="mb-4 border border-border bg-background px-3 py-2 text-sm text-foreground"
        >
          {error}
        </p>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4">
        <label className={labelClass}>
          {t("name")}
          <input
            name="name"
            type="text"
            required
            autoComplete="name"
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          {t("email")}
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          {t("description")}
          <textarea
            name="description"
            required
            rows={6}
            className={fieldClass}
            placeholder={t("descriptionPlaceholder")}
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-accent px-4 py-3 text-sm font-semibold text-accent-fg transition hover:opacity-90 disabled:opacity-50 sm:w-auto sm:px-6"
        >
          {pending ? t("sending") : t("submit")}
        </button>
      </form>
    </div>
  );
}
