import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { productGalleryUrls } from "@/lib/product-media";
import type { Product } from "@/types/database";

type Props = {
  featured?: Product | null;
};

export async function HomeHero({ featured }: Props) {
  const t = await getTranslations("home");
  const cover = featured ? productGalleryUrls(featured)[0] ?? null : null;

  return (
    <section className="relative isolate min-h-[min(88vh,44rem)] w-full overflow-hidden bg-[#14241c] text-[#f4fae8]">
      <div className="hero-media absolute inset-0">
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 70% 40%, #3a5a28 0%, transparent 55%), linear-gradient(145deg, #14241c 0%, #1f3a2a 45%, #2a4a20 100%)",
            }}
            aria-hidden
          />
        )}
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#0e1812]/92 via-[#14241c]/72 to-[#14241c]/35"
          aria-hidden
        />
        <div
          className="absolute inset-0 opacity-30 mix-blend-soft-light"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.45'/%3E%3C/svg%3E\")",
          }}
          aria-hidden
        />
      </div>

      <div className="hero-copy relative z-10 mx-auto flex min-h-[min(88vh,44rem)] w-full max-w-6xl flex-col justify-end gap-5 px-4 py-14 sm:justify-center sm:py-20 md:px-8 lg:px-12">
        <p className="brand-logo-on-dark max-w-xl text-sm sm:text-base md:text-lg">
          The supplier Kaung Set
        </p>
        <h1 className="font-display max-w-2xl text-4xl font-extrabold tracking-tight text-balance sm:text-5xl md:text-6xl">
          {t("title")}
        </h1>
        <p className="max-w-md text-base leading-relaxed text-[#d9e8cf] sm:text-lg">
          {t("subtitle")}
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <a
            href="#shop"
            className="cta-playful inline-flex items-center justify-center rounded-md bg-accent px-5 py-3 text-sm font-extrabold text-accent-fg transition hover:brightness-105"
          >
            {t("ctaShop")}
          </a>
          <Link
            href="/request-product"
            className="inline-flex items-center justify-center rounded-md border border-[#f4fae8]/35 bg-transparent px-5 py-3 text-sm font-bold text-[#f4fae8] transition hover:border-[#f4fae8]/70 hover:bg-[#f4fae8]/10"
          >
            {t("ctaRequest")}
          </Link>
        </div>
      </div>
    </section>
  );
}
