import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getMyProfile } from "@/lib/user-orders";
import { AccountPageShell } from "@/components/AccountPageShell";
import { ProfileForm } from "@/components/ProfileForm";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ProfilePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const profile = await getMyProfile();
  if (!profile) {
    redirect(`/${locale}/login?next=/${locale}/profile`);
  }

  const t = await getTranslations("profile");

  return (
    <AccountPageShell title={t("title")}>
      <ProfileForm profile={profile} />
    </AccountPageShell>
  );
}
