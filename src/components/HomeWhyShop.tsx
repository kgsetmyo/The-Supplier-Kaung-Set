import { getTranslations } from "next-intl/server";

export async function HomeWhyShop() {
  const t = await getTranslations("home");

  const items = [
    { title: t("why1Title"), body: t("why1Body") },
    { title: t("why2Title"), body: t("why2Body") },
    { title: t("why3Title"), body: t("why3Body") },
  ] as const;

  return (
    <section className="border-y border-border/70 bg-surface/70">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-3 md:gap-8 md:px-8 md:py-12 lg:px-12">
        {items.map((item, i) => (
          <div key={item.title} className="relative">
            <p className="font-display text-4xl font-extrabold text-accent">
              {String(i + 1).padStart(2, "0")}
            </p>
            <h3 className="font-display mt-2 text-lg font-extrabold tracking-tight text-foreground md:text-xl">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted md:text-base">
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
