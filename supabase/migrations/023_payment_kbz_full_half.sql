-- 023 — Payment methods: Full / Half KBZ Pay (no new COD orders)
-- Keep legacy 'cod' and 'kbz_pay' for historical rows.

ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_payment_method_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_payment_method_check
  CHECK (
    payment_method IS NULL
    OR payment_method IN ('cod', 'kbz_pay', 'kbz_full', 'kbz_half')
  );

COMMENT ON COLUMN orders.payment_method IS
  'kbz_full | kbz_half (new). Legacy: cod | kbz_pay';
