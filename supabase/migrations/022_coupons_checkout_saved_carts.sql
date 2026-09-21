-- 022 — Checkout coupons extras + saved carts (abandoned cart recovery)
-- Prerequisites: 009 (coupons), 001 (orders, profiles)

-- ---------------------------------------------------------------------------
-- Coupons: optional minimum spend
-- ---------------------------------------------------------------------------
ALTER TABLE coupons
  ADD COLUMN IF NOT EXISTS min_spend NUMERIC(12, 2)
    CHECK (min_spend IS NULL OR min_spend >= 0);

COMMENT ON COLUMN coupons.min_spend IS
  'Optional minimum merchandise subtotal (MMK) required before coupon applies.';

-- ---------------------------------------------------------------------------
-- Orders: track applied promo
-- ---------------------------------------------------------------------------
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS discount_applied NUMERIC(12, 2) NOT NULL DEFAULT 0
    CHECK (discount_applied >= 0);

CREATE INDEX IF NOT EXISTS idx_orders_coupon_id ON orders(coupon_id);

COMMENT ON COLUMN orders.coupon_id IS 'Promo code applied at checkout (nullable).';
COMMENT ON COLUMN orders.discount_applied IS 'Coupon discount amount in MMK deducted from merchandise.';

-- ---------------------------------------------------------------------------
-- Saved carts (synced from storefront for abandoned-cart follow-up)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS saved_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS saved_cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES saved_carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT saved_cart_items_unique UNIQUE (cart_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_carts_updated_at ON saved_carts(updated_at);
CREATE INDEX IF NOT EXISTS idx_saved_cart_items_cart ON saved_cart_items(cart_id);

ALTER TABLE saved_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own saved carts" ON saved_carts;
CREATE POLICY "Users manage own saved carts"
  ON saved_carts FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Users manage own saved cart items" ON saved_cart_items;
CREATE POLICY "Users manage own saved cart items"
  ON saved_cart_items FOR ALL TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM saved_carts c
      WHERE c.id = cart_id AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM saved_carts c
      WHERE c.id = cart_id AND c.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admin read saved carts" ON saved_carts;
CREATE POLICY "Admin read saved carts"
  ON saved_carts FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin read saved cart items" ON saved_cart_items;
CREATE POLICY "Admin read saved cart items"
  ON saved_cart_items FOR SELECT TO authenticated
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- Increment coupon usage after a successful checkout (SECURITY DEFINER)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(p_coupon_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_rows INTEGER;
BEGIN
  UPDATE coupons
  SET
    times_used = times_used + 1,
    updated_at = now()
  WHERE id = p_coupon_id
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND (usage_limit IS NULL OR times_used < usage_limit);

  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  RETURN updated_rows > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_coupon_usage(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_coupon_usage(UUID) TO authenticated;
