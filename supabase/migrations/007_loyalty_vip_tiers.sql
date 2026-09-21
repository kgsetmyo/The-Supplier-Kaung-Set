-- 007 — Customer Loyalty & VIP Tier system (Phase 1: schema only)
-- Run in Supabase SQL Editor after reviewing.
-- Thresholds / discount % below are PLACEHOLDERS — edit via loyalty_tiers later.

-- ---------------------------------------------------------------------------
-- Supporting catalogs (needed for tier discount eligibility rules)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_mm TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_mm TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Optional FKs on products for Phase 3 pricing (nullable, non-breaking)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE products
      ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'brand_id'
  ) THEN
    ALTER TABLE products
      ADD COLUMN brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);

-- ---------------------------------------------------------------------------
-- Loyalty tiers configuration (editable placeholders)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS loyalty_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name TEXT NOT NULL UNIQUE,
  spend_threshold NUMERIC(14, 2) NOT NULL DEFAULT 0
    CHECK (spend_threshold >= 0),
  discount_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0
    CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Which categories / brands a tier discount applies to
-- At least one of category_id or brand_id must be set.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS loyalty_discount_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_id UUID NOT NULL REFERENCES loyalty_tiers(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT loyalty_discount_rules_target_chk
    CHECK (category_id IS NOT NULL OR brand_id IS NOT NULL),
  CONSTRAINT loyalty_discount_rules_unique_target
    UNIQUE NULLS NOT DISTINCT (tier_id, category_id, brand_id)
);

CREATE INDEX IF NOT EXISTS idx_loyalty_discount_rules_tier ON loyalty_discount_rules(tier_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_discount_rules_category ON loyalty_discount_rules(category_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_discount_rules_brand ON loyalty_discount_rules(brand_id);

-- ---------------------------------------------------------------------------
-- Profiles: lifetime spend + current tier
-- ---------------------------------------------------------------------------
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS lifetime_spend NUMERIC(14, 2) NOT NULL DEFAULT 0
    CHECK (lifetime_spend >= 0);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'loyalty_tier_id'
  ) THEN
    ALTER TABLE profiles
      ADD COLUMN loyalty_tier_id UUID REFERENCES loyalty_tiers(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Denormalized label for convenience / reporting (kept in sync by trigger)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS loyalty_tier TEXT NOT NULL DEFAULT 'Elite';

CREATE INDEX IF NOT EXISTS idx_profiles_loyalty_tier_id ON profiles(loyalty_tier_id);
CREATE INDEX IF NOT EXISTS idx_profiles_lifetime_spend ON profiles(lifetime_spend);

-- Prevent double-counting the same order toward lifetime spend
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS loyalty_counted BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_orders_loyalty_counted ON orders(loyalty_counted)
  WHERE loyalty_counted = false;

-- ---------------------------------------------------------------------------
-- Seed placeholder tiers (thresholds & % are temporary)
-- Elite < Master < VIP < VIP 1 < VIP 2 < VIP 3 < VVIP
-- ---------------------------------------------------------------------------
INSERT INTO loyalty_tiers (id, tier_name, spend_threshold, discount_percentage, sort_order)
VALUES
  ('a1000000-0000-4000-8000-000000000001', 'Elite',  0,       0,  1),
  ('a1000000-0000-4000-8000-000000000002', 'Master', 100000,  3,  2),
  ('a1000000-0000-4000-8000-000000000003', 'VIP',    300000,  5,  3),
  ('a1000000-0000-4000-8000-000000000004', 'VIP 1',  600000,  7,  4),
  ('a1000000-0000-4000-8000-000000000005', 'VIP 2',  1000000, 10, 5),
  ('a1000000-0000-4000-8000-000000000006', 'VIP 3',  2000000, 12, 6),
  ('a1000000-0000-4000-8000-000000000007', 'VVIP',   5000000, 15, 7)
ON CONFLICT (tier_name) DO UPDATE SET
  spend_threshold = EXCLUDED.spend_threshold,
  discount_percentage = EXCLUDED.discount_percentage,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- Default all existing profiles to Elite if unset
UPDATE profiles p
SET
  loyalty_tier_id = COALESCE(
    p.loyalty_tier_id,
    (SELECT id FROM loyalty_tiers WHERE tier_name = 'Elite' LIMIT 1)
  ),
  loyalty_tier = COALESCE(NULLIF(p.loyalty_tier, ''), 'Elite')
WHERE p.loyalty_tier_id IS NULL OR p.loyalty_tier IS NULL OR p.loyalty_tier = '';

-- ---------------------------------------------------------------------------
-- Resolve the highest tier a spend amount qualifies for
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.resolve_loyalty_tier(p_spend NUMERIC)
RETURNS loyalty_tiers
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t.*
  FROM loyalty_tiers t
  WHERE t.spend_threshold <= COALESCE(p_spend, 0)
  ORDER BY t.spend_threshold DESC, t.sort_order DESC
  LIMIT 1;
$$;

-- ---------------------------------------------------------------------------
-- On delivered order: add total_amount to lifetime_spend and refresh tier
-- Fires only once per order (loyalty_counted guard)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.apply_order_to_lifetime_spend()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_spend NUMERIC(14, 2);
  v_tier loyalty_tiers%ROWTYPE;
BEGIN
  IF NEW.status IS DISTINCT FROM 'delivered' THEN
    RETURN NEW;
  END IF;

  IF NEW.user_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF COALESCE(NEW.loyalty_counted, false) IS TRUE THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status IS NOT DISTINCT FROM 'delivered'
     AND COALESCE(OLD.loyalty_counted, false) IS TRUE THEN
    RETURN NEW;
  END IF;

  UPDATE profiles
  SET lifetime_spend = lifetime_spend + COALESCE(NEW.total_amount, 0)
  WHERE id = NEW.user_id
  RETURNING lifetime_spend INTO v_spend;

  SELECT * INTO v_tier FROM public.resolve_loyalty_tier(v_spend);

  IF FOUND THEN
    UPDATE profiles
    SET
      loyalty_tier_id = v_tier.id,
      loyalty_tier = v_tier.tier_name
    WHERE id = NEW.user_id;
  END IF;

  NEW.loyalty_counted := true;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_lifetime_spend ON orders;
CREATE TRIGGER trg_orders_lifetime_spend
  BEFORE INSERT OR UPDATE OF status, total_amount, user_id
  ON orders
  FOR EACH ROW
  EXECUTE FUNCTION public.apply_order_to_lifetime_spend();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_discount_rules ENABLE ROW LEVEL SECURITY;

-- Public read catalogs + tier config (needed for storefront pricing later)
DROP POLICY IF EXISTS "Public read categories" ON categories;
CREATE POLICY "Public read categories"
  ON categories FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin write categories" ON categories;
CREATE POLICY "Admin write categories"
  ON categories FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public read brands" ON brands;
CREATE POLICY "Public read brands"
  ON brands FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin write brands" ON brands;
CREATE POLICY "Admin write brands"
  ON brands FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public read loyalty tiers" ON loyalty_tiers;
CREATE POLICY "Public read loyalty tiers"
  ON loyalty_tiers FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin write loyalty tiers" ON loyalty_tiers;
CREATE POLICY "Admin write loyalty tiers"
  ON loyalty_tiers FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public read loyalty discount rules" ON loyalty_discount_rules;
CREATE POLICY "Public read loyalty discount rules"
  ON loyalty_discount_rules FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin write loyalty discount rules" ON loyalty_discount_rules;
CREATE POLICY "Admin write loyalty discount rules"
  ON loyalty_discount_rules FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Ensure is_admin() exists (from earlier migrations)
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
