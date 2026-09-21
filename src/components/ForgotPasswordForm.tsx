"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const supabase = createClient();

    const siteUrl = (
      process.env.NEXT_PUBLIC_SITE_URL?.trim() || window.location.origin
    ).replace(/\/$/, "");

    // Exchange code via auth callback, then land on reset-password with a session
    const redirectTo = `${siteUrl}/${locale}/auth/callback?next=/${locale}/reset-password`;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo }
    );

    setPending(false);

    if (resetError) {
      setError(resetError.message || t("error"));
      return;
    }

    setSentTo(email);
  }

  const fieldClass =
    "mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-foreground";

  if (sentTo) {
    return (
      <div className="mx-auto w-full max-w-md border border-border bg-surface p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t("resetEmailTitle")}
        </h1>
        <p className="mt-2 text-sm font-normal text-foreground">
          {t("resetEmailBody", { email: sentTo })}
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-medium text-foreground underline underline-offset-4"
        >
          {t("backToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md border border-border bg-surface p-6 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        {t("forgotTitle")}
      </h1>
      <p className="mt-1 text-sm font-normal text-foreground">
        {t("forgotSubtitle")}
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block text-sm font-normal text-foreground">
          <span>{t("email")}</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={fieldClass}
          />
        </label>

        {error ? <p className="text-sm text-sale">{error}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-accent px-4 py-3 text-sm font-medium text-accent-fg disabled:opacity-50"
        >
          {pending ? t("submitting") : t("sendResetLink")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-foreground">
        <Link
          href="/login"
          className="font-medium underline underline-offset-4"
        >
          {t("backToLogin")}
        </Link>
      </p>
    </div>
  );
}
