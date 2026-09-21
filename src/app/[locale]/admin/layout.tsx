import { setRequestLocale } from "next-intl/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <div className="print:hidden">
        <AdminSidebar />
      </div>
      <div className="flex-1 overflow-x-auto p-4 sm:p-6 lg:p-8 print:overflow-visible print:p-0">
        {children}
      </div>
    </div>
  );
}
