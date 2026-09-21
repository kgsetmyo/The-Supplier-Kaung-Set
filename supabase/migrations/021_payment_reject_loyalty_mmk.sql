-- 021 — Payment reject status + clarify Member / Elite / VVIP MMK thresholds
-- Prerequisites: 007 (loyalty), 018 (payment_status)

-- Allow rejected payment status for KBZ admin workflow
ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_payment_status_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_payment_status_check
  CHECK (payment_status IN ('pending', 'verified', 'rejected'));

COMMENT ON COLUMN orders.payment_status IS
  'pending | verified | rejected (KBZ Pay admin verification)';

-- Ensure core storefront tiers exist with MMK thresholds
-- Member: entry · Elite: Ks 500,000 · VVIP: Ks 2,000,000
INSERT INTO loyalty_tiers (id, tier_name, spend_threshold, discount_percentage, sort_order)
VALUES
  ('a1000000-0000-4000-8000-000000000010', 'Member', 0,        0,  0),
  ('a1000000-0000-4000-8000-000000000001', 'Elite',  500000,   5,  10),
  ('a1000000-0000-4000-8000-000000000007', 'VVIP',   2000000, 15,  100)
ON CONFLICT (id) DO UPDATE SET
  tier_name = EXCLUDED.tier_name,
  spend_threshold = EXCLUDED.spend_threshold,
  discount_percentage = EXCLUDED.discount_percentage,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- Also upsert by name if IDs already differ
INSERT INTO loyalty_tiers (tier_name, spend_threshold, discount_percentage, sort_order)
VALUES
  ('Member', 0, 0, 0)
ON CONFLICT (tier_name) DO UPDATE SET
  spend_threshold = EXCLUDED.spend_threshold,
  discount_percentage = EXCLUDED.discount_percentage,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

UPDATE loyalty_tiers
SET spend_threshold = 500000, discount_percentage = 5, sort_order = 10, updated_at = now()
WHERE tier_name = 'Elite';

UPDATE loyalty_tiers
SET spend_threshold = 2000000, discount_percentage = 15, sort_order = 100, updated_at = now()
WHERE tier_name = 'VVIP';

-- Default brand-new profiles without a tier to Member
UPDATE profiles
SET
  loyalty_tier_id = COALESCE(
    loyalty_tier_id,
    (SELECT id FROM loyalty_tiers WHERE tier_name = 'Member' LIMIT 1)
  ),
  loyalty_tier = CASE
    WHEN loyalty_tier IS NULL OR loyalty_tier = '' OR loyalty_tier = 'Elite'
      THEN COALESCE(
        (SELECT tier_name FROM loyalty_tiers t WHERE t.id = profiles.loyalty_tier_id),
        'Member'
      )
    ELSE loyalty_tier
  END
WHERE loyalty_tier_id IS NULL;
