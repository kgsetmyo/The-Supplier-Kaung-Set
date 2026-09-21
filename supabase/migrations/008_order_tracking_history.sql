-- 008 — Order Tracking: status enum expansion, courier, status history + trigger
-- Phase 1 only (schema). Review, then run in Supabase SQL Editor.
-- Safe to re-run (idempotent guards).

-- ---------------------------------------------------------------------------
-- 1) Expand order_status enum
-- Existing (from earlier migrations): pending, processing, shipped, delivered
-- Add: in_transit, cancelled
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'order_status' AND e.enumlabel = 'in_transit'
  ) THEN
    ALTER TYPE order_status ADD VALUE 'in_transit';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'order_status' AND e.enumlabel = 'cancelled'
  ) THEN
    ALTER TYPE order_status ADD VALUE 'cancelled';
  END IF;
END $$;

-- Ensure enum type exists on a brand-new DB (no-op if already present)
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'pending',
    'processing',
    'shipped',
    'in_transit',
    'delivered',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 2) Orders table: status, courier_name, tracking_number
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tracking_number TEXT,
  courier_name TEXT,
  customer_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  status order_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'courier_name'
  ) THEN
    ALTER TABLE orders ADD COLUMN courier_name TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'tracking_number'
  ) THEN
    ALTER TABLE orders ADD COLUMN tracking_number TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'status'
  ) THEN
    ALTER TABLE orders
      ADD COLUMN status order_status NOT NULL DEFAULT 'pending';
  END IF;
END $$;

-- Unique tracking numbers when present (allows multiple NULLs)
CREATE UNIQUE INDEX IF NOT EXISTS orders_tracking_number_unique
  ON orders (tracking_number)
  WHERE tracking_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_courier_name ON orders(courier_name);

-- ---------------------------------------------------------------------------
-- 3) Tracking history (timeline)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status order_status NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id
  ON order_status_history(order_id, created_at ASC);

-- Backfill one history row for existing orders that have none
INSERT INTO order_status_history (order_id, status, note, created_at)
SELECT o.id, o.status, 'Order recorded', o.created_at
FROM orders o
WHERE NOT EXISTS (
  SELECT 1 FROM order_status_history h WHERE h.order_id = o.id
);

-- ---------------------------------------------------------------------------
-- 4) Trigger: log every status change (and initial status on insert)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_note TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO order_status_history (order_id, status, note)
    VALUES (NEW.id, NEW.status, 'Order placed');
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    v_note := CASE NEW.status::text
      WHEN 'pending' THEN 'Order placed'
      WHEN 'processing' THEN 'Order is being prepared'
      WHEN 'shipped' THEN 'Departing from seller'
      WHEN 'in_transit' THEN 'In transit with courier'
      WHEN 'delivered' THEN 'Package delivered'
      WHEN 'cancelled' THEN 'Order cancelled'
      ELSE NULL
    END;

    IF NEW.courier_name IS NOT NULL AND btrim(NEW.courier_name) <> ''
       AND NEW.status::text IN ('shipped', 'in_transit', 'delivered') THEN
      v_note := COALESCE(v_note, 'Status updated') || ' · Courier: ' || btrim(NEW.courier_name);
    END IF;

    INSERT INTO order_status_history (order_id, status, note)
    VALUES (NEW.id, NEW.status, v_note);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_order_status_change ON orders;
CREATE TRIGGER trg_log_order_status_change
  AFTER INSERT OR UPDATE OF status
  ON orders
  FOR EACH ROW
  EXECUTE FUNCTION public.log_order_status_change();

-- ---------------------------------------------------------------------------
-- RLS for order_status_history
-- ---------------------------------------------------------------------------
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Customers: read history for their own orders
DROP POLICY IF EXISTS "Users read own order status history" ON order_status_history;
CREATE POLICY "Users read own order status history"
  ON order_status_history FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

-- Admins: full write (inserts normally come from SECURITY DEFINER trigger)
DROP POLICY IF EXISTS "Admin insert order status history" ON order_status_history;
CREATE POLICY "Admin insert order status history"
  ON order_status_history FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin update order status history" ON order_status_history;
CREATE POLICY "Admin update order status history"
  ON order_status_history FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin delete order status history" ON order_status_history;
CREATE POLICY "Admin delete order status history"
  ON order_status_history FOR DELETE TO authenticated
  USING (public.is_admin());

-- Public track-by-number: extend existing RPC with courier + timeline
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
    'courier_name', o.courier_name,
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
    ), '[]'::jsonb),
    'history', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'status', h.status,
          'note', h.note,
          'created_at', h.created_at
        )
        ORDER BY h.created_at ASC
      )
      FROM order_status_history h
      WHERE h.order_id = o.id
    ), '[]'::jsonb)
  )
  INTO result
  FROM orders o
  WHERE o.tracking_number = normalized;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_order_by_tracking(text) TO anon, authenticated;
