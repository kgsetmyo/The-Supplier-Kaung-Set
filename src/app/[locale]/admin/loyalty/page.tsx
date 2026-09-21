import { setRequestLocale } from "next-intl/server";
import { LoyaltyAdmin } from "@/components/admin/LoyaltyAdmin";
import { getAdminCategories } from "@/lib/admin";
import {
  getAdminCustomers,
  getLoyaltyTierCategoryMap,
  getLoyaltyTiers,
} from "@/lib/user-orders";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminLoyaltyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [customers, tiers, categories, tierCategoryMap] = await Promise.all([
    getAdminCustomers(),
    getLoyaltyTiers(),
    getAdminCategories(),
    getLoyaltyTierCategoryMap(),
  ]);

  return (
    <LoyaltyAdmin
      customers={customers}
      tiers={tiers}
      categories={categories}
      tierCategoryMap={tierCategoryMap}
    />
  );
}
