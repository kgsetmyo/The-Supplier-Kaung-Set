"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { updateMyProfile } from "@/lib/actions";
import type { Profile } from "@/types/database";

export function ProfileForm({ profile }: { profile: Profile }) {
  const t = useTranslations("profile");
  const [pending, startTransition] = useTransition();
  const [phone, setPhone] = useState(profile.phone_number ?? "");
  const [address, setAddress] = useState(profile.address ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const result = await updateMyProfile({
      phoneNumber: phone,
      address,
    });

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setSaved(true);
    startTransition(() => {
      // keep local state
    });
  }

  const fieldClass =
    "mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-foreground";

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-lg space-y-4 border border-border bg-surface p-5 sm:p-6"
    >
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
      </div>

      <label className="block text-sm">
        <span>{t("email")}</span>
        <input
          value={profile.email ?? ""}
          disabled
          className={`${fieldClass} opacity-70`}
        />
      </label>

      <label className="block text-sm">
        <span>{t("phone")}</span>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={fieldClass}
          autoComplete="tel"
        />
      </label>

      <label className="block text-sm">
        <span>{t("address")}</span>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={3}
          className={fieldClass}
          autoComplete="street-address"
        />
      </label>

      {profile.loyalty_tier ? (
        <p className="text-sm text-muted">
          {t("tier")}: <span className="font-medium text-foreground">{profile.loyalty_tier}</span>
          {profile.lifetime_spend != null ? (
            <> · {t("spend")}: {profile.lifetime_spend}</>
          ) : null}
        </p>
      ) : null}

      {error ? <p className="text-sm text-sale">{error}</p> : null}
      {saved ? <p className="text-sm text-muted">{t("saved")}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg disabled:opacity-50"
      >
        {pending ? t("saving") : t("save")}
      </button>
    </form>
  );
}
