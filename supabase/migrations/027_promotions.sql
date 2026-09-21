-- 027 — Simple promotions table (percentage codes for checkout)
-- Safe if the table already exists.

CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  discount_percentage NUMERIC(5, 2) NOT NULL
    CHECK (discount_percentage > 0 AND discount_percentage <= 100),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT promotions_code_nonempty_chk CHECK (btrim(code) <> '')
);

CREATE UNIQUE INDEX IF NOT EXISTS promotions_code_unique_ci
  ON promotions (upper(btrim(code)));

CREATE INDEX IF NOT EXISTS idx_promotions_is_active ON promotions(is_active);

COMMENT ON TABLE promotions IS
  'Simple percentage promo codes for checkout (Phase 5).';

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active promotions" ON promotions;
CREATE POLICY "Public read active promotions"
  ON promotions FOR SELECT TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "Admin manage promotions" ON promotions;
CREATE POLICY "Admin manage promotions"
  ON promotions FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
