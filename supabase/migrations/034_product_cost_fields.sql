-- 034 — Product internal cost fields for profit tracking
-- Prerequisites: 001 (products table)
-- Safe to re-run.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0
    CHECK (cost_price >= 0);

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS delivery_cost NUMERIC(12, 2) NOT NULL DEFAULT 0
    CHECK (delivery_cost >= 0);

COMMENT ON COLUMN products.cost_price IS
  'Internal unit cost of the product (not shown on storefront).';

COMMENT ON COLUMN products.delivery_cost IS
  'Internal per-unit delivery / logistics cost (not shown on storefront).';
