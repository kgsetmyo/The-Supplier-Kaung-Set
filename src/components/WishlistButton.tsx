"use client";

import { useOptimistic, useTransition } from "react";
import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { toggleWishlist } from "@/app/actions/wishlist";

export function WishlistButton({
  productId,
  initialWishlisted,
  className = "",
  variant = "icon",
}: {
  productId: string;
  initialWishlisted: boolean;
  className?: string;
  /** Circular icon on cards, or labeled button on product details. */
  variant?: "icon" | "label";
}) {
  const t = useTranslations("product");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [wishlisted, setOptimistic] = useOptimistic(
    initialWishlisted,
    (_current, next: boolean) => next
  );

  function onToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const next = !wishlisted;
    startTransition(async () => {
      setOptimistic(next);
      const result = await toggleWishlist(productId);
      if (!result.ok) {
        setOptimistic(initialWishlisted);
        if (result.code === "unauthenticated") {
          router.push("/login");
        }
        return;
      }
      setOptimistic(result.wishlisted);
      router.refresh();
    });
  }

  if (variant === "label") {
    return (
      <button
        type="button"
        onClick={onToggle}
        disabled={pending}
        aria-pressed={wishlisted}
        className={`inline-flex items-center justify-center gap-2 rounded-md border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-foreground/40 disabled:opacity-60 ${className}`}
      >
        <Heart
          className={`size-4 ${
            wishlisted
              ? "fill-red-500 text-red-500"
              : "fill-none text-foreground"
          }`}
          aria-hidden
        />
        {wishlisted ? t("wishlistSaved") : t("wishlistSave")}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={pending}
      aria-pressed={wishlisted}
      aria-label={wishlisted ? t("wishlistRemove") : t("wishlistAdd")}
      className={`inline-flex size-9 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm transition hover:scale-105 disabled:opacity-60 ${className}`}
    >
      <Heart
        className={`size-4 transition ${
          wishlisted
            ? "fill-red-500 text-red-500"
            : "fill-none text-foreground"
        }`}
        aria-hidden
      />
    </button>
  );
}
