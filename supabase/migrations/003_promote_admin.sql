-- Promote the store admin by email (run in Supabase SQL Editor after signup)
-- Temporarily disable the protect_profile_role trigger: SQL Editor has no
-- auth.uid(), so is_admin() is false and a plain UPDATE would fail with
-- "You are not allowed to change your role".

ALTER TABLE public.profiles DISABLE TRIGGER trg_protect_profile_role;

UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'kgset143@gmail.com'
);

ALTER TABLE public.profiles ENABLE TRIGGER trg_protect_profile_role;

-- Confirm
SELECT p.id, u.email, p.role
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'kgset143@gmail.com';
