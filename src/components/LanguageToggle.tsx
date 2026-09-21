"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";

const LOCALE_FLAGS: Record<AppLocale, string> = {
  en: "🇬🇧",
  mm: "🇲🇲",
};

/** Soft pill language toggle for the premium header */
export function LanguageToggle() {
  const t = useTranslations("header");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();

  function switchTo(next: AppLocale) {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  }

  const titles: Record<AppLocale, string> = {
    en: t("english"),
    mm: t("myanmar"),
  };

  return (
    <div
      className="inline-flex items-center rounded-full bg-gray-100 p-1 dark:bg-gray-800"
      role="group"
      aria-label={t("switchLanguage")}
    >
      {routing.locales.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            onClick={() => switchTo(code)}
            title={titles[code]}
            aria-label={titles[code]}
            aria-pressed={active}
            className={`inline-flex size-8 items-center justify-center rounded-full text-sm transition-all ${
              active
                ? "bg-white font-semibold text-black shadow-sm dark:bg-neutral-950 dark:text-white"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <span className="leading-none" aria-hidden>
              {LOCALE_FLAGS[code]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
