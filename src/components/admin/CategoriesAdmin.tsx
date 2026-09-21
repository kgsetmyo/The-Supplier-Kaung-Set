"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/types/database";
import { useRouter } from "@/i18n/navigation";
import { categoryBreadcrumb, categoryLabel } from "@/lib/categories";

const emptyForm = {
  name_en: "",
  name_mm: "",
  parent_id: "",
  emoji_icon: "",
  sort_order: "0",
  slug: "",
};

function isEmojiProvided(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed !== "🏷️";
}

export function CategoriesAdmin({ categories }: { categories: Category[] }) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const router = useRouter();
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const sorted = useMemo(
    () =>
      [...categories].sort((a, b) => {
        const pathA = categoryBreadcrumb(categories, a.id, "en");
        const pathB = categoryBreadcrumb(categories, b.id, "en");
        return pathA.localeCompare(pathB);
      }),
    [categories]
  );

  function openCreate() {
    setCreating(true);
    setEditing(null);
    setForm(emptyForm);
    setError(null);
  }

  function openEdit(cat: Category) {
    setCreating(false);
    setEditing(cat);
    setForm({
      name_en: cat.name_en,
      name_mm: cat.name_mm,
      parent_id: cat.parent_id ?? "",
      emoji_icon: cat.emoji_icon ?? "",
      sort_order: String(cat.sort_order ?? 0),
      slug: cat.slug ?? "",
    });
    setError(null);
  }

  function closeForm() {
    setCreating(false);
    setEditing(null);
    setForm(emptyForm);
    setError(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const emoji = form.emoji_icon.trim();
    if (!isEmojiProvided(emoji)) {
      setError(t("emojiRequired"));
      return;
    }
    if (!form.name_en.trim() || !form.name_mm.trim()) {
      setError(t("categoryNameRequired"));
      return;
    }

    const supabase = createClient();
    const payload = {
      name_en: form.name_en.trim(),
      name_mm: form.name_mm.trim(),
      parent_id: form.parent_id || null,
      emoji_icon: emoji,
      sort_order: Number(form.sort_order) || 0,
      slug: form.slug.trim() || null,
    };

    const result = editing
      ? await supabase.from("categories").update(payload).eq("id", editing.id)
      : await supabase.from("categories").insert(payload);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    closeForm();
    startTransition(() => router.refresh());
  }

  const showForm = creating || editing;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {t("categories")}
          </h1>
          <p className="mt-1 text-sm text-foreground">{t("categoriesSubtitle")}</p>
        </div>
        {!showForm ? (
          <button
            type="button"
            onClick={openCreate}
            className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-accent-fg"
          >
            {t("addCategory")}
          </button>
        ) : null}
      </div>

      {showForm ? (
        <form
          onSubmit={onSubmit}
          className="space-y-4 border border-border bg-surface p-4"
        >
          <h2 className="text-sm font-semibold text-foreground">
            {editing ? t("editCategory") : t("addCategory")}
          </h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-foreground">
              {t("nameEn")}
              <input
                required
                className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-2 text-sm"
                value={form.name_en}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name_en: e.target.value }))
                }
              />
            </label>
            <label className="block text-xs font-semibold text-foreground">
              {t("nameMm")}
              <input
                required
                className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-2 text-sm"
                value={form.name_mm}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name_mm: e.target.value }))
                }
              />
            </label>
          </div>

          <label className="block text-xs font-semibold text-foreground">
            {t("emojiIcon")}
            <span className="ml-1 font-normal">*</span>
            <input
              required
              maxLength={16}
              placeholder={t("emojiPlaceholder")}
              className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-2 text-sm"
              value={form.emoji_icon}
              onChange={(e) =>
                setForm((f) => ({ ...f, emoji_icon: e.target.value }))
              }
            />
            <span className="mt-1 block text-xs font-normal text-foreground">
              {t("emojiHint")}
            </span>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-foreground">
              {t("parentCategory")}
              <select
                className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-2 text-sm"
                value={form.parent_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, parent_id: e.target.value }))
                }
              >
                <option value="">{t("parentNone")}</option>
                {sorted
                  .filter((c) => c.id !== editing?.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji_icon ? `${c.emoji_icon} ` : ""}
                      {categoryBreadcrumb(categories, c.id, locale)}
                    </option>
                  ))}
              </select>
            </label>
            <label className="block text-xs font-semibold text-foreground">
              {t("sortOrder")}
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-2 text-sm"
                value={form.sort_order}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sort_order: e.target.value }))
                }
              />
            </label>
          </div>

          <label className="block text-xs font-semibold text-foreground">
            {t("slug")}
            <input
              className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-2 text-sm"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            />
          </label>

          {error ? <p className="text-sm text-sale">{error}</p> : null}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-accent-fg disabled:opacity-50"
            >
              {pending ? t("saving") : t("save")}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-md border border-border px-3 py-2 text-sm"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      ) : null}

      <div className="overflow-x-auto border border-border">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide">
            <tr>
              <th className="px-3 py-2 font-semibold">{t("emojiIcon")}</th>
              <th className="px-3 py-2 font-semibold">{t("category")}</th>
              <th className="px-3 py-2 font-semibold">{t("sortOrder")}</th>
              <th className="px-3 py-2 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-foreground">
                  {t("noCategories")}
                </td>
              </tr>
            ) : (
              sorted.map((cat) => (
                <tr key={cat.id} className="border-b border-border">
                  <td className="px-3 py-2 text-lg">{cat.emoji_icon}</td>
                  <td className="px-3 py-2">
                    <p className="font-medium text-foreground">
                      {categoryBreadcrumb(categories, cat.id, locale)}
                    </p>
                    <p className="text-xs text-foreground">
                      {categoryLabel(cat, "en")}
                    </p>
                  </td>
                  <td className="px-3 py-2 text-foreground">
                    {cat.sort_order ?? 0}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => openEdit(cat)}
                      className="text-xs font-semibold underline-offset-2 hover:underline"
                    >
                      {t("editCategory")}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
