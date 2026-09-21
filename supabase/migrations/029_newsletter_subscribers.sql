-- 029 — Newsletter subscribers (safe if already created)

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT newsletter_subscribers_email_nonempty_chk CHECK (btrim(email) <> '')
);

CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_email_unique_ci
  ON newsletter_subscribers (lower(btrim(email)));

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_created_at
  ON newsletter_subscribers(created_at DESC);

COMMENT ON TABLE newsletter_subscribers IS
  'Storefront newsletter email signups (Phase 6).';

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone insert newsletter" ON newsletter_subscribers;
CREATE POLICY "Anyone insert newsletter"
  ON newsletter_subscribers FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin read newsletter" ON newsletter_subscribers;
CREATE POLICY "Admin read newsletter"
  ON newsletter_subscribers FOR SELECT TO authenticated
  USING (public.is_admin());
