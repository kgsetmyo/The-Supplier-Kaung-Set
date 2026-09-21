import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ code?: string; next?: string }>;
};

/** Handles Supabase email confirmation redirects. */
export default async function AuthCallbackPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { code, next } = await searchParams;
  const supabase = await createClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (next) {
    const dest = next.startsWith("/") ? next : `/${locale}/${next}`;
    redirect(dest);
  }

  if (profile?.role === "admin") {
    redirect(`/${locale}/admin`);
  }

  redirect(`/${locale}`);
}
