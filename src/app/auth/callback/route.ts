import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { userHasAdminAccess } from "@/lib/admin-access";
import { routing } from "@/i18n/routing";

function safeNextPath(raw: string | null): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

/**
 * Supabase email confirmation / magic-link / password-reset callback.
 * Exchanges ?code= for a session and sets auth cookies on the redirect response.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = safeNextPath(searchParams.get("next"));
  const locale = routing.defaultLocale;
  const loginErrorUrl = new URL(`/${locale}/login`, origin);
  loginErrorUrl.searchParams.set("error", "VerificationFailed");

  if (!code) {
    return NextResponse.redirect(loginErrorUrl);
  }

  // Build redirect response first so we can attach session cookies to it.
  let redirectPath = nextParam ?? `/${locale}`;
  const successUrl = new URL(redirectPath, origin);
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
    console.error("[auth/callback] exchangeCodeForSession failed:", error.message);
    return NextResponse.redirect(loginErrorUrl);
  }

  // Prefer admin home when no explicit next target was provided.
  if (!nextParam) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user && (await userHasAdminAccess(supabase, user))) {
      const adminUrl = new URL(`/${locale}/admin`, origin);
      // Copy cookies onto the admin redirect
      const adminResponse = NextResponse.redirect(adminUrl);
      response.cookies.getAll().forEach((c) => {
        adminResponse.cookies.set(c.name, c.value);
      });
      return adminResponse;
    }
  }

  return response;
}
