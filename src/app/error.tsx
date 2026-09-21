"use client";

import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Root-level error UI (outside locale segment). */
export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-xs font-bold tracking-[0.16em] text-foreground uppercase">
        The supplier Kaung Set
      </p>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Oops, something went wrong!
      </h1>
      <p className="mt-3 text-sm font-normal leading-relaxed text-foreground">
        We hit an unexpected issue. You can try again, or return to the home
        page.
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
          className="inline-flex min-w-[8.5rem] items-center justify-center rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Try Again
        </button>
        <a
          href="/"
          className="inline-flex min-w-[8.5rem] items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 transition hover:border-neutral-500"
        >
          Back to Home
        </a>
      </div>
    </main>
  );
}
