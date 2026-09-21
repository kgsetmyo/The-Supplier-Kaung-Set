import { BetaAnalyticsDataClient } from "@google-analytics/data";

export type DashboardMetrics = {
  activeUsers: number;
  pageViews: number;
  productClicks: number;
};

export type TopViewedProduct = {
  name: string;
  views: number;
};

function getCredentials() {
  const propertyId = process.env.GA_PROPERTY_ID?.trim();
  const clientEmail = process.env.GA_CLIENT_EMAIL?.trim();
  const privateKey = process.env.GA_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();

  if (!propertyId || !clientEmail || !privateKey) {
    return null;
  }

  return { propertyId, clientEmail, privateKey };
}

function createClient(clientEmail: string, privateKey: string) {
  return new BetaAnalyticsDataClient({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
  });
}

function metricValue(
  rows: { metricValues?: { value?: string | null }[] | null }[] | null | undefined,
  index = 0
) {
  const raw = rows?.[0]?.metricValues?.[index]?.value;
  const n = Number(raw ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function mapTopProductRows(
  rows:
    | {
        dimensionValues?: { value?: string | null }[] | null;
        metricValues?: { value?: string | null }[] | null;
      }[]
    | null
    | undefined
): TopViewedProduct[] {
  return (rows ?? [])
    .map((row) => {
      const name = String(row.dimensionValues?.[0]?.value ?? "").trim();
      const views = Number(row.metricValues?.[0]?.value ?? 0);
      if (!name || name === "(not set)" || !Number.isFinite(views)) {
        return null;
      }
      return { name, views };
    })
    .filter((row): row is TopViewedProduct => row != null);
}

/**
 * Last-7-day GA4 overview for the admin dashboard.
 * Returns `null` when credentials are missing or the API call fails.
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics | null> {
  try {
    const creds = getCredentials();
    if (!creds) return null;

    const client = createClient(creds.clientEmail, creds.privateKey);
    const property = `properties/${creds.propertyId}`;
    const dateRanges = [{ startDate: "7daysAgo", endDate: "today" }];

    const [[summary], [productClicks]] = await Promise.all([
      client.runReport({
        property,
        dateRanges,
        metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
      }),
      client.runReport({
        property,
        dateRanges,
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: {
          filter: {
            fieldName: "eventName",
            stringFilter: {
              matchType: "EXACT",
              value: "view_item",
            },
          },
        },
      }),
    ]);

    return {
      activeUsers: metricValue(summary.rows, 0),
      pageViews: metricValue(summary.rows, 1),
      productClicks: metricValue(productClicks.rows, 0),
    };
  } catch (error) {
    console.error(
      "[analytics] getDashboardMetrics failed:",
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

const VIEW_ITEM_FILTER = {
  filter: {
    fieldName: "eventName",
    stringFilter: {
      matchType: "EXACT" as const,
      value: "view_item",
    },
  },
};

/**
 * Top products by views (last 7 days).
 * Uses GA4-compatible dimension/metric pairs only:
 * - itemName + itemsViewed (item-scoped; needs ecommerce items in GA4)
 * - customEvent:product_name|item_name + eventCount (needs custom dims registered)
 * Returns `[]` on missing credentials / API errors (never throws; no noisy logs).
 */
export async function getTopViewedProducts(
  limit = 10
): Promise<TopViewedProduct[]> {
  try {
    const creds = getCredentials();
    if (!creds) return [];

    const client = createClient(creds.clientEmail, creds.privateKey);
    const property = `properties/${creds.propertyId}`;
    const dateRanges = [{ startDate: "7daysAgo", endDate: "today" }];
    const limitSafe = Math.min(Math.max(limit, 1), 25);

    // itemName is incompatible with eventCount — use itemsViewed instead.
    const attempts: {
      dimension: string;
      metric: string;
      filterViewItem: boolean;
    }[] = [
      { dimension: "itemName", metric: "itemsViewed", filterViewItem: false },
      {
        dimension: "customEvent:product_name",
        metric: "eventCount",
        filterViewItem: true,
      },
      {
        dimension: "customEvent:item_name",
        metric: "eventCount",
        filterViewItem: true,
      },
    ];

    for (const attempt of attempts) {
      try {
        const [report] = await client.runReport({
          property,
          dateRanges,
          dimensions: [{ name: attempt.dimension }],
          metrics: [{ name: attempt.metric }],
          ...(attempt.filterViewItem
            ? { dimensionFilter: VIEW_ITEM_FILTER }
            : {}),
          orderBys: [
            { metric: { metricName: attempt.metric }, desc: true },
          ],
          limit: limitSafe,
        });

        const mapped = mapTopProductRows(report.rows);
        if (mapped.length > 0) return mapped;
      } catch {
        // Expected when custom dims aren't registered or ecommerce items aren't set up.
        // Skip quietly so the admin dashboard console stays clean.
      }
    }

    return [];
  } catch (error) {
    console.error(
      "[analytics] getTopViewedProducts failed:",
      error instanceof Error ? error.message : error
    );
    return [];
  }
}
