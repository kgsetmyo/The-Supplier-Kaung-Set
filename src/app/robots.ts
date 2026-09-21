import type { MetadataRoute } from "next";

function siteOrigin() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}

export default function robots(): MetadataRoute.Robots {
  const origin = siteOrigin();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/en/admin/",
        "/mm/admin/",
        "/dashboard/",
        "/en/dashboard/",
        "/mm/dashboard/",
        "/checkout/",
        "/en/checkout/",
        "/mm/checkout/",
        "/account/",
        "/en/account/",
        "/mm/account/",
        "/api/",
      ],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
