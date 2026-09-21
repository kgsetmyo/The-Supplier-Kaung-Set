-- 025 — Reviews moderation status (pending / approved / rejected)
-- Prerequisites: 019, 020

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS status TEXT;

-- Existing reviews stay visible on the storefront
UPDATE reviews
SET status = 'approved'
WHERE status IS NULL OR btrim(status) = '';

ALTER TABLE reviews
  ALTER COLUMN status SET DEFAULT 'pending';

ALTER TABLE reviews
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE reviews
  DROP CONSTRAINT IF EXISTS reviews_status_check;

ALTER TABLE reviews
  ADD CONSTRAINT reviews_status_check
  CHECK (status IN ('pending', 'approved', 'rejected'));

CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_product_status
  ON reviews(product_id, status);

COMMENT ON COLUMN reviews.status IS
  'pending until admin approves; storefront shows approved only';

-- Public storefront: approved reviews only. Authors + admins see all of theirs.
DROP POLICY IF EXISTS "Public read reviews" ON reviews;
DROP POLICY IF EXISTS "Users read own reviews" ON reviews;
DROP POLICY IF EXISTS "Public read approved reviews" ON reviews;
CREATE POLICY "Public read approved reviews"
  ON reviews FOR SELECT TO anon, authenticated
  USING (
    status = 'approved'
    OR user_id = auth.uid()
    OR public.is_admin()
  );
