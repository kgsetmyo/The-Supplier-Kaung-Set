-- 031 — Soft-unlist products that appear in past orders
-- Hard delete remains for products with no order_items rows.
-- Safe to re-run.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN products.is_active IS
  'When false, product is hidden from the storefront but kept for order history.';

CREATE INDEX IF NOT EXISTS idx_products_is_active
  ON products (is_active)
  WHERE is_active = true;
