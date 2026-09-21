-- 014 — Product authenticity (Genuine / OEM / Replica)
-- Prerequisites: 001 (products table)
-- Safe to re-run.

DO $$ BEGIN
  CREATE TYPE public.product_authenticity AS ENUM ('Genuine', 'OEM', 'Replica');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS authenticity public.product_authenticity;

-- Existing rows default to Genuine; new inserts also default to Genuine
UPDATE products
SET authenticity = 'Genuine'
WHERE authenticity IS NULL;

ALTER TABLE products
  ALTER COLUMN authenticity SET DEFAULT 'Genuine'::public.product_authenticity;

ALTER TABLE products
  ALTER COLUMN authenticity SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_products_authenticity
  ON products (authenticity);

COMMENT ON COLUMN products.authenticity IS
  'Product authenticity: Genuine | OEM | Replica. Used by storefront search filters.';
