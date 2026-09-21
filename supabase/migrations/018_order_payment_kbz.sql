-- 018 — Order payment method + KBZ Pay receipt fields + storage bucket
-- Prerequisites: 001 (orders table)

-- Payment method: cash on delivery | KBZ Pay
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_method TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'payment_screenshot_url'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_screenshot_url TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'payment_reference'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_reference TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'pending';
  END IF;
END $$;

ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_payment_method_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_payment_method_check
  CHECK (
    payment_method IS NULL
    OR payment_method IN ('cod', 'kbz_pay')
  );

ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_payment_status_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_payment_status_check
  CHECK (payment_status IN ('pending', 'verified'));

COMMENT ON COLUMN orders.payment_method IS 'cod | kbz_pay';
COMMENT ON COLUMN orders.payment_screenshot_url IS 'Public URL of KBZ Pay receipt in payment_receipts bucket';
COMMENT ON COLUMN orders.payment_reference IS 'Optional KBZ Pay transaction reference number';
COMMENT ON COLUMN orders.payment_status IS 'pending until admin verifies KBZ payment; COD stays pending until delivery';

CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Storage bucket for payment receipts (public read for admin/order links)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment_receipts',
  'payment_receipts',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Anyone upload payment receipts" ON storage.objects;
CREATE POLICY "Anyone upload payment receipts"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'payment_receipts');

DROP POLICY IF EXISTS "Public read payment receipts" ON storage.objects;
CREATE POLICY "Public read payment receipts"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'payment_receipts');
