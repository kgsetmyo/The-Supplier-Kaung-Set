import { sendGAEvent } from "@next/third-parties/google";

/** True when NEXT_PUBLIC_GA_MEASUREMENT_ID is set (client-safe). */
export function isGaEnabled() {
  return Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim());
}

type GaItem = {
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
};

/** GA4 ecommerce-style event via gtag (works with <GoogleAnalytics />). */
export function trackGaEvent(
  eventName: string,
  params: {
    currency?: string;
    value?: number;
    items?: GaItem[];
    [key: string]: unknown;
  } = {}
) {
  if (typeof window === "undefined") return;
  if (!isGaEnabled()) return;

  try {
    sendGAEvent("event", eventName, {
      currency: params.currency ?? "MMK",
      ...params,
    });
  } catch {
    // Ignore analytics failures — never block checkout / UI.
  }
}
