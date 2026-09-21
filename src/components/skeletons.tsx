/** Shared pulsing skeletons for instant loading UI */

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface">
      <div className="aspect-[4/5] animate-pulse bg-gray-200 dark:bg-gray-800" />
      <div className="space-y-2 p-3">
        <div className="h-4 w-[75%] animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="mt-3 h-9 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="product-grid" aria-busy aria-label="Loading products">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function StorefrontLoadingSkeleton() {
  return (
    <div className="page-shell storefront-container min-h-[calc(100vh-4rem)]">
      <div className="mb-6 max-w-xl space-y-3 md:mb-8">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200 md:h-9 dark:bg-gray-800" />
        <div className="h-4 w-72 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
      </div>
      <ProductGridSkeleton count={8} />
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <main className="page-shell storefront-container min-h-[calc(100vh-4rem)]">
      <div
        className="flex flex-col gap-8 lg:flex-row lg:gap-16"
        aria-busy
      >
        <div className="aspect-square w-full animate-pulse rounded-md bg-gray-200 lg:w-1/2 dark:bg-gray-800" />
        <div className="flex w-full flex-col gap-4 lg:w-1/2">
          <div className="h-4 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-6 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-10 w-[80%] animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-8 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="mt-2 space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-3 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-3 w-[66%] animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          </div>
          <div className="mt-6 flex gap-3">
            <div className="h-12 flex-1 animate-pulse rounded-md bg-gray-200 dark:bg-gray-800" />
            <div className="h-12 w-12 animate-pulse rounded-md bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>
      </div>
    </main>
  );
}

export function BrandedRouteLoader() {
  return (
    <div
      className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 px-4"
      role="status"
      aria-live="polite"
    >
      <p className="text-sm font-bold tracking-widest text-gray-900 uppercase dark:text-white">
        The supplier Kaung Set
      </p>
      <div className="h-1 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-gray-900 dark:bg-white" />
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}
