"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

/** Digits only, country code included — e.g. 959xxxxxxxxx for Myanmar. */
const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ?? "";

export function FloatingContactButton() {
  const t = useTranslations("support");
  const pathname = usePathname();

  // Storefront only — hide on admin
  if (pathname.startsWith("/admin")) return null;
  if (!WHATSAPP_NUMBER) return null;

  const href = `https://wa.me/${WHATSAPP_NUMBER}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("whatsapp")}
      className="group fixed bottom-4 left-4 z-50 inline-flex size-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition duration-300 hover:scale-110 hover:shadow-[0_12px_28px_rgba(37,211,102,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground print:hidden sm:bottom-6 sm:left-6"
    >
      <span
        className="pointer-events-none absolute inset-0 rounded-full bg-[#25D366]/40 opacity-0 transition group-hover:animate-ping group-hover:opacity-100"
        aria-hidden
      />
      <MessageCircle className="relative size-6 fill-current" aria-hidden />
    </a>
  );
}
