# The supplier Kaung Set

Bilingual (EN / MM) e-commerce storefront with Supabase Auth and an admin dashboard.

## Setup

1. Ensure `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

2. In the Supabase SQL Editor, run in order:
   - `supabase/migrations/001_ecommerce_schema.sql`
   - `supabase/migrations/002_seed_products.sql`

   If you previously ran an older schema, drop the old tables/types first or use a fresh project.

3. Create an admin user:
   - Sign up via `/signup` (or Auth users in the dashboard)
   - Promote with:
     ```sql
     UPDATE public.profiles SET role = 'admin' WHERE id = '<USER_UUID>';
     ```

4. Enable Email auth in Supabase Dashboard → Authentication → Providers.

5. Run the app:

```bash
npm install
npm run dev
```

## Routes

| Path | Purpose |
|------|---------|
| `/en` / `/mm` | Storefront |
| `/en/login` | Login (users → store, admins → `/admin`) |
| `/en/track` | Public order tracking by `KS-…` number |
| `/en/account/orders` | Logged-in user order history |
| `/en/admin` | Overview stats |
| `/en/admin/orders` | Order status + tracking updates |
| `/en/admin/inventory` | Products / stock |
| `/en/admin/marketing` | Announcement banner |

SQL: also run `004_tracking_number.sql` if your database was created before tracking support.
