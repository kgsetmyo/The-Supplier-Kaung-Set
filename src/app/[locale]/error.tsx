"use client";

import { useEffect } from "react";
import { Link } from "@/i18n/navigation";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="page-shell mx-auto flex min-h-[70vh] w-full max-w-lg flex-col items-center justify-center px-4 py-12 text-center md:px-8 md:py-16 lg:px-12">
      <p className="brand-logo text-[11px] leading-snug sm:text-xs">
        The supplier Kaung Set
      </p>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Oops, something went wrong!
      </h1>
      <p className="mt-3 text-sm font-normal leading-relaxed text-foreground">
        We hit an unexpected issue. You can try again, or head back to the shop
        and continue browsing.
      </p>
      {error.digest ? (
        <p className="mt-2 font-mono text-[11px] text-foreground/70">
          Ref: {error.digest}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex min-w-[8.5rem] items-center justify-center rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg transition hover:opacity-90"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex min-w-[8.5rem] items-center justify-center rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-foreground/40"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
