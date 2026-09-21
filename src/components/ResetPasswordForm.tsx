"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setHasSession(Boolean(session));
      setReady(true);
    })();
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");

    if (password.length < 6) {
      setPending(false);
      setError(t("passwordTooShort"));
      return;
    }

    if (password !== confirm) {
      setPending(false);
      setError(t("passwordMismatch"));
      return;
    }

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    setPending(false);

    if (updateError) {
      setError(updateError.message || t("error"));
      return;
    }

    setSuccess(true);
    router.refresh();
    setTimeout(() => {
      router.push("/login");
    }, 1500);
  }

  const fieldClass =
    "w-full rounded-md border border-border bg-surface py-2 pr-10 pl-3 text-sm outline-none focus:border-foreground";

  if (!ready) {
    return (
      <div className="mx-auto w-full max-w-md border border-border bg-surface p-6 sm:p-8">
        <p className="text-sm text-foreground">{t("submitting")}</p>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="mx-auto w-full max-w-md border border-border bg-surface p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t("resetInvalidTitle")}
        </h1>
        <p className="mt-2 text-sm font-normal text-foreground">
          {t("resetInvalidBody")}
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-block text-sm font-medium underline underline-offset-4"
        >
          {t("forgotTitle")}
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto w-full max-w-md border border-border bg-surface p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t("resetSuccessTitle")}
        </h1>
        <p className="mt-2 text-sm font-normal text-foreground">
          {t("resetSuccessBody")}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md border border-border bg-surface p-6 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        {t("resetTitle")}
      </h1>
      <p className="mt-1 text-sm font-normal text-foreground">
        {t("resetSubtitle")}
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="block text-sm text-foreground">
          <span>{t("newPassword")}</span>
          <div className="relative mt-1">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              autoComplete="new-password"
              className={fieldClass}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label="Toggle password visibility"
              aria-pressed={showPassword}
              className="absolute top-1/2 right-2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded text-muted transition hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden />
              ) : (
                <Eye className="size-4" aria-hidden />
              )}
            </button>
          </div>
        </div>

        <label className="block text-sm text-foreground">
          <span>{t("confirmPassword")}</span>
          <input
            name="confirm"
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            autoComplete="new-password"
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-foreground"
          />
        </label>

        {error ? <p className="text-sm text-sale">{error}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-accent px-4 py-3 text-sm font-medium text-accent-fg disabled:opacity-50"
        >
          {pending ? t("submitting") : t("updatePassword")}
        </button>
      </form>
    </div>
  );
}
