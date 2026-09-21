import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "The supplier Kaung Set",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kaung Set",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#171717" },
    { media: "(prefers-color-scheme: dark)", color: "#171717" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

/** Root layout — locale layout owns <html>/<body>. */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
