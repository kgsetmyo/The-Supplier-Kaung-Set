"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { NewsletterSignup } from "@/components/NewsletterSignup";

export function Footer() {
  const t = useTranslations("footer");
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-surface text-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-2 md:px-8 md:py-12 lg:grid-cols-4 lg:px-12">
        <div className="space-y-3">
          <p className="brand-logo text-[11px] leading-snug sm:text-xs">
            The supplier Kaung Set
          </p>
          <p className="max-w-xs text-sm font-normal leading-relaxed text-foreground">
            {t("tagline")}
          </p>
        </div>

        <div>
          <h2 className="text-xs font-bold tracking-wide text-foreground uppercase">
            {t("shop")}
          </h2>
          <ul className="mt-3 space-y-2 text-sm font-normal">
            <li>
              <Link
                href="/products"
                className="underline-offset-4 hover:underline"
              >
                {t("products")}
              </Link>
            </li>
            <li>
              <Link
                href="/products"
                className="underline-offset-4 hover:underline"
              >
                {t("categories")}
              </Link>
            </li>
            <li>
              <Link href="/search" className="underline-offset-4 hover:underline">
                {t("search")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-bold tracking-wide text-foreground uppercase">
            {t("support")}
          </h2>
          <ul className="mt-3 space-y-2 text-sm font-normal">
            <li>
              <Link
                href="/contact"
                className="underline-offset-4 hover:underline"
              >
                {t("contact")}
              </Link>
            </li>
            <li>
              <Link href="/faq" className="underline-offset-4 hover:underline">
                {t("faq")}
              </Link>
            </li>
            <li>
              <Link href="/track" className="underline-offset-4 hover:underline">
                {t("trackOrder")}
              </Link>
            </li>
            <li>
              <Link
                href="/request-product"
                className="underline-offset-4 hover:underline"
              >
                {t("requestProduct")}
              </Link>
            </li>
            <li>
              <Link
                href="/report-bug"
                className="underline-offset-4 hover:underline"
              >
                {t("reportBug")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-bold tracking-wide text-foreground uppercase">
            {t("legal")}
          </h2>
          <ul className="mt-3 space-y-2 text-sm font-normal">
            <li>
              <Link
                href="/privacy"
                className="underline-offset-4 hover:underline"
              >
                {t("privacy")}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="underline-offset-4 hover:underline">
                {t("terms")}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between md:px-8 lg:px-12">
          <p className="text-sm font-normal text-foreground">
            {t("supportCta")}
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/request-product"
              className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg transition hover:opacity-90"
            >
              {t("requestProduct")}
            </Link>
            <Link
              href="/report-bug"
              className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-foreground/40"
            >
              {t("reportBug")}
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 lg:px-12">
          <NewsletterSignup />
        </div>
      </div>

      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs font-normal text-foreground md:px-8 lg:px-12">
          © {year} The supplier Kaung Set. {t("rights")}
        </p>
      </div>
    </footer>
  );
}
