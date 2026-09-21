"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Category } from "@/types/database";
import {
  categoryLabel,
  categoryPathIds,
  childrenOf,
} from "@/lib/categories";

const MAX_LEVELS = 4;

type CategoryCascadeSelectProps = {
  categories: Category[];
  value: string;
  onChange: (categoryId: string) => void;
  className?: string;
};

export function CategoryCascadeSelect({
  categories,
  value,
  onChange,
  className,
}: CategoryCascadeSelectProps) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const [path, setPath] = useState<string[]>(() =>
    categoryPathIds(categories, value || null)
  );

  useEffect(() => {
    setPath(categoryPathIds(categories, value || null));
  }, [value, categories]);

  const levelOptions = useMemo(() => {
    const levels: Category[][] = [];
    for (let level = 0; level < MAX_LEVELS; level++) {
      const parentId = level === 0 ? null : path[level - 1] ?? null;
      if (level > 0 && !parentId) break;
      const kids = childrenOf(categories, parentId);
      if (kids.length === 0) break;
      levels.push(kids);
    }
    return levels;
  }, [categories, path]);

  function selectAtLevel(level: number, id: string) {
    const next = [...path.slice(0, level), ...(id ? [id] : [])];
    setPath(next);
    onChange(id);
  }

  const fieldClass =
    className ??
    "mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-foreground";

  const levelLabels = [
    t("categoryLevel1"),
    t("categoryLevel2"),
    t("categoryLevel3"),
    t("categoryLevel4"),
  ];

  if (categories.length === 0) {
    return <p className="mt-1 text-xs text-muted">{t("noCategoriesHint")}</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {levelOptions.map((options, level) => (
        <label key={level} className="block text-sm">
          <span>{levelLabels[level] ?? t("category")}</span>
          <select
            className={fieldClass}
            value={path[level] ?? ""}
            onChange={(e) => selectAtLevel(level, e.target.value)}
          >
            <option value="">
              {level === 0 ? t("categoryNone") : t("categorySelectSub")}
            </option>
            {options.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {categoryLabel(cat, locale)}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  );
}
