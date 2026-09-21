import { setRequestLocale } from "next-intl/server";
import { BugReportsAdmin } from "@/components/admin/BugReportsAdmin";
import { getAdminBugReports } from "@/lib/admin";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminBugsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const reports = await getAdminBugReports();

  return <BugReportsAdmin reports={reports} />;
}
