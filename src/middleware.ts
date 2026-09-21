import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";
import { buildContentSecurityPolicy } from "./lib/csp";

const handleI18n = createIntlMiddleware(routing);

function stripLocale(pathname: string) {
  const parts = pathname.split("/");
  const maybeLocale = parts[1];
  if (routing.locales.includes(maybeLocale as "en" | "mm")) {
    const rest = "/" + parts.slice(2).join("/");
    return {
      locale: maybeLocale as "en" | "mm",
      path: rest === "/" ? "/" : rest.replace(/\/$/, "") || "/",
    };
  }
  return { locale: routing.defaultLocale, path: pathname };
}

/** Comma-separated allowlist from ADMIN_EMAIL (case-insensitive). */
function adminEmailAllowlist(): string[] {
  return (process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function isAdminPath(path: string) {
  return (
    path === "/admin" ||
    path.startsWith("/admin/") ||
    path === "/dashboard" ||
    path.startsWith("/dashboard/")
  );
}

function isAllowedAdminEmail(email: string | undefined): boolean {
  const allow = adminEmailAllowlist();
  if (allow.length === 0) return false;
  if (!email) return false;
  return allow.includes(email.trim().toLowerCase());
}

/** Admin if email is on ADMIN_EMAIL allowlist OR profiles.role = admin. */
async function isAdminUser(
  supabase: Awaited<ReturnType<typeof updateSession>>["supabase"],
  user: NonNullable<Awaited<ReturnType<typeof updateSession>>["user"]>
): Promise<boolean> {
  if (isAllowedAdminEmail(user.email)) return true;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return profile?.role === "admin";
}

/** Attach CSP + expose nonce to Server Components without reconstructing NextRequest. */
function applyCsp(response: NextResponse, nonce: string, csp: string) {
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("x-nonce", nonce);

  // Next.js convention: override inbound request headers for RSC
  response.headers.set("x-middleware-request-x-nonce", nonce);
  const existing = response.headers.get("x-middleware-override-headers");
  const merged = existing
    ? Array.from(new Set([...existing.split(","), "x-nonce"])).join(",")
    : "x-nonce";
  response.headers.set("x-middleware-override-headers", merged);

  return response;
}

export async function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildContentSecurityPolicy(nonce, {
    isDev: process.env.NODE_ENV === "development",
  });

  // Run next-intl first so locale redirects/rewrites are applied
  let response = handleI18n(request);

  // If intl middleware redirected, still attach session cookies on that response
  const session = await updateSession(request, response);
  response = session.response;
  const { supabase, user } = session;

  const { locale, path } = stripLocale(request.nextUrl.pathname);
  const isAdminRoute = isAdminPath(path);
  const isAccountRoute =
    path === "/account" ||
    path.startsWith("/account/") ||
    path === "/profile" ||
    path === "/wishlist" ||
    path.startsWith("/wishlist/");
  const isAuthRoute = path === "/login" || path === "/signup";

  if (isAdminRoute) {
    if (!user) {
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("next", `/${locale}${path}`);
      return applyCsp(NextResponse.redirect(loginUrl), nonce, csp);
    }

    if (!(await isAdminUser(supabase, user))) {
      const denied = new URL(`/${locale}`, request.url);
      denied.searchParams.set("admin", "denied");
      return applyCsp(NextResponse.redirect(denied), nonce, csp);
    }
  }

  if (isAccountRoute && !user) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("next", `/${locale}${path}`);
    return applyCsp(NextResponse.redirect(loginUrl), nonce, csp);
  }

  if (isAuthRoute && user) {
    const isAdmin = await isAdminUser(supabase, user);
    const dest = isAdmin
      ? new URL(`/${locale}/admin`, request.url)
      : new URL(`/${locale}`, request.url);
    return applyCsp(NextResponse.redirect(dest), nonce, csp);
  }

  return applyCsp(response, nonce, csp);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
