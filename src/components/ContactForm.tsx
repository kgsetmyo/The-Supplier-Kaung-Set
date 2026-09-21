"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

export function ContactForm() {
  const t = useTranslations("contact");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    // Placeholder — wire to Resend / Supabase later
    await new Promise((r) => setTimeout(r, 400));
    setPending(false);
    setSent(true);
    e.currentTarget.reset();
  }

  const fieldClass =
    "mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm font-normal text-foreground outline-none transition focus:border-foreground";
  const labelClass = "block text-xs font-semibold text-foreground";

  return (
    <div className="border border-border bg-surface p-5 sm:p-6">
      <h2 className="text-sm font-bold tracking-wide text-foreground">
        {t("formTitle")}
      </h2>
      <p className="mt-1 text-sm font-normal text-foreground">{t("formSubtitle")}</p>

      {sent ? (
        <div
          role="status"
          className="mt-5 flex items-start gap-3 border border-border bg-background px-4 py-3 text-sm text-foreground"
        >
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-foreground" />
          <p className="font-normal">{t("success")}</p>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
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
          {t("message")}
          <textarea
            name="message"
            required
            rows={5}
            className={fieldClass}
            placeholder={t("messagePlaceholder")}
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
