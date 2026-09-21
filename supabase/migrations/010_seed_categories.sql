-- 010 — Seed common product categories (optional, idempotent by name_en)
-- categories + products.category_id already exist from 007.

INSERT INTO categories (id, name_en, name_mm)
VALUES
  ('c1000000-0000-4000-8000-000000000001', 'Electronics', 'အီလက်ထရောနစ်'),
  ('c1000000-0000-4000-8000-000000000002', 'Kitchenware', 'မီးဖိုချောင်ပစ္စည်း'),
  ('c1000000-0000-4000-8000-000000000003', 'Shoes', 'ဖိနပ်'),
  ('c1000000-0000-4000-8000-000000000004', 'Fashion', 'ဖက်ရှင်'),
  ('c1000000-0000-4000-8000-000000000005', 'Home', 'အိမ်သုံးပစ္စည်း'),
  ('c1000000-0000-4000-8000-000000000006', 'Beauty', 'အလှကုန်')
ON CONFLICT (id) DO NOTHING;

-- If you already have rows with different IDs but same names, this is a no-op.
-- Admins can also insert more categories via SQL as needed.
