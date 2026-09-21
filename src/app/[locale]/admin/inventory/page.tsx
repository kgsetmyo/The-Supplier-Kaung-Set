import { setRequestLocale } from "next-intl/server";
import { InventoryAdmin } from "@/components/admin/InventoryAdmin";
import { getAdminCategories, getAdminProducts } from "@/lib/admin";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminInventoryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [products, categories] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
  ]);

  return <InventoryAdmin products={products} categories={categories} />;
}
