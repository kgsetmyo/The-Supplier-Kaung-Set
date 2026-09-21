-- 024 — Ensure order_status enum matches the app
-- Fixes: invalid input value for enum order_status: "processing"
-- Safe to re-run.

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

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'order_status' AND e.enumlabel = 'pending'
  ) THEN
    ALTER TYPE order_status ADD VALUE 'pending';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'order_status' AND e.enumlabel = 'processing'
  ) THEN
    ALTER TYPE order_status ADD VALUE 'processing';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'order_status' AND e.enumlabel = 'shipped'
  ) THEN
    ALTER TYPE order_status ADD VALUE 'shipped';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'order_status' AND e.enumlabel = 'in_transit'
  ) THEN
    ALTER TYPE order_status ADD VALUE 'in_transit';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'order_status' AND e.enumlabel = 'delivered'
  ) THEN
    ALTER TYPE order_status ADD VALUE 'delivered';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'order_status' AND e.enumlabel = 'cancelled'
  ) THEN
    ALTER TYPE order_status ADD VALUE 'cancelled';
  END IF;
END $$;

-- Compare status notes as text so the trigger cannot fail on enum literal casts
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
