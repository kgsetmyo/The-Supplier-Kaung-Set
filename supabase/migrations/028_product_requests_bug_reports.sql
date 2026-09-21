-- 028 — Custom product requests + bug reports (+ requests storage bucket)

CREATE TABLE IF NOT EXISTS product_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  item_name TEXT NOT NULL,
  details TEXT NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sourced', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT product_requests_name_nonempty_chk CHECK (btrim(name) <> ''),
  CONSTRAINT product_requests_email_nonempty_chk CHECK (btrim(email) <> ''),
  CONSTRAINT product_requests_item_name_nonempty_chk CHECK (btrim(item_name) <> ''),
  CONSTRAINT product_requests_details_nonempty_chk CHECK (btrim(details) <> '')
);

CREATE INDEX IF NOT EXISTS idx_product_requests_status ON product_requests(status);
CREATE INDEX IF NOT EXISTS idx_product_requests_created_at ON product_requests(created_at DESC);

CREATE TABLE IF NOT EXISTS bug_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT bug_reports_name_nonempty_chk CHECK (btrim(name) <> ''),
  CONSTRAINT bug_reports_email_nonempty_chk CHECK (btrim(email) <> ''),
  CONSTRAINT bug_reports_description_nonempty_chk CHECK (btrim(description) <> '')
);

CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON bug_reports(created_at DESC);

COMMENT ON TABLE product_requests IS 'Customer custom product sourcing requests';
COMMENT ON TABLE bug_reports IS 'Storefront bug reports from customers';

ALTER TABLE product_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone insert product requests" ON product_requests;
CREATE POLICY "Anyone insert product requests"
  ON product_requests FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin read product requests" ON product_requests;
CREATE POLICY "Admin read product requests"
  ON product_requests FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin update product requests" ON product_requests;
CREATE POLICY "Admin update product requests"
  ON product_requests FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Anyone insert bug reports" ON bug_reports;
CREATE POLICY "Anyone insert bug reports"
  ON bug_reports FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin read bug reports" ON bug_reports;
CREATE POLICY "Admin read bug reports"
  ON bug_reports FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin update bug reports" ON bug_reports;
CREATE POLICY "Admin update bug reports"
  ON bug_reports FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Public image uploads for product requests
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'requests',
  'requests',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Anyone upload request images" ON storage.objects;
CREATE POLICY "Anyone upload request images"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'requests');

DROP POLICY IF EXISTS "Public read request images" ON storage.objects;
CREATE POLICY "Public read request images"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'requests');
