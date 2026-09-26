-- 032 — Keep profile loyalty ranks in sync with spend + tier thresholds
-- Prerequisites: 007 (loyalty_tiers, profiles.lifetime_spend, resolve_loyalty_tier)
-- Safe to re-run.

-- Prefer a real base tier for spend below every threshold (e.g. Member @ 0).
UPDATE loyalty_tiers
SET spend_threshold = 0,
    updated_at = now()
WHERE lower(tier_name) = 'member'
  AND spend_threshold > 0;

-- Resolve: highest qualifying tier, else lowest-threshold tier (base).
CREATE OR REPLACE FUNCTION public.resolve_loyalty_tier(p_spend NUMERIC)
RETURNS loyalty_tiers
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier loyalty_tiers%ROWTYPE;
BEGIN
  SELECT t.*
  INTO v_tier
  FROM loyalty_tiers t
  WHERE t.spend_threshold <= COALESCE(p_spend, 0)
  ORDER BY t.spend_threshold DESC, t.sort_order DESC
  LIMIT 1;

  IF FOUND THEN
    RETURN v_tier;
  END IF;

  SELECT t.*
  INTO v_tier
  FROM loyalty_tiers t
  ORDER BY t.spend_threshold ASC, t.sort_order ASC
  LIMIT 1;

  RETURN v_tier;
END;
$$;

-- Recompute every profile's loyalty_tier_id / loyalty_tier from lifetime_spend.
CREATE OR REPLACE FUNCTION public.sync_all_loyalty_tiers()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
  v_tier loyalty_tiers%ROWTYPE;
  v_count INTEGER := 0;
BEGIN
  FOR r IN
    SELECT id, lifetime_spend FROM profiles
  LOOP
    SELECT * INTO v_tier FROM public.resolve_loyalty_tier(r.lifetime_spend);
    IF v_tier.id IS NOT NULL THEN
      UPDATE profiles
      SET
        loyalty_tier_id = v_tier.id,
        loyalty_tier = v_tier.tier_name
      WHERE id = r.id
        AND (
          loyalty_tier_id IS DISTINCT FROM v_tier.id
          OR loyalty_tier IS DISTINCT FROM v_tier.tier_name
        );
      IF FOUND THEN
        v_count := v_count + 1;
      END IF;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_all_loyalty_tiers() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_all_loyalty_tiers() TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_all_loyalty_tiers() TO service_role;

-- One-shot backfill for existing accounts (e.g. stuck on Elite with 0 spend).
SELECT public.sync_all_loyalty_tiers();
