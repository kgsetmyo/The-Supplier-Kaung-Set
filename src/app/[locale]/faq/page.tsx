import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/Header";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });
  return { title: t("title") };
}

const FAQ_KEYS = ["q1", "q2", "q3", "q4", "q5"] as const;

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("faq");

  return (
    <>
      <Header showSearch={false} />
      <main className="page-shell mx-auto w-full max-w-3xl px-4 py-6 md:px-8 md:py-10 lg:px-12">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-2 text-sm font-normal text-foreground">
            {t("subtitle")}
          </p>
        </div>

        <div className="space-y-4">
          {FAQ_KEYS.map((key) => (
            <details
              key={key}
              className="group border border-border bg-surface px-4 py-3 open:pb-4"
            >
              <summary className="cursor-pointer list-none text-sm font-semibold text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-3">
                  {t(`${key}Question`)}
                  <span className="text-foreground transition group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 text-sm font-normal leading-relaxed text-foreground">
                {t(`${key}Answer`)}
              </p>
            </details>
          ))}
        </div>
      </main>
    </>
  );
}
