/**
 * Shared CSP + infrastructure helpers for middleware / next.config.
 */

export function supabaseHostnameFromEnv(
  url = process.env.NEXT_PUBLIC_SUPABASE_URL
): string | undefined {
  if (!url?.trim()) return undefined;
  try {
    return new URL(url).hostname;
  } catch {
    return undefined;
  }
}

/** Build a nonce-based CSP compatible with Next.js + GTM + React inline styles. */
export function buildContentSecurityPolicy(
  nonce: string,
  options?: { isDev?: boolean; supabaseHost?: string }
): string {
  const isDev = options?.isDev ?? process.env.NODE_ENV === "development";
  const supabaseHost =
    options?.supabaseHost ?? supabaseHostnameFromEnv() ?? "";

  const supabaseHttps = supabaseHost ? `https://${supabaseHost}` : "";
  const supabaseWss = supabaseHost ? `wss://${supabaseHost}` : "";

  // Scripts stay nonce-hardened. 'strict-dynamic' ignores legacy unsafe-inline
  // in modern browsers. Dev still needs unsafe-eval for Turbopack/HMR.
  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://googletagmanager.com",
    ...(isDev ? ["'unsafe-eval'"] : []),
  ].join(" ");

  // IMPORTANT: do not put a nonce/hash on style-src. Browsers then ignore
  // 'unsafe-inline' and block React/Next style="" attributes (flood of CSP errors).
  // XSS risk is mainly from scripts; styles stay allowlisted to self + Google Fonts.
  const styleSrc = [
    "'self'",
    "'unsafe-inline'",
    "https://fonts.googleapis.com",
  ].join(" ");

  const imgSrc = [
    "'self'",
    "data:",
    "blob:",
    supabaseHttps,
    "https://images.unsplash.com",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
  ]
    .filter(Boolean)
    .join(" ");

  const connectSrc = [
    "'self'",
    supabaseHttps,
    supabaseWss,
    "https://www.google-analytics.com",
    "https://www.googletagmanager.com",
    "https://region1.google-analytics.com",
    "https://analytics.google.com",
  ]
    .filter(Boolean)
    .join(" ");

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    `style-src ${styleSrc}`,
    `img-src ${imgSrc}`,
    "font-src 'self' data: https://fonts.gstatic.com",
    `connect-src ${connectSrc}`,
    "frame-src 'self' https://www.googletagmanager.com",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}
