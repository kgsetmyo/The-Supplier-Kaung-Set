"use client";

import { useLocale } from "next-intl";
import type { StoreSettings } from "@/types/database";

type Props = {
  announcement: StoreSettings | null;
};

export function AnnouncementBanner({ announcement }: Props) {
  const locale = useLocale();

  if (!announcement?.is_active) return null;

  const text =
    locale === "mm"
      ? announcement.announcement_text_mm
      : announcement.announcement_text_en;

  if (!text?.trim()) return null;

  return (
    <div className="border-b border-border bg-accent text-accent-fg">
      <p className="mx-auto max-w-6xl px-4 py-2 text-center text-xs tracking-wide sm:px-6 sm:text-sm">
        {text}
      </p>
    </div>
  );
}
