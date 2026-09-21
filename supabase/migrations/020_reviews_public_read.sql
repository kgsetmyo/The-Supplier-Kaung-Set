-- 020 — Storefront reviews: public read + display fields
-- Prerequisites: 019_wishlists_reviews_gallery.sql

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS reviewer_name TEXT;

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS reviewer_email TEXT;

COMMENT ON COLUMN reviews.reviewer_name IS
  'Display name captured at submit time (avoids joining auth.users on storefront).';
COMMENT ON COLUMN reviews.reviewer_email IS
  'Email captured at submit time for storefront display (may be masked later).';

-- Allow order_id to be optional when purchase linkage is unavailable
ALTER TABLE reviews
  ALTER COLUMN order_id DROP NOT NULL;

-- Public can read all reviews (storefront product pages)
DROP POLICY IF EXISTS "Users read own reviews" ON reviews;
DROP POLICY IF EXISTS "Public read reviews" ON reviews;
CREATE POLICY "Public read reviews"
  ON reviews FOR SELECT TO anon, authenticated
  USING (true);

-- Keep write policies scoped to owner / admin (recreate if dropped elsewhere)
DROP POLICY IF EXISTS "Users insert own reviews" ON reviews;
CREATE POLICY "Users insert own reviews"
  ON reviews FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Users update own reviews" ON reviews;
CREATE POLICY "Users update own reviews"
  ON reviews FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Users delete own reviews" ON reviews;
CREATE POLICY "Users delete own reviews"
  ON reviews FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());
