"use client";

import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { getPostLoginPath } from "@/app/actions/auth-nav";
import { getAuthCallbackUrl } from "@/lib/site-url";

type Mode = "login" | "signup";

type AuthFormProps = {
  mode: Mode;
  nextPath?: string;
  /** From ?error= on the login URL (e.g. VerificationFailed). */
  initialError?: string | null;
};

export function AuthForm({
  mode,
  nextPath,
  initialError = null,
}: AuthFormProps) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(() => {
    if (initialError === "VerificationFailed") {
      return t("verificationFailed");
    }
    return initialError;
  });
  const [showPassword, setShowPassword] = useState(false);
  const [checkEmail, setCheckEmail] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const supabase = createClient();

    if (mode === "signup") {
      // Always use NEXT_PUBLIC_SITE_URL (via helper) so production emails
      // never point at localhost from a mismatched client origin.
      const emailRedirectTo = getAuthCallbackUrl(`/${locale}`);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo,
        },
      });

      if (signUpError) {
        setPending(false);
        setError(signUpError.message || t("error"));
        return;
      }

      // Email confirmation required when session is null
      if (!data.session) {
        setPending(false);
        setCheckEmail(email);
        return;
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setPending(false);
        setError(signInError.message || t("error"));
        return;
      }
    }

    const dest = await getPostLoginPath(nextPath);
    setPending(false);
    router.refresh();
    router.push(dest as "/");
  }

  const fieldClass =
    "mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-foreground";

  if (checkEmail) {
    return (
      <div className="mx-auto w-full max-w-md border border-border bg-surface p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("checkEmailTitle")}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {t("checkEmailBody", { email: checkEmail })}
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-medium underline underline-offset-4"
        >
          {t("submitLogin")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md border border-border bg-surface p-6 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">
        {mode === "login" ? t("loginTitle") : t("signupTitle")}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {mode === "login" ? t("loginSubtitle") : t("signupSubtitle")}
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block text-sm">
          <span>{t("email")}</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={fieldClass}
          />
        </label>

        <div className="block text-sm">
          <div className="flex items-center justify-between gap-2">
            <span>{t("password")}</span>
            {mode === "login" ? (
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-foreground underline-offset-4 hover:underline"
              >
                {t("forgotPassword")}
              </Link>
            ) : null}
          </div>
          <div className="relative mt-1">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              className="w-full rounded-md border border-border bg-surface py-2 pr-10 pl-3 text-sm outline-none focus:border-foreground"
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

        {error ? <p className="text-sm text-sale">{error}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-accent px-4 py-3 text-sm font-medium text-accent-fg disabled:opacity-50"
        >
          {pending
            ? t("submitting")
            : mode === "login"
              ? t("submitLogin")
              : t("submitSignup")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {mode === "login" ? t("noAccount") : t("hasAccount")}{" "}
        <Link
          href={mode === "login" ? "/signup" : "/login"}
          className="font-medium text-foreground underline underline-offset-4"
        >
          {mode === "login" ? t("submitSignup") : t("submitLogin")}
        </Link>
      </p>
    </div>
  );
}
