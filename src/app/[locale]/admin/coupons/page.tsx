import { setRequestLocale } from "next-intl/server";
import { CouponsAdmin } from "@/components/admin/CouponsAdmin";
import {
  getAdminCategories,
  getAdminCoupons,
  getAdminProducts,
} from "@/lib/admin";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminCouponsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [coupons, products, categories] = await Promise.all([
    getAdminCoupons(),
    getAdminProducts(),
    getAdminCategories(),
  ]);

  return (
    <CouponsAdmin
      coupons={coupons}
      products={products}
      categories={categories}
    />
  );
}
