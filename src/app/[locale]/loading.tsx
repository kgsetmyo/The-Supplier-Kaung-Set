import { BrandedRouteLoader } from "@/components/skeletons";

/**
 * Instant feedback while any locale route segment loads.
 * Neutral branded pulse (no storefront Header) so /admin doesn't flash shop chrome.
 */
export default function LocaleLoading() {
  return <BrandedRouteLoader />;
}
