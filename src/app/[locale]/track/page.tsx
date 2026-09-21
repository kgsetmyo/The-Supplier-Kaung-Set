import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { TrackOrderForm } from "@/components/TrackOrderForm";
import { TrackPageShell } from "@/components/TrackPageShell";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function TrackPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <TrackPageShell>
      <Suspense
        fallback={
          <div className="mx-auto max-w-xl py-10 text-sm text-muted">…</div>
        }
      >
        <TrackOrderForm />
      </Suspense>
    </TrackPageShell>
  );
}
