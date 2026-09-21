import { setRequestLocale } from "next-intl/server";
import { MarketingAdmin } from "@/components/admin/MarketingAdmin";
import { getStoreSettingsAdmin } from "@/lib/admin";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminMarketingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const settings = await getStoreSettingsAdmin();

  return <MarketingAdmin settings={settings} />;
}
