import { setRequestLocale } from "next-intl/server";
import { AuthForm } from "@/components/AuthForm";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { next } = await searchParams;
  setRequestLocale(locale);

  return (
    <main className="page-shell flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="brand-logo text-[11px] sm:text-xs">
          The supplier Kaung Set
        </Link>
        <LanguageToggle />
      </div>
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <AuthForm mode="login" nextPath={next} />
      </div>
    </main>
  );
}
