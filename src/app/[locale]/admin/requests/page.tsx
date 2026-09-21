import { setRequestLocale } from "next-intl/server";
import { ProductRequestsAdmin } from "@/components/admin/ProductRequestsAdmin";
import { getAdminProductRequests } from "@/lib/admin";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminRequestsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const requests = await getAdminProductRequests();

  return <ProductRequestsAdmin requests={requests} />;
}
