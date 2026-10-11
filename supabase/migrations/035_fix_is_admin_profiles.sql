-- 035 — Restore is_admin() to check profiles.role
-- A remote change made is_admin() read auth.jwt() app_metadata.role only.
-- Profile role was admin, but JWT had no role → product insert/update RLS failed.
-- Safe to re-run. Matches migrations 001 / 009 / 019.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

COMMENT ON FUNCTION public.is_admin() IS
  'True when the current auth user has profiles.role = admin.';
