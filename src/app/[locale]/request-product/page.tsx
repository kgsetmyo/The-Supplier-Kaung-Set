import { setRequestLocale, getTranslations } from "next-intl/server";
import { Header } from "@/components/Header";
import { ProductRequestForm } from "@/components/ProductRequestForm";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "requestProduct" });
  return { title: t("title") };
}

export default async function RequestProductPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("requestProduct");

  return (
    <>
      <Header showSearch={false} />
      <main className="page-shell mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10 lg:px-12">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-2 text-sm font-normal text-foreground">
            {t("subtitle")}
          </p>
        </div>
        <ProductRequestForm />
      </main>
    </>
  );
}
