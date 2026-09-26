"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { deleteProduct } from "@/app/actions/product";
import {
  formatMoney,
  PRODUCT_AUTHENTICITY_OPTIONS,
  type Category,
  type Product,
  type ProductAuthenticity,
} from "@/types/database";
import { useRouter } from "@/i18n/navigation";
import { categoryBreadcrumb } from "@/lib/categories";
import { CategoryCascadeSelect } from "@/components/admin/CategoryCascadeSelect";

const emptyForm = {
  name_en: "",
  name_mm: "",
  description_en: "",
  description_mm: "",
  price: "",
  discount_price: "",
  image_urls: [""] as string[],
  stock_quantity: "0",
  category_id: "",
  authenticity: "Genuine" as ProductAuthenticity,
};

export function InventoryAdmin({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const router = useRouter();
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(id);
  }, [toast]);

  function openCreate() {
    setCreating(true);
    setEditing(null);
    setForm(emptyForm);
    setError(null);
  }

  function openEdit(product: Product) {
    setCreating(false);
    setEditing(product);
    const gallery =
      product.image_urls && product.image_urls.length > 0
        ? product.image_urls
        : product.image_url
          ? [product.image_url]
          : [""];
    setForm({
      name_en: product.name_en,
      name_mm: product.name_mm,
      description_en: product.description_en,
      description_mm: product.description_mm,
      price: String(product.price),
      discount_price:
        product.discount_price == null ? "" : String(product.discount_price),
      image_urls: gallery.length ? gallery : [""],
      stock_quantity: String(product.stock_quantity),
      category_id: product.category_id ?? "",
      authenticity: product.authenticity ?? "Genuine",
    });
    setError(null);
  }

  function closeForm() {
    setCreating(false);
    setEditing(null);
    setForm(emptyForm);
    setError(null);
  }

  function askDelete(product: Product) {
    setDeleteTarget(product);
    setDeleteError(null);
  }

  function closeDelete() {
    if (deleting) return;
    setDeleteTarget(null);
    setDeleteError(null);
  }

  async function confirmDelete() {
    if (!deleteTarget || deleting) return;
    const id = deleteTarget.id;
    const wasEditing = editing?.id === id;
    setDeleteError(null);
    setDeleting(true);

    try {
      const result = await deleteProduct(id);
      if (!result.ok) {
        setDeleteError(result.message || t("deleteFailed"));
        return;
      }
      setDeleteTarget(null);
      if (wasEditing) closeForm();
      setToast(t("deleteSuccess"));
      startTransition(() => router.refresh());
    } catch {
      setDeleteError(t("deleteFailed"));
    } finally {
      setDeleting(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const supabase = createClient();

    const imageUrls = form.image_urls.map((u) => u.trim()).filter(Boolean);

    const payload = {
      name_en: form.name_en.trim(),
      name_mm: form.name_mm.trim(),
      description_en: form.description_en.trim(),
      description_mm: form.description_mm.trim(),
      price: Number(form.price),
      discount_price: form.discount_price
        ? Number(form.discount_price)
        : null,
      image_url: imageUrls[0] ?? null,
      image_urls: imageUrls,
      stock_quantity: Number(form.stock_quantity),
      category_id: form.category_id || null,
      authenticity: form.authenticity,
    };

    const result = editing
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    closeForm();
    startTransition(() => router.refresh());
  }

  const showForm = creating || editing;
  const fieldClass =
    "mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-foreground";

  return (
    <div className="space-y-6">
      {toast ? (
        <div
          role="status"
          className="fixed right-4 bottom-4 z-50 max-w-sm border border-border bg-surface px-4 py-3 text-sm shadow-lg"
        >
          {toast}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("inventory")}
        </h1>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-fg"
        >
          {t("addProduct")}
        </button>
      </div>

      {showForm ? (
        <form
          onSubmit={onSubmit}
          className="grid gap-3 border border-border bg-surface p-4 sm:grid-cols-2"
        >
          <h2 className="sm:col-span-2 text-sm font-semibold tracking-wide uppercase">
            {editing ? t("editProduct") : t("addProduct")}
          </h2>
          {(
            [
              ["name_en", "nameEn"],
              ["name_mm", "nameMm"],
              ["desc_en", "descEn", "description_en"],
              ["desc_mm", "descMm", "description_mm"],
            ] as const
          ).map((tuple) => {
            const key = tuple[2] ?? (tuple[0] as keyof typeof form);
            const labelKey = tuple[1];
            const isDesc = String(key).startsWith("description");
            return (
              <label key={String(key)} className="block text-sm sm:col-span-1">
                <span>{t(labelKey)}</span>
                {isDesc ? (
                  <textarea
                    required
                    rows={3}
                    className={fieldClass}
                    value={form[key as keyof typeof form]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [key]: e.target.value }))
                    }
                  />
                ) : (
                  <input
                    required
                    className={fieldClass}
                    value={form[key as keyof typeof form]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [key]: e.target.value }))
                    }
                  />
                )}
              </label>
            );
          })}

          <div className="sm:col-span-2 space-y-1">
            <p className="text-sm font-medium">{t("category")}</p>
            <CategoryCascadeSelect
              categories={categories}
              value={form.category_id}
              onChange={(category_id) =>
                setForm((f) => ({ ...f, category_id }))
              }
            />
            {form.category_id ? (
              <p className="text-xs text-muted">
                {t("categorySelected")}:{" "}
                {categoryBreadcrumb(categories, form.category_id, locale)}
              </p>
            ) : null}
          </div>

          <label className="block text-sm sm:col-span-2">
            <span>{t("authenticity")}</span>
            <select
              required
              className={fieldClass}
              value={form.authenticity}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  authenticity: e.target.value as ProductAuthenticity,
                }))
              }
            >
              {PRODUCT_AUTHENTICITY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {t(`authenticity${opt}` as "authenticityGenuine")}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span>{t("price")}</span>
            <input
              required
              type="number"
              min={0}
              step="1"
              className={fieldClass}
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            <span>{t("discountPrice")}</span>
            <input
              type="number"
              min={0}
              step="1"
              className={fieldClass}
              value={form.discount_price}
              onChange={(e) =>
                setForm((f) => ({ ...f, discount_price: e.target.value }))
              }
            />
          </label>
          <label className="block text-sm">
            <span>{t("stock")}</span>
            <input
              required
              type="number"
              min={0}
              step="1"
              className={fieldClass}
              value={form.stock_quantity}
              onChange={(e) =>
                setForm((f) => ({ ...f, stock_quantity: e.target.value }))
              }
            />
          </label>

          <div className="sm:col-span-2 space-y-2">
            <p className="text-sm font-medium">{t("imageUrls")}</p>
            <p className="text-xs text-foreground">{t("imageUrlsHint")}</p>
            {form.image_urls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <input
                  className={fieldClass}
                  placeholder={t("imageUrlPlaceholder")}
                  value={url}
                  onChange={(e) =>
                    setForm((f) => {
                      const image_urls = [...f.image_urls];
                      image_urls[index] = e.target.value;
                      return { ...f, image_urls };
                    })
                  }
                />
                {form.image_urls.length > 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        image_urls: f.image_urls.filter((_, i) => i !== index),
                      }))
                    }
                    className="shrink-0 rounded-md border border-border px-3 text-xs font-semibold"
                  >
                    {t("removeImage")}
                  </button>
                ) : null}
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  image_urls: [...f.image_urls, ""],
                }))
              }
              className="text-sm font-semibold underline underline-offset-4"
            >
              {t("addImage")}
            </button>
          </div>

          {error ? (
            <p className="sm:col-span-2 text-sm text-sale">{error}</p>
          ) : null}

          <div className="sm:col-span-2 flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg disabled:opacity-50"
            >
              {pending ? t("saving") : t("save")}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-md border border-border px-4 py-2 text-sm"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      ) : null}

      <div className="overflow-x-auto border border-border bg-surface">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border bg-background text-xs tracking-wide text-muted uppercase">
            <tr>
              <th className="px-3 py-2 font-medium">{t("productColumn")}</th>
              <th className="px-3 py-2 font-medium">{t("category")}</th>
              <th className="px-3 py-2 font-medium">{t("authenticity")}</th>
              <th className="px-3 py-2 font-medium">{t("price")}</th>
              <th className="px-3 py-2 font-medium">{t("stock")}</th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-border last:border-0">
                <td className="px-3 py-3">
                  <p className="font-medium">
                    {locale === "mm" ? product.name_mm : product.name_en}
                  </p>
                  <p className="text-xs text-muted">{product.name_en}</p>
                </td>
                <td className="px-3 py-3 text-muted">
                  {categoryBreadcrumb(
                    categories,
                    product.category_id,
                    locale
                  )}
                </td>
                <td className="px-3 py-3 text-muted">
                  {t(
                    `authenticity${product.authenticity ?? "Genuine"}` as
                      | "authenticityGenuine"
                  )}
                </td>
                <td className="px-3 py-3">
                  {formatMoney(product.price)}
                  {product.discount_price != null ? (
                    <span className="ml-2 text-muted">
                      → {formatMoney(product.discount_price)}
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-3">
                  <StockStatusBadge quantity={product.stock_quantity} />
                </td>
                <td className="px-3 py-3 text-right">
                  <div className="flex flex-wrap items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => openEdit(product)}
                      className="text-sm underline underline-offset-4"
                    >
                      {t("editProduct")}
                    </button>
                    <button
                      type="button"
                      onClick={() => askDelete(product)}
                      className="rounded-md px-2 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      {t("deleteProduct")}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteTarget ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-product-title"
        >
          <div className="w-full max-w-md border border-border bg-surface p-5 shadow-lg">
            <h2
              id="delete-product-title"
              className="text-lg font-semibold tracking-tight"
            >
              {t("deleteConfirmTitle")}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {t("deleteConfirmBody", {
                name:
                  locale === "mm"
                    ? deleteTarget.name_mm
                    : deleteTarget.name_en,
              })}
            </p>
            {deleteError ? (
              <p className="mt-3 text-sm text-sale">{deleteError}</p>
            ) : null}
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={closeDelete}
                disabled={deleting}
                className="rounded-md border border-border px-4 py-2 text-sm disabled:opacity-50"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={() => void confirmDelete()}
                disabled={deleting}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? t("deleting") : t("deleteConfirm")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StockStatusBadge({ quantity }: { quantity: number }) {
  const t = useTranslations("admin");
  if (quantity <= 0) {
    return (
      <span className="inline-flex items-center rounded border border-sale/40 bg-sale/10 px-2 py-0.5 text-xs font-semibold text-sale">
        {t("stockOut")}
      </span>
    );
  }
  if (quantity <= 5) {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-amber-600/40 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
        {t("stockLow")}
        <span className="font-normal">({quantity})</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded border border-emerald-700/30 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">
      {t("stockOk")}
      <span className="font-normal">({quantity})</span>
    </span>
  );
}
