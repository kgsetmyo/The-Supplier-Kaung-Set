import { setRequestLocale } from "next-intl/server";
import { AbandonedCartsAdmin } from "@/components/admin/AbandonedCartsAdmin";
import { getAbandonedCarts } from "@/lib/admin";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminAbandonedCartsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const carts = await getAbandonedCarts();

  return <AbandonedCartsAdmin carts={carts} />;
}
