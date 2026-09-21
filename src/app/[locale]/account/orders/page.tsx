import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getMyOrders } from "@/lib/user-orders";
import { AccountPageShell } from "@/components/AccountPageShell";
import { OrderHistoryList } from "@/components/OrderHistoryList";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AccountOrdersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getSessionUser();
  if (!user) {
    redirect(`/${locale}/login?next=/${locale}/account/orders`);
  }

  const t = await getTranslations("account");
  const orders = await getMyOrders();

  return (
    <AccountPageShell title={t("ordersTitle")}>
      <p className="mb-6 text-sm text-muted">{t("ordersSubtitle")}</p>
      <OrderHistoryList orders={orders} />
    </AccountPageShell>
  );
}
