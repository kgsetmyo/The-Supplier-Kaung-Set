import { Inter, Noto_Sans_Myanmar } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { GoogleTagManager } from "@next/third-parties/google";
import { FloatingContactButton } from "@/components/FloatingContactButton";
import { CartSync } from "@/components/CartSync";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { parseThemePreference } from "@/lib/theme";
import { getServerThemeClass } from "@/lib/theme-server";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const myanmar = Noto_Sans_Myanmar({
  subsets: ["myanmar"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-myanmar",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "The supplier Kaung Set",
    template: "%s | The supplier Kaung Set",
  },
  description: "The supplier Kaung Set — bilingual e-commerce storefront",
  applicationName: "The supplier Kaung Set",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kaung Set",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const themeClass = await getServerThemeClass();
  const themeCookie = (await cookies()).get("ks-theme")?.value;
  const initialTheme = parseThemePreference(themeCookie);

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${myanmar.variable} ${themeClass} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground antialiased">
        <ThemeProvider defaultTheme="system" initialTheme={initialTheme}>
          <NextIntlClientProvider messages={messages}>
            <div className="flex min-h-full flex-col">
              <div className="flex-1">{children}</div>
              <Footer />
            </div>
            <CartSync />
            <FloatingContactButton />
          </NextIntlClientProvider>
        </ThemeProvider>
        {gtmId ? <GoogleTagManager gtmId={gtmId} nonce={nonce} /> : null}
      </body>
    </html>
  );
}
