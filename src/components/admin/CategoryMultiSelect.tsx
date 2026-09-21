"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import type { Category } from "@/types/database";
import { categoryBreadcrumb } from "@/lib/categories";

type CategoryMultiSelectProps = {
  categories: Category[];
  value: string[];
  onChange: (ids: string[]) => void;
  /** Prefer showing only roots in a compact admin table; default all with breadcrumbs */
  rootsOnly?: boolean;
};

export function CategoryMultiSelect({
  categories,
  value,
  onChange,
  rootsOnly = false,
}: CategoryMultiSelectProps) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const options = useMemo(() => {
    const list = rootsOnly
      ? categories.filter((c) => !c.parent_id)
      : categories;
    const q = query.trim().toLowerCase();
    return list
      .map((cat) => ({
        cat,
        label: categoryBreadcrumb(categories, cat.id, locale),
      }))
      .filter(({ label, cat }) => {
        if (!q) return true;
        return (
          label.toLowerCase().includes(q) ||
          cat.name_en.toLowerCase().includes(q) ||
          cat.name_mm.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [categories, locale, query, rootsOnly]);

  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((x) => x !== id));
    } else {
      onChange([...value, id]);
    }
  }

  const summary =
    value.length === 0
      ? t("eligibleCategoriesAll")
      : value.length === 1
        ? categoryBreadcrumb(categories, value[0], locale)
        : t("eligibleCategoriesCount", { count: value.length });

  return (
    <div ref={rootRef} className="relative min-w-[14rem]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-border bg-surface px-2 py-1.5 text-left text-sm"
      >
        <span className="truncate">{summary}</span>
        <ChevronDown className="size-4 shrink-0 text-muted" aria-hidden />
      </button>

      {open ? (
        <div className="absolute z-30 mt-1 w-[min(22rem,80vw)] rounded-md border border-border bg-surface p-2 shadow-md">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchCategories")}
            className="mb-2 w-full rounded-md border border-border px-2 py-1.5 text-sm outline-none focus:border-foreground"
          />
          <div className="mb-2 flex gap-2 text-xs">
            <button
              type="button"
              className="underline underline-offset-2"
              onClick={() => onChange([])}
            >
              {t("clearCategories")}
            </button>
          </div>
          <div className="max-h-52 space-y-1 overflow-y-auto">
            {options.length === 0 ? (
              <p className="px-1 py-2 text-xs text-muted">{t("noCategories")}</p>
            ) : (
              options.map(({ cat, label }) => (
                <label
                  key={cat.id}
                  className="flex cursor-pointer items-start gap-2 rounded px-1 py-1 text-sm hover:bg-background"
                >
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={value.includes(cat.id)}
                    onChange={() => toggle(cat.id)}
                  />
                  <span className="leading-snug">{label}</span>
                </label>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
