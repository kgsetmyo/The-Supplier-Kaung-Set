"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import type { StoreSettings } from "@/types/database";
import { useRouter } from "@/i18n/navigation";

export function MarketingAdmin({ settings }: { settings: StoreSettings | null }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    announcement_text_en: settings?.announcement_text_en ?? "",
    announcement_text_mm: settings?.announcement_text_mm ?? "",
    is_active: settings?.is_active ?? false,
  });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const supabase = createClient();
    const payload = {
      ...form,
      updated_at: new Date().toISOString(),
    };

    const result = settings?.id
      ? await supabase
          .from("store_settings")
          .update(payload)
          .eq("id", settings.id)
      : await supabase.from("store_settings").insert(payload);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setSaved(true);
    startTransition(() => router.refresh());
  }

  const fieldClass =
    "mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-foreground";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t("marketing")}</h1>

      <form
        onSubmit={onSubmit}
        className="space-y-4 border border-border bg-surface p-5"
      >
        <label className="block text-sm">
          <span>{t("announcementEn")}</span>
          <textarea
            rows={3}
            className={fieldClass}
            value={form.announcement_text_en}
            onChange={(e) =>
              setForm((f) => ({ ...f, announcement_text_en: e.target.value }))
            }
          />
        </label>
        <label className="block text-sm">
          <span>{t("announcementMm")}</span>
          <textarea
            rows={3}
            className={fieldClass}
            value={form.announcement_text_mm}
            onChange={(e) =>
              setForm((f) => ({ ...f, announcement_text_mm: e.target.value }))
            }
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) =>
              setForm((f) => ({ ...f, is_active: e.target.checked }))
            }
          />
          <span>{t("active")}</span>
        </label>

        {error ? <p className="text-sm text-sale">{error}</p> : null}
        {saved ? <p className="text-sm text-muted">{t("saved")}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg disabled:opacity-50"
        >
          {pending ? t("saving") : t("save")}
        </button>
      </form>
    </div>
  );
}
