/**
 * Canonical public site origin for auth redirects (signup, password reset).
 * Prefer NEXT_PUBLIC_SITE_URL so production never accidentally uses localhost.
 */
export function getPublicSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}

/** Absolute URL for the PKCE auth callback (locale-agnostic). */
export function getAuthCallbackUrl(nextPath?: string): string {
  const base = `${getPublicSiteUrl()}/auth/callback`;
  if (!nextPath) return base;
  const next = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  return `${base}?next=${encodeURIComponent(next)}`;
}
