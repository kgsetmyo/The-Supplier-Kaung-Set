import { setRequestLocale } from "next-intl/server";
import { CheckoutClient } from "./CheckoutClient";
import { getMyProfile } from "@/lib/user-orders";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function CheckoutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const profile = await getMyProfile();

  return (
    <CheckoutClient
      defaults={
        profile
          ? {
              phone: profile.phone_number ?? "",
              address: profile.address ?? "",
              email: profile.email ?? "",
            }
          : null
      }
    />
  );
}
