-- Additive migration if 001 was already applied without tracking_number

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'tracking_number'
  ) THEN
    ALTER TABLE orders ADD COLUMN tracking_number TEXT;
    UPDATE orders
    SET tracking_number = 'KS-' || upper(substr(replace(id::text, '-', ''), 1, 9))
    WHERE tracking_number IS NULL;
    ALTER TABLE orders ALTER COLUMN tracking_number SET NOT NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS orders_tracking_number_key ON orders(tracking_number);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);

CREATE OR REPLACE FUNCTION public.get_order_by_tracking(p_tracking text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  normalized text := upper(trim(p_tracking));
BEGIN
  IF normalized IS NULL OR normalized = '' THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_build_object(
    'id', o.id,
    'tracking_number', o.tracking_number,
    'status', o.status,
    'total_amount', o.total_amount,
    'created_at', o.created_at,
    'customer_name', o.customer_info->>'name',
    'customer_city', o.customer_info->>'city',
    'items', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'quantity', oi.quantity,
          'price_at_time', oi.price_at_time,
          'name_en', p.name_en,
          'name_mm', p.name_mm
        )
      )
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = o.id
    ), '[]'::jsonb)
  )
  INTO result
  FROM orders o
  WHERE o.tracking_number = normalized;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_order_by_tracking(text) TO anon, authenticated;
