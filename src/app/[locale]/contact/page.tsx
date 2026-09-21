import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Header } from "@/components/Header";
import { ContactForm } from "@/components/ContactForm";

type Props = {
  params: Promise<{ locale: string }>;
};

const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ?? "";

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: t("title") };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  const waHref = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}`
    : null;

  return (
    <>
      <Header showSearch={false} />
      <main className="page-shell storefront-container">
        <div className="mb-6 max-w-2xl md:mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-2 text-sm font-normal text-foreground md:text-base">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:gap-12">
          <section className="space-y-6">
            <div className="flex gap-3">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-surface">
                <Mail className="size-4 text-foreground" aria-hidden />
              </span>
              <div>
                <p className="text-xs font-semibold tracking-wide text-foreground uppercase">
                  {t("emailLabel")}
                </p>
                <a
                  href="mailto:hello@thesupplierkaungset.com"
                  className="mt-1 block text-sm font-normal text-foreground underline-offset-4 hover:underline"
                >
                  hello@thesupplierkaungset.com
                </a>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-surface">
                <Phone className="size-4 text-foreground" aria-hidden />
              </span>
              <div>
                <p className="text-xs font-semibold tracking-wide text-foreground uppercase">
                  {t("phoneLabel")}
                </p>
                <p className="mt-1 text-sm font-normal text-foreground">
                  {process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "—"}
                </p>
              </div>
            </div>

            {waHref ? (
              <div className="flex gap-3">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-surface">
                  <MessageCircle className="size-4 text-foreground" aria-hidden />
                </span>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-foreground uppercase">
                    {t("whatsappLabel")}
                  </p>
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-sm font-semibold text-foreground underline-offset-4 hover:underline"
                  >
                    {t("whatsappCta")}
                  </a>
                </div>
              </div>
            ) : null}

            <div className="flex gap-3">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-surface">
                <MapPin className="size-4 text-foreground" aria-hidden />
              </span>
              <div>
                <p className="text-xs font-semibold tracking-wide text-foreground uppercase">
                  {t("locationLabel")}
                </p>
                <p className="mt-1 text-sm font-normal leading-relaxed text-foreground">
                  {t("locationValue")}
                </p>
              </div>
            </div>
          </section>

          <ContactForm />
        </div>
      </main>
    </>
  );
}
