"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { submitProductReview } from "@/lib/actions";
import { StarRating } from "@/components/StarRating";
import type { Review } from "@/types/database";

export function ProductReviews({
  productId,
  reviews,
  isSignedIn,
}: {
  productId: string;
  reviews: Review[];
  isSignedIn: boolean;
}) {
  const t = useTranslations("reviews");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(id);
  }, [toast]);

  const average =
    reviews.length === 0
      ? 0
      : reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isSignedIn) {
      router.push("/login");
      return;
    }

    startTransition(async () => {
      const result = await submitProductReview({
        productId,
        rating,
        comment,
      });
      if (!result.ok) {
        if (result.code === "unauthenticated") {
          router.push("/login");
          return;
        }
        setError(result.message);
        return;
      }
      setComment("");
      setRating(5);
      setToast(t("pendingToast"));
      router.refresh();
    });
  }

  return (
    <section className="mt-12 border-t border-border pt-10">
      {toast ? (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 max-w-sm -translate-x-1/2 rounded-md border border-border bg-foreground px-4 py-3 text-center text-sm font-semibold text-background shadow-lg"
        >
          {toast}
        </div>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {t("title")}
          </h2>
          <p className="mt-1 text-sm font-normal text-foreground">
            {reviews.length === 0
              ? t("empty")
              : t("summary", {
                  count: reviews.length,
                  avg: average.toFixed(1),
                })}
          </p>
        </div>
        {reviews.length > 0 ? (
          <div className="flex items-center gap-2">
            <StarRating rating={average} size="md" />
            <span className="text-sm font-semibold text-foreground">
              {average.toFixed(1)}
            </span>
          </div>
        ) : null}
      </div>

      <ul className="mt-6 space-y-4">
        {reviews.map((review) => (
          <li
            key={review.id}
            className="border border-border bg-surface p-4 text-foreground"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold">
                {review.reviewer_name?.trim() || t("anonymous")}
              </p>
              <StarRating rating={review.rating} />
            </div>
            <p className="mt-3 text-sm font-normal leading-relaxed whitespace-pre-wrap">
              {review.comment}
            </p>
            <p className="mt-2 text-[11px] font-normal text-foreground">
              {new Date(review.created_at).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>

      {isSignedIn ? (
        <form
          onSubmit={onSubmit}
          className="mt-8 space-y-4 border border-border bg-surface p-5"
        >
          <h3 className="text-sm font-bold tracking-wide text-foreground">
            {t("writeReview")}
          </h3>

          <fieldset>
            <legend className="text-xs font-semibold text-foreground">
              {t("rating")}
            </legend>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  aria-label={t("ratingValue", { value })}
                  aria-pressed={rating === value}
                  className="rounded p-1 transition hover:scale-110"
                >
                  <Star
                    className={`size-7 ${
                      value <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-transparent text-border"
                    }`}
                  />
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block text-xs font-semibold text-foreground">
            {t("comment")}
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("commentPlaceholder")}
              className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm font-normal text-foreground outline-none focus:border-foreground"
            />
          </label>

          {error ? <p className="text-sm text-sale">{error}</p> : null}

          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg disabled:opacity-50"
          >
            {pending ? t("submitting") : t("submit")}
          </button>
        </form>
      ) : (
        <p className="mt-8 text-sm font-normal text-foreground">
          {t("signInHint")}{" "}
          <Link href="/login" className="font-semibold underline underline-offset-4">
            {t("signInLink")}
          </Link>
        </p>
      )}
    </section>
  );
}
