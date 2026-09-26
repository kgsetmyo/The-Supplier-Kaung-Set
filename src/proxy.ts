import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";
import { buildContentSecurityPolicy } from "./lib/csp";
import { userHasAdminAccess } from "./lib/admin-access";

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

function isAdminPath(path: string) {
  return (
    path === "/admin" ||
    path.startsWith("/admin/") ||
    path === "/dashboard" ||
    path.startsWith("/dashboard/")
  );
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

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildContentSecurityPolicy(nonce, {
    isDev: process.env.NODE_ENV === "development",
  });

  // Locale-agnostic auth callback must not be rewritten by next-intl
  // (e.g. /auth/callback?code=... from Supabase email links).
  if (request.nextUrl.pathname.startsWith("/auth/")) {
    const passthrough = NextResponse.next();
    const session = await updateSession(request, passthrough);
    return applyCsp(session.response, nonce, csp);
  }

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

    if (!(await userHasAdminAccess(supabase, user))) {
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
    const isAdmin = await userHasAdminAccess(supabase, user);
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
