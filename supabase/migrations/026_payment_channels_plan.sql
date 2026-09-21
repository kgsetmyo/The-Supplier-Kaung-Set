-- 026 — KBZ Pay / Banking / Special channels + full/half plan
-- Prerequisites: 023

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_plan TEXT;

COMMENT ON COLUMN orders.payment_plan IS
  'full | half — deposit structure for KBZ channels';

-- Backfill legacy full/half method values into channel + plan
UPDATE orders
SET
  payment_plan = 'full',
  payment_method = 'kbz_pay'
WHERE payment_method = 'kbz_full';

UPDATE orders
SET
  payment_plan = 'half',
  payment_method = 'kbz_pay'
WHERE payment_method = 'kbz_half';

UPDATE orders
SET payment_plan = 'full'
WHERE payment_method IN ('kbz_pay', 'kbz_banking', 'kbz_special')
  AND (payment_plan IS NULL OR btrim(payment_plan) = '');

ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_payment_plan_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_payment_plan_check
  CHECK (
    payment_plan IS NULL
    OR payment_plan IN ('full', 'half')
  );

ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_payment_method_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_payment_method_check
  CHECK (
    payment_method IS NULL
    OR payment_method IN (
      'cod',
      'kbz_pay',
      'kbz_banking',
      'kbz_special',
      'kbz_full',
      'kbz_half'
    )
  );

COMMENT ON COLUMN orders.payment_method IS
  'kbz_pay | kbz_banking | kbz_special (channels). Legacy: cod | kbz_full | kbz_half';
