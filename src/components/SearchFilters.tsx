"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Filter, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  PRODUCT_AUTHENTICITY_OPTIONS,
  type Category,
  type ProductAuthenticity,
} from "@/types/database";
import {
  categoryLabel,
  categoryPathIds,
  childrenOf,
} from "@/lib/categories";
import { PopoverSelect } from "@/components/PopoverSelect";

function parseAuth(raw: string | null): ProductAuthenticity[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(
      (s): s is ProductAuthenticity =>
        s === "Genuine" || s === "OEM" || s === "Replica"
    );
}

function FilterPanel({
  categories,
  onClose,
}: {
  categories: Category[];
  onClose?: () => void;
}) {
  const t = useTranslations("search");
  const tProduct = useTranslations("product");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const categoryId =
    searchParams.get("categoryId") ?? searchParams.get("category") ?? "";
  const urlMin = searchParams.get("minPrice") ?? "";
  const urlMax = searchParams.get("maxPrice") ?? "";
  const inStockOnly = searchParams.get("inStock") === "1";
  const selectedAuth = parseAuth(searchParams.get("auth"));

  const [minPrice, setMinPrice] = useState(urlMin);
  const [maxPrice, setMaxPrice] = useState(urlMax);

  useEffect(() => {
    setMinPrice(urlMin);
    setMaxPrice(urlMax);
  }, [urlMin, urlMax]);

  const path = useMemo(
    () => categoryPathIds(categories, categoryId || null),
    [categories, categoryId]
  );

  const levelOptions = useMemo(() => {
    const levels: Category[][] = [];
    for (let level = 0; level < 4; level++) {
      const parentId = level === 0 ? null : path[level - 1] ?? null;
      if (level > 0 && !parentId) break;
      const kids = childrenOf(categories, parentId);
      if (kids.length === 0) break;
      levels.push(kids);
    }
    return levels;
  }, [categories, path]);

  function patchParams(patch: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value == null || value === "") params.delete(key);
      else params.set(key, value);
    }
    // Keep a single category key
    if ("categoryId" in patch) {
      params.delete("category");
    }
    const qs = params.toString();
    const href = qs ? `${pathname}?${qs}` : pathname;

    startTransition(() => {
      router.replace(href, { scroll: false });
      router.refresh();
    });
  }

  function selectCategoryAtLevel(level: number, id: string) {
    if (!id) {
      const parent = level === 0 ? "" : path[level - 1] ?? "";
      patchParams({ categoryId: parent || null });
      return;
    }
    patchParams({ categoryId: id });
  }

  function toggleAuth(value: ProductAuthenticity) {
    const next = selectedAuth.includes(value)
      ? selectedAuth.filter((a) => a !== value)
      : [...selectedAuth, value];
    patchParams({ auth: next.length ? next.join(",") : null });
  }

  function commitPrice() {
    patchParams({
      minPrice: minPrice.trim() || null,
      maxPrice: maxPrice.trim() || null,
    });
  }

  function clearFilters() {
    const q = searchParams.get("q") ?? searchParams.get("search");
    const href = q ? `${pathname}?q=${encodeURIComponent(q)}` : pathname;
    startTransition(() => {
      router.replace(href, { scroll: false });
      router.refresh();
    });
  }

  const fieldClass =
    "mt-1 w-full rounded-md border border-border bg-background px-2.5 py-2 text-sm font-normal text-foreground outline-none focus:border-foreground";

  return (
    <div
      className={`space-y-6 text-foreground ${pending ? "opacity-70" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold tracking-wide uppercase">
          {t("filters")}
        </h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-normal text-foreground underline-offset-2 hover:underline"
          >
            {t("clearFilters")}
          </button>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-background lg:hidden"
              aria-label={t("closeFilters")}
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
      </div>

      <section>
        <h3 className="text-sm font-semibold">{t("availability")}</h3>
        <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm font-normal text-foreground">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) =>
              patchParams({ inStock: e.target.checked ? "1" : null })
            }
          />
          <span>{t("inStockOnly")}</span>
        </label>
      </section>

      <section>
        <h3 className="text-sm font-semibold">{t("price")}</h3>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <label className="block text-xs font-normal text-foreground">
            {t("minPrice")}
            <input
              type="number"
              min={0}
              inputMode="numeric"
              className={fieldClass}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onBlur={commitPrice}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitPrice();
              }}
              placeholder="0"
            />
          </label>
          <label className="block text-xs font-normal text-foreground">
            {t("maxPrice")}
            <input
              type="number"
              min={0}
              inputMode="numeric"
              className={fieldClass}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onBlur={commitPrice}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitPrice();
              }}
              placeholder="—"
            />
          </label>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold">{t("category")}</h3>
        <p className="mt-1 text-xs font-normal leading-relaxed text-foreground">
          {t("categoryHint")}
        </p>
        <div className="mt-3 space-y-3">
          {levelOptions.map((options, level) => {
            const placeholder =
              level === 0 ? t("allCategories") : t("anySubcategory");
            const levelLabel = t("categoryLevel", { level: level + 1 });

            return (
              <div key={level} className="block">
                <p className="text-xs font-semibold text-foreground">
                  {levelLabel}
                </p>
                <PopoverSelect
                  aria-label={levelLabel}
                  value={path[level] ?? ""}
                  placeholder={placeholder}
                  onChange={(id) => selectCategoryAtLevel(level, id)}
                  options={options.map((cat) => ({
                    value: cat.id,
                    label: categoryLabel(cat, locale),
                    emoji: cat.emoji_icon.trim(),
                  }))}
                />
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold">{t("authenticity")}</h3>
        <div className="mt-2 space-y-2">
          {PRODUCT_AUTHENTICITY_OPTIONS.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-2 text-sm font-normal text-foreground"
            >
              <input
                type="checkbox"
                checked={selectedAuth.includes(opt)}
                onChange={() => toggleAuth(opt)}
              />
              <span>
                {tProduct(`authenticity${opt}` as "authenticityGenuine")}
              </span>
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}

export function SearchFilters({ categories }: { categories: Category[] }) {
  const t = useTranslations("search");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {/* Mobile trigger */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-foreground/40"
        >
          <Filter className="size-4" aria-hidden />
          {t("filters")}
        </button>
      </div>

      {/* Desktop sticky sidebar */}
      <aside className="hidden border border-border bg-surface p-4 lg:sticky lg:top-24 lg:block lg:self-start">
        <FilterPanel categories={categories} />
      </aside>

      {/* Mobile slide-out drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal>
          <button
            type="button"
            className="absolute inset-0 bg-foreground/40"
            aria-label={t("closeFilters")}
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(100%,20rem)] flex-col border-r border-border bg-surface shadow-lg">
            <div className="flex-1 overflow-y-auto p-4">
              <FilterPanel
                categories={categories}
                onClose={() => setOpen(false)}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
