-- 009 — Discount Coupons (Phase 1: schema + RLS only)
-- Run in Supabase SQL Editor after review.
-- Safe to re-run (idempotent guards).

-- ---------------------------------------------------------------------------
-- Enum: percentage | flat
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE discount_type AS ENUM ('percentage', 'flat');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Coupons
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  discount_type discount_type NOT NULL,
  discount_value NUMERIC(12, 2) NOT NULL
    CHECK (discount_value > 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  usage_limit INTEGER
    CHECK (usage_limit IS NULL OR usage_limit > 0),
  times_used INTEGER NOT NULL DEFAULT 0
    CHECK (times_used >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT coupons_code_nonempty_chk CHECK (btrim(code) <> ''),
  CONSTRAINT coupons_percentage_max_chk CHECK (
    discount_type <> 'percentage' OR discount_value <= 100
  ),
  CONSTRAINT coupons_usage_not_over_limit_chk CHECK (
    usage_limit IS NULL OR times_used <= usage_limit
  )
);

-- Case-insensitive unique codes (e.g. SAVE10 == save10)
CREATE UNIQUE INDEX IF NOT EXISTS coupons_code_unique_ci
  ON coupons (upper(btrim(code)));

CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_expires_at ON coupons(expires_at);

-- ---------------------------------------------------------------------------
-- Eligibility: restrict coupon to specific products and/or categories
-- At least one target must be set per row.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coupon_eligibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT coupon_eligibility_target_chk
    CHECK (product_id IS NOT NULL OR category_id IS NOT NULL),
  CONSTRAINT coupon_eligibility_unique_target
    UNIQUE NULLS NOT DISTINCT (coupon_id, product_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_coupon_eligibility_coupon
  ON coupon_eligibility(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_eligibility_product
  ON coupon_eligibility(product_id);
CREATE INDEX IF NOT EXISTS idx_coupon_eligibility_category
  ON coupon_eligibility(category_id);

-- ---------------------------------------------------------------------------
-- Optional helper: is coupon currently valid for public validation
-- (active, not expired, under usage limit)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_coupon_currently_valid(c coupons)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT
    c.is_active
    AND (c.expires_at IS NULL OR c.expires_at > now())
    AND (c.usage_limit IS NULL OR c.times_used < c.usage_limit);
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_eligibility ENABLE ROW LEVEL SECURITY;

-- Ensure admin helper exists
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Customers / anon: read active, non-expired coupons (for checkout validation)
DROP POLICY IF EXISTS "Public read active coupons" ON coupons;
CREATE POLICY "Public read active coupons"
  ON coupons FOR SELECT TO anon, authenticated
  USING (
    public.is_admin()
    OR (
      is_active = true
      AND (expires_at IS NULL OR expires_at > now())
      AND (usage_limit IS NULL OR times_used < usage_limit)
    )
  );

-- Admin write
DROP POLICY IF EXISTS "Admin insert coupons" ON coupons;
CREATE POLICY "Admin insert coupons"
  ON coupons FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin update coupons" ON coupons;
CREATE POLICY "Admin update coupons"
  ON coupons FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin delete coupons" ON coupons;
CREATE POLICY "Admin delete coupons"
  ON coupons FOR DELETE TO authenticated
  USING (public.is_admin());

-- Eligibility: public can read rules for coupons they can see;
-- admins full CRUD
DROP POLICY IF EXISTS "Public read coupon eligibility" ON coupon_eligibility;
CREATE POLICY "Public read coupon eligibility"
  ON coupon_eligibility FOR SELECT TO anon, authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM coupons c
      WHERE c.id = coupon_id
        AND c.is_active = true
        AND (c.expires_at IS NULL OR c.expires_at > now())
        AND (c.usage_limit IS NULL OR c.times_used < c.usage_limit)
    )
  );

DROP POLICY IF EXISTS "Admin insert coupon eligibility" ON coupon_eligibility;
CREATE POLICY "Admin insert coupon eligibility"
  ON coupon_eligibility FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin update coupon eligibility" ON coupon_eligibility;
CREATE POLICY "Admin update coupon eligibility"
  ON coupon_eligibility FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin delete coupon eligibility" ON coupon_eligibility;
CREATE POLICY "Admin delete coupon eligibility"
  ON coupon_eligibility FOR DELETE TO authenticated
  USING (public.is_admin());
