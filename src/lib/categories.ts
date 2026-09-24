import type { Category } from "@/types/database";

export function categoryLabel(category: Category, locale: string) {
  return locale === "mm" ? category.name_mm || category.name_en : category.name_en;
}

/** Emoji + localized name for selects / menus. */
export function categoryOptionLabel(category: Category, locale: string) {
  const emoji = category.emoji_icon.trim();
  return emoji
    ? `${emoji} ${categoryLabel(category, locale)}`
    : categoryLabel(category, locale);
}

export function childrenOf<T extends Category>(
  categories: T[],
  parentId: string | null
): T[] {
  const parentKey = parentId ? String(parentId) : null;
  return categories
    .filter((c) => (c.parent_id ? String(c.parent_id) : null) === parentKey)
    .slice()
    .sort((a, b) => {
      const so = (a.sort_order ?? 0) - (b.sort_order ?? 0);
      if (so !== 0) return so;
      return a.name_en.localeCompare(b.name_en);
    });
}

/** Ancestor chain from root → leaf for a category id. */
export function categoryPathIds(
  categories: Category[],
  categoryId: string | null | undefined
): string[] {
  if (!categoryId) return [];
  const byId = new Map(categories.map((c) => [c.id, c]));
  const path: string[] = [];
  let current: string | null | undefined = categoryId;
  const seen = new Set<string>();

  while (current && byId.has(current) && !seen.has(current)) {
    seen.add(current);
    path.unshift(current);
    current = byId.get(current)?.parent_id ?? null;
  }

  return path;
}

export function categoryBreadcrumb(
  categories: Category[],
  categoryId: string | null | undefined,
  locale: string
): string {
  const path = categoryPathIds(categories, categoryId);
  if (path.length === 0) return "—";
  const byId = new Map(categories.map((c) => [c.id, c]));
  return path
    .map((id) => {
      const cat = byId.get(id);
      return cat ? categoryLabel(cat, locale) : id;
    })
    .join(" › ");
}

/** Root + all nested descendants (inclusive). */
export function descendantIds(
  categories: Category[],
  rootId: string
): string[] {
  const childrenByParent = new Map<string | null, string[]>();
  for (const cat of categories) {
    const parentKey = cat.parent_id ? String(cat.parent_id) : null;
    const list = childrenByParent.get(parentKey) ?? [];
    list.push(String(cat.id));
    childrenByParent.set(parentKey, list);
  }

  const result: string[] = [];
  const stack = [String(rootId)];
  const seen = new Set<string>();

  while (stack.length > 0) {
    const id = stack.pop()!;
    if (seen.has(id)) continue;
    seen.add(id);
    result.push(id);
    const kids = childrenByParent.get(id) ?? [];
    for (const kid of kids) stack.push(kid);
  }

  return result;
}

/** True if productCategory is ruleCategory or nested under it. */
export function categoryMatchesRule(
  categories: Category[],
  productCategoryId: string | null | undefined,
  ruleCategoryId: string
): boolean {
  if (!productCategoryId) return false;
  return categoryPathIds(categories, productCategoryId).includes(ruleCategoryId);
}
