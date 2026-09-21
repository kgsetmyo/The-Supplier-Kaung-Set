"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { subscribeToNewsletter } from "@/app/actions/newsletter";

export function NewsletterSignup() {
  const t = useTranslations("footer");
  const [pending, setPending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(id);
  }, [toast]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = e.currentTarget;
    const result = await subscribeToNewsletter(new FormData(form));
    setPending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setToast(
      result.alreadySubscribed ? t("newsletterAlready") : t("newsletterSuccess")
    );
    form.reset();
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-bold tracking-wide text-foreground uppercase">
        {t("newsletterTitle")}
      </h2>
      <p className="max-w-sm text-sm font-normal leading-relaxed text-foreground">
        {t("newsletterTagline")}
      </p>

      {error ? (
        <p role="alert" className="text-xs font-normal text-foreground">
          {error}
        </p>
      ) : null}

      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-2 sm:flex-row sm:items-stretch"
      >
        <label className="sr-only" htmlFor="newsletter-email">
          {t("newsletterEmail")}
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={t("newsletterEmail")}
          className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm font-normal text-foreground outline-none transition focus:border-foreground sm:min-w-0 sm:flex-1"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg transition hover:opacity-90 disabled:opacity-50"
        >
          {pending ? t("newsletterSending") : t("newsletterSubscribe")}
        </button>
      </form>

      {toast ? (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 max-w-sm -translate-x-1/2 rounded-md border border-border bg-foreground px-4 py-3 text-center text-sm font-semibold text-background shadow-lg"
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}
