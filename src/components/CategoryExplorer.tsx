"use client";

import Image from "next/image";
import { useEffect, useId, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Layers3, Search, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { fetchExplorerCategories } from "@/lib/category-explorer-actions";
import type { ExplorerCategory } from "@/types/database";
import { categoryLabel, childrenOf } from "@/lib/categories";

function categoryEmoji(cat: ExplorerCategory) {
  return cat.emoji_icon.trim();
}

function categoryHref(id: string) {
  return `/search?categoryId=${encodeURIComponent(id)}`;
}

function CategoryCardFace({
  cat,
  label,
  hasKids,
}: {
  cat: ExplorerCategory;
  label: string;
  hasKids: boolean;
}) {
  const emoji = categoryEmoji(cat);

  return (
    <>
      {cat.image_url ? (
        <Image
          src={cat.image_url}
          alt=""
          fill
          sizes="(max-width: 640px) 45vw, 200px"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-foreground/25 via-foreground/10 to-foreground/5"
          aria-hidden
        />
      )}

      {!cat.image_url && emoji ? (
        <span
          className="absolute inset-0 flex items-center justify-center text-4xl opacity-50"
          aria-hidden
        >
          {emoji}
        </span>
      ) : null}

      <div
        className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"
        aria-hidden
      />

      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-1 p-3">
        <span className="text-sm font-semibold leading-snug text-white">
          {emoji && cat.image_url ? (
            <span className="mr-1" aria-hidden>
              {emoji}
            </span>
          ) : null}
          {label}
        </span>
        {hasKids ? (
          <ChevronRight
            className="mb-0.5 size-4 shrink-0 text-white/80"
            aria-hidden
          />
        ) : null}
      </span>
    </>
  );
}

export function CategoryExplorer() {
  const t = useTranslations("categories");
  const locale = useLocale();
  const router = useRouter();
  const titleId = useId();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [categories, setCategories] = useState<ExplorerCategory[]>([]);
  /** Stack of selected parent ids for drill-down (empty = roots). */
  const [stack, setStack] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open || loaded) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const data = await fetchExplorerCategories();
        if (!cancelled) {
          setCategories(data);
          setLoaded(true);
        }
      } catch (err) {
        console.error(
          "Failed to load explorer categories:",
          err instanceof Error ? err.message : err
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, loaded]);

  const parentId = stack.length === 0 ? null : stack[stack.length - 1]!;
  const items = useMemo(
    () => childrenOf(categories, parentId),
    [categories, parentId]
  );
  const current = parentId
    ? (categories.find((c) => c.id === parentId) ?? null)
    : null;

  function openDrawer() {
    setStack([]);
    setOpen(true);
  }

  function closeDrawer() {
    setOpen(false);
    setStack([]);
  }

  function goBack() {
    setStack((s) => s.slice(0, -1));
  }

  function shopCategory(id: string) {
    closeDrawer();
    router.push(categoryHref(id));
  }

  function onSelect(cat: ExplorerCategory) {
    const kids = childrenOf(categories, cat.id);
    if (kids.length > 0) {
      setStack((s) => [...s, cat.id]);
      return;
    }
    shopCategory(cat.id);
  }

  const cardShell =
    "group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-background text-left shadow-sm transition hover:border-foreground/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

  return (
    <>
      <button
        type="button"
        onClick={openDrawer}
        className="fixed right-4 bottom-4 z-50 inline-flex size-12 items-center justify-center rounded-full bg-accent text-accent-fg shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:right-6 sm:bottom-6"
        aria-label={t("open")}
      >
        <Layers3 className="size-5" aria-hidden />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[60]"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <button
            type="button"
            className="absolute inset-0 bg-foreground/25 backdrop-blur-[2px]"
            aria-label={t("close")}
            onClick={closeDrawer}
          />

          <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-border bg-surface shadow-2xl">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              {stack.length > 0 ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-background transition hover:bg-surface"
                  aria-label={t("back")}
                >
                  <ChevronLeft className="size-4" aria-hidden />
                </button>
              ) : (
                <span
                  className="inline-flex size-9 items-center justify-center text-lg"
                  aria-hidden
                >
                  {current ? categoryEmoji(current) : "🗂️"}
                </span>
              )}

              <div className="min-w-0 flex-1">
                <h2
                  id={titleId}
                  className="truncate text-base font-semibold tracking-tight"
                >
                  {current ? categoryLabel(current, locale) : t("title")}
                </h2>
                <p className="truncate text-xs text-muted">
                  {current ? t("browseIn") : t("subtitle")}
                </p>
              </div>

              <button
                type="button"
                onClick={closeDrawer}
                className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-background transition hover:bg-surface"
                aria-label={t("close")}
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>

            {current ? (
              <div className="border-b border-border px-4 py-3">
                <button
                  type="button"
                  onClick={() => shopCategory(current.id)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-3 py-2.5 text-sm font-medium transition hover:bg-surface"
                >
                  <Search className="size-4" aria-hidden />
                  {t("shopAll", { name: categoryLabel(current, locale) })}
                </button>
              </div>
            ) : null}

            <div className="flex-1 overflow-y-auto px-3 py-3">
              {loading ? (
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[4/3] animate-pulse rounded-2xl border border-border bg-background"
                    />
                  ))}
                </div>
              ) : items.length === 0 ? (
                <p className="px-2 py-10 text-center text-sm text-muted">
                  {t("empty")}
                </p>
              ) : (
                <ul className="grid grid-cols-2 gap-2">
                  {items.map((cat) => {
                    const hasKids = childrenOf(categories, cat.id).length > 0;
                    const label = categoryLabel(cat, locale);

                    return (
                      <li key={cat.id}>
                        {hasKids ? (
                          <button
                            type="button"
                            onClick={() => onSelect(cat)}
                            className={cardShell}
                          >
                            <CategoryCardFace
                              cat={cat}
                              label={label}
                              hasKids
                            />
                          </button>
                        ) : (
                          <Link
                            href={categoryHref(cat.id)}
                            onClick={closeDrawer}
                            className={cardShell}
                          >
                            <CategoryCardFace
                              cat={cat}
                              label={label}
                              hasKids={false}
                            />
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
