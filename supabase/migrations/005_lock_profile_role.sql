-- Prevent non-admins from changing their own role
DROP POLICY IF EXISTS "Users update own profile" ON profiles;

-- Users may not UPDATE profiles at all (role changes are admin-only)
DROP POLICY IF EXISTS "Admin update profiles" ON profiles;
CREATE POLICY "Admin update profiles"
  ON profiles FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
