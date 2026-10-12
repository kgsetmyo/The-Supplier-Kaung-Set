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
    <section className="relative isolate min-h-[min(92vh,46rem)] w-full overflow-hidden bg-[#eef8d4] text-foreground">
      <div className="hero-media absolute inset-0">
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-90"
          />
        ) : null}
        <div
          className="absolute inset-0"
          style={{
            background: cover
              ? "linear-gradient(105deg, #eef8d4 0%, #eef8d4ee 38%, #eef8d466 62%, transparent 100%)"
              : "radial-gradient(ellipse 70% 60% at 80% 40%, #c6e85a 0%, transparent 55%), linear-gradient(135deg, #eef8d4 0%, #d8f0a0 45%, #ffe0d0 100%)",
          }}
          aria-hidden
        />
        <div
          className="blob-float absolute -top-16 -right-10 size-56 rounded-[40%] bg-[#c6e85a]/55 blur-2xl sm:size-72"
          aria-hidden
        />
        <div
          className="blob-float absolute bottom-10 left-[-2rem] size-44 rounded-[45%] bg-[#ff8f6b]/35 blur-2xl sm:size-56"
          style={{ animationDelay: "-3s" }}
          aria-hidden
        />
      </div>

      <div className="hero-copy relative z-10 mx-auto flex min-h-[min(92vh,46rem)] w-full max-w-6xl flex-col justify-center gap-5 px-4 py-16 md:px-8 lg:px-12">
        <p className="brand-logo max-w-xl text-sm sm:text-base md:text-lg">
          The supplier Kaung Set
        </p>
        <h1 className="font-display max-w-2xl text-4xl font-extrabold tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-7xl">
          {t("title")}
        </h1>
        <p className="max-w-lg text-base leading-relaxed text-muted sm:text-lg md:text-xl">
          {t("subtitle")}
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <a
            href="#shop"
            className="cta-playful inline-flex items-center justify-center rounded-md bg-[#14241c] px-6 py-3.5 text-sm font-extrabold text-[#c6e85a] transition hover:brightness-110 sm:text-base"
          >
            {t("ctaShop")}
          </a>
          <Link
            href="/request-product"
            className="inline-flex items-center justify-center rounded-md border-2 border-[#14241c]/25 bg-surface/80 px-6 py-3.5 text-sm font-bold text-foreground backdrop-blur-sm transition hover:border-[#14241c]/55 hover:bg-accent/40 sm:text-base"
          >
            {t("ctaRequest")}
          </Link>
        </div>
      </div>
    </section>
  );
}
