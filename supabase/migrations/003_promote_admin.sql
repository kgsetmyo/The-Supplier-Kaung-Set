-- Promote the store admin by email (run in Supabase SQL Editor after signup)
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'kaungset.kgt007@gmail.com'
);
