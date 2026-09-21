"use client";

import { Star } from "lucide-react";

type StarRatingProps = {
  rating: number;
  size?: "sm" | "md";
  className?: string;
};

/** Yellow filled / empty Lucide stars for a 1–5 rating (supports fractional fill via round). */
export function StarRating({
  rating,
  size = "sm",
  className = "",
}: StarRatingProps) {
  const cls = size === "md" ? "size-5" : "size-3.5";
  const rounded = Math.round(rating);

  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      aria-label={`${rating}/5`}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < rounded;
        return (
          <Star
            key={i}
            className={`${cls} ${
              filled
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-border"
            }`}
            aria-hidden
          />
        );
      })}
    </span>
  );
}
