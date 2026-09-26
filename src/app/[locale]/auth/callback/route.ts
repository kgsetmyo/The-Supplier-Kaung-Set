import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { userHasAdminAccess } from "@/lib/admin-access";
import { routing } from "@/i18n/routing";

type Ctx = { params: Promise<{ locale: string }> };

function safeNextPath(raw: string | null): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

/**
 * Locale-prefixed callback kept for older emails that still link to
 * /en/auth/callback or /mm/auth/callback.
 */
export async function GET(request: NextRequest, context: Ctx) {
  const { locale: rawLocale } = await context.params;
  const locale = routing.locales.includes(rawLocale as "en" | "mm")
    ? rawLocale
    : routing.defaultLocale;

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = safeNextPath(searchParams.get("next"));
  const loginErrorUrl = new URL(`/${locale}/login`, origin);
  loginErrorUrl.searchParams.set("error", "VerificationFailed");

  if (!code) {
    return NextResponse.redirect(loginErrorUrl);
  }

  let successUrl = new URL(nextParam ?? `/${locale}`, origin);
  let response = NextResponse.redirect(successUrl);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.redirect(successUrl);
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error(
      "[locale/auth/callback] exchangeCodeForSession failed:",
      error.message
    );
    return NextResponse.redirect(loginErrorUrl);
  }

  if (!nextParam) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user && (await userHasAdminAccess(supabase, user))) {
      successUrl = new URL(`/${locale}/admin`, origin);
      const adminResponse = NextResponse.redirect(successUrl);
      response.cookies.getAll().forEach((c) => {
        adminResponse.cookies.set(c.name, c.value);
      });
      return adminResponse;
    }
  }

  return response;
}
