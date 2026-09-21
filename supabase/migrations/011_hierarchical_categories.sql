-- 011 — Hierarchical categories (self-referencing taxonomy)
-- Prerequisites: 007 (categories table + products.category_id)
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE patterns.
--
-- Structure:
--   categories.parent_id  → categories(id)   (NULL = root / Level 1)
--   Max depth: 4 levels (root = depth 1)
--   Products still store a single category_id (prefer deepest leaf)

-- ---------------------------------------------------------------------------
-- Columns
-- ---------------------------------------------------------------------------
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE CASCADE;

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS slug TEXT;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'categories_no_self_parent'
  ) THEN
    ALTER TABLE categories
      ADD CONSTRAINT categories_no_self_parent
      CHECK (parent_id IS DISTINCT FROM id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(parent_id, sort_order);

-- Sibling names must be unique (roots share a synthetic parent key)
CREATE UNIQUE INDEX IF NOT EXISTS categories_sibling_name_en_uidx
  ON categories (
    (COALESCE(parent_id, '00000000-0000-0000-0000-000000000000'::uuid)),
    lower(name_en)
  );

CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_uidx
  ON categories (slug)
  WHERE slug IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Depth helpers (root = 1, deepest allowed = 4)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.category_depth(p_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  WITH RECURSIVE climb AS (
    SELECT id, parent_id, 1 AS depth
    FROM categories
    WHERE id = p_id
    UNION ALL
    SELECT c.id, c.parent_id, climb.depth + 1
    FROM categories c
    INNER JOIN climb ON c.id = climb.parent_id
  )
  SELECT COALESCE(MAX(depth), 0) FROM climb;
$$;

CREATE OR REPLACE FUNCTION public.enforce_category_hierarchy()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_depth INTEGER;
  v_ancestor UUID;
BEGIN
  IF NEW.parent_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.parent_id = NEW.id THEN
    RAISE EXCEPTION 'Category cannot be its own parent';
  END IF;

  -- Cycle check: walk ancestors of the new parent; NEW.id must not appear
  v_ancestor := NEW.parent_id;
  WHILE v_ancestor IS NOT NULL LOOP
    IF v_ancestor = NEW.id THEN
      RAISE EXCEPTION 'Category hierarchy cycle detected';
    END IF;
    SELECT parent_id INTO v_ancestor FROM categories WHERE id = v_ancestor;
  END LOOP;

  v_depth := public.category_depth(NEW.parent_id) + 1;
  IF v_depth > 4 THEN
    RAISE EXCEPTION 'Category depth may not exceed 4 levels (attempted depth %)', v_depth;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_category_hierarchy ON categories;
CREATE TRIGGER trg_enforce_category_hierarchy
  BEFORE INSERT OR UPDATE OF parent_id ON categories
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_category_hierarchy();

-- ---------------------------------------------------------------------------
-- Descendant / ancestor helpers (coupons, loyalty, storefront filters)
-- ---------------------------------------------------------------------------

-- Root itself + every nested child (any depth)
CREATE OR REPLACE FUNCTION public.category_descendant_ids(p_root_id UUID)
RETURNS TABLE (id UUID)
LANGUAGE sql
STABLE
AS $$
  WITH RECURSIVE tree AS (
    SELECT c.id
    FROM categories c
    WHERE c.id = p_root_id
    UNION ALL
    SELECT child.id
    FROM categories child
    INNER JOIN tree ON child.parent_id = tree.id
  )
  SELECT tree.id FROM tree;
$$;

-- Leaf → root chain (includes the starting node)
CREATE OR REPLACE FUNCTION public.category_ancestor_ids(p_id UUID)
RETURNS TABLE (id UUID)
LANGUAGE sql
STABLE
AS $$
  WITH RECURSIVE climb AS (
    SELECT c.id, c.parent_id
    FROM categories c
    WHERE c.id = p_id
    UNION ALL
    SELECT p.id, p.parent_id
    FROM categories p
    INNER JOIN climb ON p.id = climb.parent_id
  )
  SELECT climb.id FROM climb;
$$;

-- True when product_category is the rule category OR nested under it
CREATE OR REPLACE FUNCTION public.category_matches_rule(
  p_product_category_id UUID,
  p_rule_category_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT
    p_product_category_id IS NOT NULL
    AND p_rule_category_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.category_descendant_ids(p_rule_category_id) d
      WHERE d.id = p_product_category_id
    );
$$;

GRANT EXECUTE ON FUNCTION public.category_depth(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.category_descendant_ids(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.category_ancestor_ids(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.category_matches_rule(UUID, UUID) TO anon, authenticated;

COMMENT ON COLUMN categories.parent_id IS
  'NULL = Level 1 root. Self-FK for nested taxonomy (max depth 4).';
COMMENT ON FUNCTION public.category_descendant_ids(UUID) IS
  'Returns root id + all nested descendants — use for parent-category discounts/coupons.';
COMMENT ON FUNCTION public.category_matches_rule(UUID, UUID) IS
  'Whether a product category_id falls under a coupon/loyalty rule category (inclusive).';
