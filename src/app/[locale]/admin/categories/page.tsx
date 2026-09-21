import { setRequestLocale } from "next-intl/server";
import { CategoriesAdmin } from "@/components/admin/CategoriesAdmin";
import { getAdminCategories } from "@/lib/admin";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminCategoriesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const categories = await getAdminCategories();

  return <CategoriesAdmin categories={categories} />;
}
