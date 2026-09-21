-- 013 — loyalty_tier_categories (VIP tier ↔ eligible categories)
-- Prerequisites: 007 (loyalty_tiers, loyalty_discount_rules), 011 (hierarchical categories)
--
-- Purpose:
--   Restrict each loyalty tier's discount % to specific categories.
--   Parent category rows include all descendants at query time via
--   public.category_matches_rule(product_category_id, rule_category_id)
--   or public.category_descendant_ids(rule_category_id).
--
-- App convention (enforced in pricing code, not DB):
--   • 0 rows for a tier  → discount applies to ALL products (unrestricted)
--   • 1+ rows for a tier → product.category_id must match a selected category
--                          OR any of its descendants
--
-- Note: loyalty_discount_rules (007) remains for brand-based rules.
--       Category eligibility for the admin UI should use THIS table going forward.

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS loyalty_tier_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_id UUID NOT NULL REFERENCES loyalty_tiers(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT loyalty_tier_categories_unique UNIQUE (tier_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_loyalty_tier_categories_tier
  ON loyalty_tier_categories(tier_id);

CREATE INDEX IF NOT EXISTS idx_loyalty_tier_categories_category
  ON loyalty_tier_categories(category_id);

COMMENT ON TABLE loyalty_tier_categories IS
  'Categories eligible for a loyalty tier discount. Parent nodes imply descendants.';

-- ---------------------------------------------------------------------------
-- Backfill from legacy loyalty_discount_rules (category rows only)
-- ---------------------------------------------------------------------------
INSERT INTO loyalty_tier_categories (tier_id, category_id)
SELECT DISTINCT r.tier_id, r.category_id
FROM loyalty_discount_rules r
WHERE r.category_id IS NOT NULL
ON CONFLICT (tier_id, category_id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- RLS (mirror loyalty_discount_rules: public read, admin write)
-- ---------------------------------------------------------------------------
ALTER TABLE loyalty_tier_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read loyalty tier categories" ON loyalty_tier_categories;
CREATE POLICY "Public read loyalty tier categories"
  ON loyalty_tier_categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin write loyalty tier categories" ON loyalty_tier_categories;
CREATE POLICY "Admin write loyalty tier categories"
  ON loyalty_tier_categories
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- Optional helper: does this product category qualify for this tier?
-- (Uses hierarchical match from 011)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.tier_category_eligible(
  p_tier_id UUID,
  p_product_category_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    -- Unrestricted tier (no category rows) → eligible
    NOT EXISTS (
      SELECT 1 FROM loyalty_tier_categories ltc
      WHERE ltc.tier_id = p_tier_id
    )
    OR (
      p_product_category_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM loyalty_tier_categories ltc
        WHERE ltc.tier_id = p_tier_id
          AND public.category_matches_rule(p_product_category_id, ltc.category_id)
      )
    );
$$;

GRANT EXECUTE ON FUNCTION public.tier_category_eligible(UUID, UUID) TO anon, authenticated;

COMMENT ON FUNCTION public.tier_category_eligible(UUID, UUID) IS
  'True if product category is under any category linked to the tier, or tier has no category links (unrestricted).';
