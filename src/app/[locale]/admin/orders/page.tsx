import { setRequestLocale } from "next-intl/server";
import { OrdersAdmin } from "@/components/admin/OrdersAdmin";
import { getAdminOrders } from "@/lib/admin";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminOrdersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const orders = await getAdminOrders();

  return <OrdersAdmin orders={orders} />;
}
