-- 033 — Guest checkout: create order via SECURITY DEFINER RPC
-- Problem: anon can INSERT orders (user_id IS NULL) but cannot SELECT them,
-- so PostgREST `.insert().select()` fails with RLS. order_items EXISTS()
-- checks also need SELECT on orders.
-- Fix: one RPC that inserts order + items and returns ids (bypasses RLS safely).
-- Safe to re-run.

CREATE OR REPLACE FUNCTION public.create_storefront_order(
  p_customer_info JSONB,
  p_items JSONB,
  p_total_amount NUMERIC,
  p_payment_method TEXT,
  p_payment_plan TEXT DEFAULT 'full',
  p_payment_screenshot_url TEXT DEFAULT NULL,
  p_payment_reference TEXT DEFAULT NULL,
  p_coupon_id UUID DEFAULT NULL,
  p_discount_applied NUMERIC DEFAULT 0,
  p_tracking_number TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_tracking TEXT;
  v_order_id UUID;
  v_item JSONB;
  v_product_id UUID;
  v_qty INTEGER;
  v_price NUMERIC;
  v_count INTEGER := 0;
BEGIN
  IF p_customer_info IS NULL OR jsonb_typeof(p_customer_info) <> 'object' THEN
    RAISE EXCEPTION 'customer_info is required';
  END IF;

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'At least one order item is required';
  END IF;

  IF p_total_amount IS NULL OR p_total_amount < 0 THEN
    RAISE EXCEPTION 'Invalid total_amount';
  END IF;

  IF p_payment_method IS NULL OR btrim(p_payment_method) = '' THEN
    RAISE EXCEPTION 'payment_method is required';
  END IF;

  v_tracking := NULLIF(btrim(COALESCE(p_tracking_number, '')), '');
  IF v_tracking IS NULL THEN
    v_tracking := 'TS' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
  END IF;

  INSERT INTO orders (
    user_id,
    tracking_number,
    customer_info,
    total_amount,
    status,
    payment_method,
    payment_plan,
    payment_screenshot_url,
    payment_reference,
    payment_status,
    coupon_id,
    discount_applied
  )
  VALUES (
    v_user_id,
    v_tracking,
    p_customer_info,
    p_total_amount,
    'pending',
    p_payment_method,
    COALESCE(NULLIF(btrim(p_payment_plan), ''), 'full'),
    p_payment_screenshot_url,
    NULLIF(btrim(COALESCE(p_payment_reference, '')), ''),
    'pending',
    p_coupon_id,
    GREATEST(COALESCE(p_discount_applied, 0), 0)
  )
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := NULLIF(v_item->>'product_id', '')::UUID;
    v_qty := COALESCE((v_item->>'quantity')::INTEGER, 0);
    v_price := COALESCE((v_item->>'price_at_time')::NUMERIC, 0);

    IF v_product_id IS NULL OR v_qty <= 0 OR v_price < 0 THEN
      RAISE EXCEPTION 'Invalid order item payload';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM products p WHERE p.id = v_product_id) THEN
      RAISE EXCEPTION 'Product not available: %', v_product_id;
    END IF;

    INSERT INTO order_items (order_id, product_id, quantity, price_at_time)
    VALUES (v_order_id, v_product_id, v_qty, v_price);

    v_count := v_count + 1;
  END LOOP;

  IF v_count = 0 THEN
    RAISE EXCEPTION 'No order items inserted';
  END IF;

  IF p_coupon_id IS NOT NULL THEN
    BEGIN
      PERFORM public.increment_coupon_usage(p_coupon_id);
    EXCEPTION
      WHEN undefined_function THEN
        NULL;
    END;
  END IF;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'tracking_number', v_tracking
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_storefront_order(
  JSONB, JSONB, NUMERIC, TEXT, TEXT, TEXT, TEXT, UUID, NUMERIC, TEXT
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_storefront_order(
  JSONB, JSONB, NUMERIC, TEXT, TEXT, TEXT, TEXT, UUID, NUMERIC, TEXT
) TO anon, authenticated;

COMMENT ON FUNCTION public.create_storefront_order IS
  'Guest + signed-in checkout: inserts orders + order_items under SECURITY DEFINER so anon RLS cannot block RETURNING/select.';

-- Ensure base insert policies still exist (authenticated path / tooling)
DROP POLICY IF EXISTS "Anyone insert orders" ON orders;
CREATE POLICY "Anyone insert orders"
  ON orders FOR INSERT TO anon, authenticated
  WITH CHECK (
    user_id IS NULL
    OR user_id = auth.uid()
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Anyone insert order items" ON order_items;
CREATE POLICY "Anyone insert order items"
  ON order_items FOR INSERT TO anon, authenticated
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id
        AND (o.user_id IS NULL OR o.user_id = auth.uid())
    )
  );
