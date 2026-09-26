-- 012 — Nested e-commerce taxonomy seed (up to 4 levels)
-- Prerequisites: 011_hierarchical_categories.sql
-- NOTE: All category UUIDs use hex-only characters (0-9, a-f).
-- Idempotent: ON CONFLICT (id) DO UPDATE for names/parent/sort; safe to re-run.
--
-- Compatible with 015–017: if emoji_icon is NOT NULL, inserts use a temporary
-- default, then icons are backfilled by name (same mapping as 017).
--
-- Reuses flat roots from 010 where present:
--   Electronics, Fashion, Home, Beauty (as L1)
--   Kitchenware → nested under Home & Kitchen
--   Shoes → nested under Fashion
--
-- products.category_id is unchanged; re-assign to leaf nodes in admin when ready.

-- ---------------------------------------------------------------------------
-- emoji_icon required (017): allow INSERTs that omit the column
-- ---------------------------------------------------------------------------
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS emoji_icon TEXT;

ALTER TABLE categories
  ALTER COLUMN emoji_icon SET DEFAULT '📦';

-- ---------------------------------------------------------------------------
-- Upsert helper pattern: fixed UUIDs for stable FKs / seeds
-- ---------------------------------------------------------------------------

-- ========== LEVEL 1 ROOTS ==========
INSERT INTO categories (id, parent_id, name_en, name_mm, sort_order, slug) VALUES
  ('c1000000-0000-4000-8000-000000000006', NULL, 'Beauty', 'အလှကုန်', 10, 'beauty'),
  ('c1000000-0000-4000-8000-000000000001', NULL, 'Electronics', 'အီလက်ထရောနစ်', 20, 'electronics'),
  ('c1000000-0000-4000-8000-000000000004', NULL, 'Fashion', 'ဖက်ရှင်', 30, 'fashion'),
  ('c1000000-0000-4000-8000-000000000005', NULL, 'Home & Kitchen', 'အိမ်နှင့်မီးဖိုချောင်', 40, 'home-kitchen'),
  ('c1000000-0000-4000-8000-000000000010', NULL, 'Groceries', 'စားသောက်ကုန်', 50, 'groceries'),
  ('c1000000-0000-4000-8000-000000000011', NULL, 'Sports & Outdoors', 'အားကစားနှင့်ပြင်ပ', 60, 'sports-outdoors'),
  ('c1000000-0000-4000-8000-000000000012', NULL, 'Baby & Kids', 'ကလေးနှင့်မွေးကင်းစ', 70, 'baby-kids'),
  ('c1000000-0000-4000-8000-000000000013', NULL, 'Automotive', 'မော်တော်ယာဉ်', 80, 'automotive'),
  ('c1000000-0000-4000-8000-000000000014', NULL, 'Books & Stationery', 'စာအုပ်နှင့်စာရေးကိရိယာ', 90, 'books-stationery'),
  ('c1000000-0000-4000-8000-000000000015', NULL, 'Pets', 'အိမ်မွေးတိရစ္ဆာန်', 100, 'pets')
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  name_en = EXCLUDED.name_en,
  name_mm = EXCLUDED.name_mm,
  sort_order = EXCLUDED.sort_order,
  slug = EXCLUDED.slug;

-- ============================================================================
-- BEAUTY  (Beauty → Cosmetics / Pharmacy / Personal Care → …)
-- ============================================================================

-- L2
INSERT INTO categories (id, parent_id, name_en, name_mm, sort_order, slug) VALUES
  ('c2b00000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000006', 'Cosmetics', 'အလှပြင်ပစ္စည်း', 10, 'beauty-cosmetics'),
  ('c2b00000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000006', 'Pharmacy', 'ဆေးဆိုင်', 20, 'beauty-pharmacy'),
  ('c2b00000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000006', 'Personal Care', 'ကိုယ်ရေးကိုယ်တာစောင့်ရှောက်မှု', 30, 'beauty-personal-care'),
  ('c2b00000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000006', 'Fragrance', 'ရေမွှေး', 40, 'beauty-fragrance'),
  ('c2b00000-0000-4000-8000-000000000005', 'c1000000-0000-4000-8000-000000000006', 'Hair Care', 'ဆံပင်ထိန်းသိမ်းရေး', 50, 'beauty-hair-care')
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id, name_en = EXCLUDED.name_en, name_mm = EXCLUDED.name_mm,
  sort_order = EXCLUDED.sort_order, slug = EXCLUDED.slug;

-- L3 under Cosmetics
INSERT INTO categories (id, parent_id, name_en, name_mm, sort_order, slug) VALUES
  ('c3b00000-0000-4000-8000-000000000001', 'c2b00000-0000-4000-8000-000000000001', 'Makeup', 'မိတ်ကပ်', 10, 'beauty-makeup'),
  ('c3b00000-0000-4000-8000-000000000002', 'c2b00000-0000-4000-8000-000000000001', 'Skincare', 'အရေပြားထိန်းသိမ်းရေး', 20, 'beauty-skincare'),
  ('c3b00000-0000-4000-8000-000000000003', 'c2b00000-0000-4000-8000-000000000001', 'Nail Care', 'လက်သည်းထိန်းသိမ်းရေး', 30, 'beauty-nail-care'),
  ('c3b00000-0000-4000-8000-000000000004', 'c2b00000-0000-4000-8000-000000000001', 'Beauty Tools', 'အလှပြင်ကိရိယာ', 40, 'beauty-tools')
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id, name_en = EXCLUDED.name_en, name_mm = EXCLUDED.name_mm,
  sort_order = EXCLUDED.sort_order, slug = EXCLUDED.slug;

-- L4 under Makeup
INSERT INTO categories (id, parent_id, name_en, name_mm, sort_order, slug) VALUES
  ('c4b00000-0000-4000-8000-000000000001', 'c3b00000-0000-4000-8000-000000000001', 'Face', 'မျက်နှာ', 10, 'beauty-makeup-face'),
  ('c4b00000-0000-4000-8000-000000000002', 'c3b00000-0000-4000-8000-000000000001', 'Eyes', 'မျက်လုံး', 20, 'beauty-makeup-eyes'),
  ('c4b00000-0000-4000-8000-000000000003', 'c3b00000-0000-4000-8000-000000000001', 'Lips', 'နှုတ်ခမ်း', 30, 'beauty-makeup-lips'),
  ('c4b00000-0000-4000-8000-000000000004', 'c3b00000-0000-4000-8000-000000000001', 'Cheeks', 'ပါး', 40, 'beauty-makeup-cheeks'),
  ('c4b00000-0000-4000-8000-000000000005', 'c3b00000-0000-4000-8000-000000000001', 'Makeup Sets', 'မိတ်ကပ်စုံ', 50, 'beauty-makeup-sets')
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id, name_en = EXCLUDED.name_en, name_mm = EXCLUDED.name_mm,
  sort_order = EXCLUDED.sort_order, slug = EXCLUDED.slug;

-- L4 under Skincare
INSERT INTO categories (id, parent_id, name_en, name_mm, sort_order, slug) VALUES
  ('c4b00000-0000-4000-8000-000000000011', 'c3b00000-0000-4000-8000-000000000002', 'Cleansers', 'ဆေးကြောဆေး', 10, 'beauty-skincare-cleansers'),
  ('c4b00000-0000-4000-8000-000000000012', 'c3b00000-0000-4000-8000-000000000002', 'Toners', 'တိုနာ', 20, 'beauty-skincare-toners'),
  ('c4b00000-0000-4000-8000-000000000013', 'c3b00000-0000-4000-8000-000000000002', 'Moisturizers', 'အစိုဓာတ်ထိန်း', 30, 'beauty-skincare-moisturizers'),
  ('c4b00000-0000-4000-8000-000000000014', 'c3b00000-0000-4000-8000-000000000002', 'Serums & Treatments', 'စီရမ်နှင့်ကုသမှု', 40, 'beauty-skincare-serums'),
  ('c4b00000-0000-4000-8000-000000000015', 'c3b00000-0000-4000-8000-000000000002', 'Sunscreen', 'နေကာခရင်မ်', 50, 'beauty-skincare-sunscreen'),
  ('c4b00000-0000-4000-8000-000000000016', 'c3b00000-0000-4000-8000-000000000002', 'Masks', 'မျက်နှာဖုံး', 60, 'beauty-skincare-masks'),
  ('c4b00000-0000-4000-8000-000000000017', 'c3b00000-0000-4000-8000-000000000002', 'Eye Care', 'မျက်လုံးထိန်းသိမ်းရေး', 70, 'beauty-skincare-eye')
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id, name_en = EXCLUDED.name_en, name_mm = EXCLUDED.name_mm,
  sort_order = EXCLUDED.sort_order, slug = EXCLUDED.slug;

-- L3 under Pharmacy
INSERT INTO categories (id, parent_id, name_en, name_mm, sort_order, slug) VALUES
  ('c3b00000-0000-4000-8000-000000000011', 'c2b00000-0000-4000-8000-000000000002', 'Supplements', 'ဖြည့်စွက်စာ', 10, 'beauty-supplements'),
  ('c3b00000-0000-4000-8000-000000000012', 'c2b00000-0000-4000-8000-000000000002', 'OTC Medicine', 'ဆေးဆိုင်ဆေးဝါး', 20, 'beauty-otc'),
  ('c3b00000-0000-4000-8000-000000000013', 'c2b00000-0000-4000-8000-000000000002', 'First Aid', 'ရှေးဦးသူနာပြု', 30, 'beauty-first-aid'),
  ('c3b00000-0000-4000-8000-000000000014', 'c2b00000-0000-4000-8000-000000000002', 'Medical Devices', 'ဆေးဘက်ဆိုင်ရာကိရိယာ', 40, 'beauty-medical-devices')
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id, name_en = EXCLUDED.name_en, name_mm = EXCLUDED.name_mm,
  sort_order = EXCLUDED.sort_order, slug = EXCLUDED.slug;

-- L4 under Supplements
INSERT INTO categories (id, parent_id, name_en, name_mm, sort_order, slug) VALUES
  ('c4b00000-0000-4000-8000-000000000021', 'c3b00000-0000-4000-8000-000000000011', 'Vitamins', 'ဗီတာမင်', 10, 'beauty-vitamins'),
  ('c4b00000-0000-4000-8000-000000000022', 'c3b00000-0000-4000-8000-000000000011', 'Minerals', 'ဓာတ်သတ္တု', 20, 'beauty-minerals'),
  ('c4b00000-0000-4000-8000-000000000023', 'c3b00000-0000-4000-8000-000000000011', 'Protein & Sports Nutrition', 'ပရိုတင်းနှင့်အားကစားအာဟာရ', 30, 'beauty-protein'),
  ('c4b00000-0000-4000-8000-000000000024', 'c3b00000-0000-4000-8000-000000000011', 'Herbal Supplements', 'ဆေးဖက်ဝင်အပင်ဖြည့်စွက်', 40, 'beauty-herbal')
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id, name_en = EXCLUDED.name_en, name_mm = EXCLUDED.name_mm,
  sort_order = EXCLUDED.sort_order, slug = EXCLUDED.slug;

-- L3 under Personal Care
INSERT INTO categories (id, parent_id, name_en, name_mm, sort_order, slug) VALUES
  ('c3b00000-0000-4000-8000-000000000021', 'c2b00000-0000-4000-8000-000000000003', 'Bath & Body', 'ရေချိုးနှင့်ကိုယ်ခန္ဓာ', 10, 'beauty-bath-body'),
  ('c3b00000-0000-4000-8000-000000000022', 'c2b00000-0000-4000-8000-000000000003', 'Oral Care', 'ပါးစပ်ထိန်းသိမ်းရေး', 20, 'beauty-oral-care'),
  ('c3b00000-0000-4000-8000-000000000023', 'c2b00000-0000-4000-8000-000000000003', 'Men''s Grooming', 'အမျိုးသားအလှပြင်', 30, 'beauty-mens-grooming'),
  ('c3b00000-0000-4000-8000-000000000024', 'c2b00000-0000-4000-8000-000000000003', 'Feminine Care', 'အမျိုးသမီးစောင့်ရှောက်မှု', 40, 'beauty-feminine-care')
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id, name_en = EXCLUDED.name_en, name_mm = EXCLUDED.name_mm,
  sort_order = EXCLUDED.sort_order, slug = EXCLUDED.slug;

-- L4 under Bath & Body
INSERT INTO categories (id, parent_id, name_en, name_mm, sort_order, slug) VALUES
  ('c4b00000-0000-4000-8000-000000000031', 'c3b00000-0000-4000-8000-000000000021', 'Shower Gel', 'ရေချိုးဂျယ်', 10, 'beauty-shower-gel'),
  ('c4b00000-0000-4000-8000-000000000032', 'c3b00000-0000-4000-8000-000000000021', 'Body Lotion', 'ကိုယ်ခန္ဓာလိုးရှင်း', 20, 'beauty-body-lotion'),
  ('c4b00000-0000-4000-8000-000000000033', 'c3b00000-0000-4000-8000-000000000021', 'Hand Care', 'လက်ထိန်းသိမ်းရေး', 30, 'beauty-hand-care'),
  ('c4b00000-0000-4000-8000-000000000034', 'c3b00000-0000-4000-8000-000000000021', 'Deodorant', 'ချွေးထိန်းဆေး', 40, 'beauty-deodorant'),
  ('c4b00000-0000-4000-8000-000000000035', 'c3b00000-0000-4000-8000-000000000021', 'Soap Bars', 'ဆပ်ပြာတုံး', 50, 'beauty-soap-bars')
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id, name_en = EXCLUDED.name_en, name_mm = EXCLUDED.name_mm,
  sort_order = EXCLUDED.sort_order, slug = EXCLUDED.slug;

-- L3 under Hair Care
INSERT INTO categories (id, parent_id, name_en, name_mm, sort_order, slug) VALUES
  ('c3b00000-0000-4000-8000-000000000031', 'c2b00000-0000-4000-8000-000000000005', 'Shampoo', 'ခေါင်းလျှော်ရည်', 10, 'beauty-shampoo'),
  ('c3b00000-0000-4000-8000-000000000032', 'c2b00000-0000-4000-8000-000000000005', 'Conditioner', 'ဆံပင်အာဟာရရည်', 20, 'beauty-conditioner'),
  ('c3b00000-0000-4000-8000-000000000033', 'c2b00000-0000-4000-8000-000000000005', 'Hair Treatments', 'ဆံပင်ကုသမှု', 30, 'beauty-hair-treatments'),
  ('c3b00000-0000-4000-8000-000000000034', 'c2b00000-0000-4000-8000-000000000005', 'Hair Styling', 'ဆံပင်ပုံစံ', 40, 'beauty-hair-styling'),
  ('c3b00000-0000-4000-8000-000000000035', 'c2b00000-0000-4000-8000-000000000005', 'Hair Color', 'ဆံပင်ဆိုးဆေး', 50, 'beauty-hair-color')
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id, name_en = EXCLUDED.name_en, name_mm = EXCLUDED.name_mm,
  sort_order = EXCLUDED.sort_order, slug = EXCLUDED.slug;

-- L3 under Fragrance
INSERT INTO categories (id, parent_id, name_en, name_mm, sort_order, slug) VALUES
  ('c3b00000-0000-4000-8000-000000000041', 'c2b00000-0000-4000-8000-000000000004', 'Women''s Fragrance', 'အမျိုးသမီးရေမွှေး', 10, 'beauty-fragrance-women'),
  ('c3b00000-0000-4000-8000-000000000042', 'c2b00000-0000-4000-8000-000000000004', 'Men''s Fragrance', 'အမျိုးသားရေမွှေး', 20, 'beauty-fragrance-men'),
  ('c3b00000-0000-4000-8000-000000000043', 'c2b00000-0000-4000-8000-000000000004', 'Unisex & Sets', 'ယူနီဆက်နှင့်စုံ', 30, 'beauty-fragrance-unisex')
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id, name_en = EXCLUDED.name_en, name_mm = EXCLUDED.name_mm,
  sort_order = EXCLUDED.sort_order, slug = EXCLUDED.slug;

-- ============================================================================
-- ELECTRONICS
-- ============================================================================

INSERT INTO categories (id, parent_id, name_en, name_mm, sort_order, slug) VALUES
  ('c2e00000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', 'Mobile & Tablets', 'မိုဘိုင်းနှင့်တက်ဘလက်', 10, 'elec-mobile'),
  ('c2e00000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000001', 'Computers', 'ကွန်ပျူတာ', 20, 'elec-computers'),
  ('c2e00000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000001', 'TV & AV', 'တီဗီနှင့်အသံ', 30, 'elec-tv-av'),
  ('c2e00000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000001', 'Audio', 'အသံပစ္စည်း', 40, 'elec-audio'),
  ('c2e00000-0000-4000-8000-000000000005', 'c1000000-0000-4000-8000-000000000001', 'Cameras', 'ကင်မရာ', 50, 'elec-cameras'),
  ('c2e00000-0000-4000-8000-000000000006', 'c1000000-0000-4000-8000-000000000001', 'Wearables', 'ဝတ်ဆင်နိုင်သောစက်', 60, 'elec-wearables'),
  ('c2e00000-0000-4000-8000-000000000007', 'c1000000-0000-4000-8000-000000000001', 'Gaming', 'ဂိမ်း', 70, 'elec-gaming'),
  ('c2e00000-0000-4000-8000-000000000008', 'c1000000-0000-4000-8000-000000000001', 'Accessories', 'အရန်ပစ္စည်း', 80, 'elec-accessories')
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id, name_en = EXCLUDED.name_en, name_mm = EXCLUDED.name_mm,
  sort_order = EXCLUDED.sort_order, slug = EXCLUDED.slug;

INSERT INTO categories (id, parent_id, name_en, name_mm, sort_order, slug) VALUES
  ('c3e00000-0000-4000-8000-000000000001', 'c2e00000-0000-4000-8000-000000000001', 'Smartphones', 'စမတ်ဖုန်း', 10, 'elec-smartphones'),
  ('c3e00000-0000-4000-8000-000000000002', 'c2e00000-0000-4000-8000-000000000001', 'Tablets', 'တက်ဘလက်', 20, 'elec-tablets'),
  ('c3e00000-0000-4000-8000-000000000003', 'c2e00000-0000-4000-8000-000000000001', 'Feature Phones', 'ဖုန်းရိုးရိုး', 30, 'elec-feature-phones'),
  ('c3e00000-0000-4000-8000-000000000004', 'c2e00000-0000-4000-8000-000000000001', 'Mobile Accessories', 'မိုဘိုင်းအရန်ပစ္စည်း', 40, 'elec-mobile-acc'),
  ('c3e00000-0000-4000-8000-000000000011', 'c2e00000-0000-4000-8000-000000000002', 'Laptops', 'လက်တော့ပ်', 10, 'elec-laptops'),
  ('c3e00000-0000-4000-8000-000000000012', 'c2e00000-0000-4000-8000-000000000002', 'Desktops', 'ဒက်စ်တော့ပ်', 20, 'elec-desktops'),
  ('c3e00000-0000-4000-8000-000000000013', 'c2e00000-0000-4000-8000-000000000002', 'Monitors', 'မော်နီတာ', 30, 'elec-monitors'),
  ('c3e00000-0000-4000-8000-000000000014', 'c2e00000-0000-4000-8000-000000000002', 'Storage & Drives', 'သိုလှောင်မှု', 40, 'elec-storage'),
  ('c3e00000-0000-4000-8000-000000000015', 'c2e00000-0000-4000-8000-000000000002', 'PC Components', 'PC အစိတ်အပိုင်း', 50, 'elec-pc-components'),
  ('c3e00000-0000-4000-8000-000000000021', 'c2e00000-0000-4000-8000-000000000003', 'Televisions', 'တီဗီ', 10, 'elec-tv'),
  ('c3e00000-0000-4000-8000-000000000022', 'c2e00000-0000-4000-8000-000000000003', 'Streaming Devices', 'စတရီမင်းကိရိယာ', 20, 'elec-streaming'),
  ('c3e00000-0000-4000-8000-000000000023', 'c2e00000-0000-4000-8000-000000000003', 'Projectors', 'ပရိုဂျက်တာ', 30, 'elec-projectors'),
  ('c3e00000-0000-4000-8000-000000000031', 'c2e00000-0000-4000-8000-000000000004', 'Headphones', 'နားကြပ်', 10, 'elec-headphones'),
  ('c3e00000-0000-4000-8000-000000000032', 'c2e00000-0000-4000-8000-000000000004', 'Speakers', 'စပီကာ', 20, 'elec-speakers'),
  ('c3e00000-0000-4000-8000-000000000033', 'c2e00000-0000-4000-8000-000000000004', 'Home Theater', 'အိမ်သုံးပြဇာတ်ရုံ', 30, 'elec-home-theater'),
  ('c3e00000-0000-4000-8000-000000000041', 'c2e00000-0000-4000-8000-000000000007', 'Consoles', 'ဂိမ်းကွန်ဆိုး', 10, 'elec-consoles'),
  ('c3e00000-0000-4000-8000-000000000042', 'c2e00000-0000-4000-8000-000000000007', 'Games', 'ဂိမ်းများ', 20, 'elec-games'),
  ('c3e00000-0000-4000-8000-000000000043', 'c2e00000-0000-4000-8000-000000000007', 'Gaming Accessories', 'ဂိမ်းအရန်ပစ္စည်း', 30, 'elec-gaming-acc')
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id, name_en = EXCLUDED.name_en, name_mm = EXCLUDED.name_mm,
  sort_order = EXCLUDED.sort_order, slug = EXCLUDED.slug;

INSERT INTO categories (id, parent_id, name_en, name_mm, sort_order, slug) VALUES
  ('c4e00000-0000-4000-8000-000000000001', 'c3e00000-0000-4000-8000-000000000004', 'Chargers & Cables', 'အားသွင်းနှင့်ကြိုး', 10, 'elec-chargers'),
  ('c4e00000-0000-4000-8000-000000000002', 'c3e00000-0000-4000-8000-000000000004', 'Cases & Covers', 'ကေ့စ်နှင့်အဖုံး', 20, 'elec-cases'),
  ('c4e00000-0000-4000-8000-000000000003', 'c3e00000-0000-4000-8000-000000000004', 'Power Banks', 'ပါဝါဘဏ်', 30, 'elec-power-banks'),
  ('c4e00000-0000-4000-8000-000000000004', 'c3e00000-0000-4000-8000-000000000004', 'Screen Protectors', 'စခရင်ကာကွယ်ဖလင်', 40, 'elec-screen-protectors'),
  ('c4e00000-0000-4000-8000-000000000011', 'c3e00000-0000-4000-8000-000000000015', 'CPUs', 'CPU', 10, 'elec-cpu'),
  ('c4e00000-0000-4000-8000-000000000012', 'c3e00000-0000-4000-8000-000000000015', 'GPU', 'GPU', 20, 'elec-gpu'),
  ('c4e00000-0000-4000-8000-000000000013', 'c3e00000-0000-4000-8000-000000000015', 'RAM', 'RAM', 30, 'elec-ram'),
  ('c4e00000-0000-4000-8000-000000000014', 'c3e00000-0000-4000-8000-000000000015', 'Motherboards', 'မာသာဘုတ်', 40, 'elec-motherboards')
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id, name_en = EXCLUDED.name_en, name_mm = EXCLUDED.name_mm,
  sort_order = EXCLUDED.sort_order, slug = EXCLUDED.slug;

-- ============================================================================
-- FASHION  (existing Shoes id nested under Fashion)
-- ============================================================================

INSERT INTO categories (id, parent_id, name_en, name_mm, sort_order, slug) VALUES
  ('c2f00000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000004', 'Women''s Clothing', 'အမျိုးသမီးအဝတ်အစား', 10, 'fashion-women'),
  ('c2f00000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000004', 'Men''s Clothing', 'အမျိုးသားအဝတ်အစား', 20, 'fashion-men'),
  ('c1000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000004', 'Shoes', 'ဖိနပ်', 30, 'fashion-shoes'),
  ('c2f00000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000004', 'Bags & Luggage', 'အိတ်နှင့်ခရီးဆောင်အိတ်', 40, 'fashion-bags'),
  ('c2f00000-0000-4000-8000-000000000005', 'c1000000-0000-4000-8000-000000000004', 'Accessories', 'ဆက်စပ်ပစ္စည်း', 50, 'fashion-accessories'),
  ('c2f00000-0000-4000-8000-000000000006', 'c1000000-0000-4000-8000-000000000004', 'Watches & Jewelry', 'နာရီနှင့်လက်ဝတ်ရတနာ', 60, 'fashion-watches-jewelry')
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id, name_en = EXCLUDED.name_en, name_mm = EXCLUDED.name_mm,
  sort_order = EXCLUDED.sort_order, slug = EXCLUDED.slug;

INSERT INTO categories (id, parent_id, name_en, name_mm, sort_order, slug) VALUES
  ('c3f00000-0000-4000-8000-000000000001', 'c2f00000-0000-4000-8000-000000000001', 'Dresses', 'ဝတ်စုံ', 10, 'fashion-dresses'),
  ('c3f00000-0000-4000-8000-000000000002', 'c2f00000-0000-4000-8000-000000000001', 'Tops & Blouses', 'အပေါ်ဝတ်', 20, 'fashion-women-tops'),
  ('c3f00000-0000-4000-8000-000000000003', 'c2f00000-0000-4000-8000-000000000001', 'Bottoms', 'အောက်ဝတ်', 30, 'fashion-women-bottoms'),
  ('c3f00000-0000-4000-8000-000000000004', 'c2f00000-0000-4000-8000-000000000001', 'Outerwear', 'အပြင်အင်္ကျီ', 40, 'fashion-women-outerwear'),
  ('c3f00000-0000-4000-8000-000000000005', 'c2f00000-0000-4000-8000-000000000001', 'Activewear', 'အားကစားဝတ်', 50, 'fashion-women-active'),
  ('c3f00000-0000-4000-8000-000000000011', 'c2f00000-0000-4000-8000-000000000002', 'Shirts & Polos', 'ရှပ်နှင့်ပိုလို', 10, 'fashion-men-shirts'),
  ('c3f00000-0000-4000-8000-000000000012', 'c2f00000-0000-4000-8000-000000000002', 'T-Shirts', 'တီရှပ်', 20, 'fashion-men-tees'),
  ('c3f00000-0000-4000-8000-000000000013', 'c2f00000-0000-4000-8000-000000000002', 'Pants & Jeans', 'ဘောင်းဘီနှင့်ဂျင်း', 30, 'fashion-men-pants'),
  ('c3f00000-0000-4000-8000-000000000014', 'c2f00000-0000-4000-8000-000000000002', 'Outerwear', 'အပြင်အင်္ကျီ', 40, 'fashion-men-outerwear'),
  ('c3f00000-0000-4000-8000-000000000015', 'c2f00000-0000-4000-8000-000000000002', 'Activewear', 'အားကစားဝတ်', 50, 'fashion-men-active'),
  ('c3f00000-0000-4000-8000-000000000021', 'c1000000-0000-4000-8000-000000000003', 'Sneakers', 'စနိကာ', 10, 'fashion-sneakers'),
  ('c3f00000-0000-4000-8000-000000000022', 'c1000000-0000-4000-8000-000000000003', 'Sandals & Flip-Flops', 'ဖိနပ်ပွင့်နှင့်ဖိနပ်ပေါ့', 20, 'fashion-sandals'),
  ('c3f00000-0000-4000-8000-000000000023', 'c1000000-0000-4000-8000-000000000003', 'Formal Shoes', 'တရားဝင်ဖိနပ်', 30, 'fashion-formal-shoes'),
  ('c3f00000-0000-4000-8000-000000000024', 'c1000000-0000-4000-8000-000000000003', 'Boots', 'ဘွတ်ဖိနပ်', 40, 'fashion-boots'),
  ('c3f00000-0000-4000-8000-000000000031', 'c2f00000-0000-4000-8000-000000000004', 'Handbags', 'လက်ကိုင်အိတ်', 10, 'fashion-handbags'),
  ('c3f00000-0000-4000-8000-000000000032', 'c2f00000-0000-4000-8000-000000000004', 'Backpacks', 'ကျောပိုးအိတ်', 20, 'fashion-backpacks'),
  ('c3f00000-0000-4000-8000-000000000033', 'c2f00000-0000-4000-8000-000000000004', 'Travel Luggage', 'ခရီးဆောင်အိတ်', 30, 'fashion-luggage'),
  ('c3f00000-0000-4000-8000-000000000041', 'c2f00000-0000-4000-8000-000000000005', 'Belts', 'ခါးပတ်', 10, 'fashion-belts'),
  ('c3f00000-0000-4000-8000-000000000042', 'c2f00000-0000-4000-8000-000000000005', 'Hats & Caps', 'ဦးထုပ်', 20, 'fashion-hats'),
  ('c3f00000-0000-4000-8000-000000000043', 'c2f00000-0000-4000-8000-000000000005', 'Scarves & Gloves', 'လည်စည်းနှင့်လက်အိတ်', 30, 'fashion-scarves'),
  ('c3f00000-0000-4000-8000-000000000044', 'c2f00000-0000-4000-8000-000000000005', 'Sunglasses', 'နေကာမျက်မှန်', 40, 'fashion-sunglasses')
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id, name_en = EXCLUDED.name_en, name_mm = EXCLUDED.name_mm,
  sort_order = EXCLUDED.sort_order, slug = EXCLUDED.slug;

-- ============================================================================
-- HOME & KITCHEN  (existing Kitchenware nested)
-- ============================================================================

INSERT INTO categories (id, parent_id, name_en, name_mm, sort_order, slug) VALUES
  ('c1000000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000005', 'Kitchenware', 'မီးဖိုချောင်ပစ္စည်း', 10, 'home-kitchenware'),
  ('c2d00000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000005', 'Home Appliances', 'အိမ်သုံးစက်ပစ္စည်း', 20, 'home-appliances'),
  ('c2d00000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000005', 'Furniture', 'ပရိဘောဂ', 30, 'home-furniture'),
  ('c2d00000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000005', 'Bedding & Bath', 'အိပ်ရာနှင့်ရေချိုးခန်း', 40, 'home-bedding-bath'),
  ('c2d00000-0000-4000-8000-000000000005', 'c1000000-0000-4000-8000-000000000005', 'Home Decor', 'အိမ်အလှဆင်', 50, 'home-decor'),
  ('c2d00000-0000-4000-8000-000000000006', 'c1000000-0000-4000-8000-000000000005', 'Storage & Organization', 'သိုလှောင်နှင့်စီစဉ်', 60, 'home-storage'),
  ('c2d00000-0000-4000-8000-000000000007', 'c1000000-0000-4000-8000-000000000005', 'Cleaning Supplies', 'သန့်ရှင်းရေးပစ္စည်း', 70, 'home-cleaning')
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id, name_en = EXCLUDED.name_en, name_mm = EXCLUDED.name_mm,
  sort_order = EXCLUDED.sort_order, slug = EXCLUDED.slug;

INSERT INTO categories (id, parent_id, name_en, name_mm, sort_order, slug) VALUES
  ('c3d00000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000002', 'Cookware', 'ချက်ပြုတ်ပစ္စည်း', 10, 'home-cookware'),
  ('c3d00000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000002', 'Bakeware', 'မုန့်ဖုတ်ပစ္စည်း', 20, 'home-bakeware'),
  ('c3d00000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000002', 'Utensils & Gadgets', 'မီးဖိုချောင်ကိရိယာ', 30, 'home-utensils'),
  ('c3d00000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000002', 'Dinnerware', 'ပန်းကန်ခွက်ယောက်', 40, 'home-dinnerware'),
  ('c3d00000-0000-4000-8000-000000000005', 'c1000000-0000-4000-8000-000000000002', 'Drinkware', 'သောက်ရေခွက်', 50, 'home-drinkware'),
  ('c3d00000-0000-4000-8000-000000000006', 'c1000000-0000-4000-8000-000000000002', 'Food Storage', 'အစားအစာသိုလှောင်', 60, 'home-food-storage'),
  ('c3d00000-0000-4000-8000-000000000011', 'c2d00000-0000-4000-8000-000000000002', 'Kitchen Appliances', 'မီးဖိုချောင်စက်', 10, 'home-kitchen-appliances'),
  ('c3d00000-0000-4000-8000-000000000012', 'c2d00000-0000-4000-8000-000000000002', 'Cleaning Appliances', 'သန့်ရှင်းရေးစက်', 20, 'home-cleaning-appliances'),
  ('c3d00000-0000-4000-8000-000000000013', 'c2d00000-0000-4000-8000-000000000002', 'Climate Control', 'ရာသီဥတုထိန်း', 30, 'home-climate'),
  ('c3d00000-0000-4000-8000-000000000021', 'c2d00000-0000-4000-8000-000000000003', 'Living Room', 'ဧည့်ခန်း', 10, 'home-living-room'),
  ('c3d00000-0000-4000-8000-000000000022', 'c2d00000-0000-4000-8000-000000000003', 'Bedroom', 'အိပ်ခန်း', 20, 'home-bedroom'),
  ('c3d00000-0000-4000-8000-000000000023', 'c2d00000-0000-4000-8000-000000000003', 'Office Furniture', 'ရုံးပရိဘောဂ', 30, 'home-office-furniture'),
  ('c3d00000-0000-4000-8000-000000000031', 'c2d00000-0000-4000-8000-000000000004', 'Bed Linens', 'အိပ်ရာခင်း', 10, 'home-bed-linens'),
  ('c3d00000-0000-4000-8000-000000000032', 'c2d00000-0000-4000-8000-000000000004', 'Towels', 'သုတ်ပဝါ', 20, 'home-towels'),
  ('c3d00000-0000-4000-8000-000000000033', 'c2d00000-0000-4000-8000-000000000004', 'Bathroom Accessories', 'ရေချိုးခန်းဆက်စပ်', 30, 'home-bath-acc')
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id, name_en = EXCLUDED.name_en, name_mm = EXCLUDED.name_mm,
  sort_order = EXCLUDED.sort_order, slug = EXCLUDED.slug;

INSERT INTO categories (id, parent_id, name_en, name_mm, sort_order, slug) VALUES
  ('c4d00000-0000-4000-8000-000000000001', 'c3d00000-0000-4000-8000-000000000001', 'Pots & Pans', 'အိုးနှင့်ဒယ်အိုး', 10, 'home-pots-pans'),
  ('c4d00000-0000-4000-8000-000000000002', 'c3d00000-0000-4000-8000-000000000001', 'Knife Sets', 'ဓားစုံ', 20, 'home-knives'),
  ('c4d00000-0000-4000-8000-000000000003', 'c3d00000-0000-4000-8000-000000000001', 'Cutting Boards', 'လှီးစင်', 30, 'home-cutting-boards'),
  ('c4d00000-0000-4000-8000-000000000011', 'c3d00000-0000-4000-8000-000000000011', 'Blenders & Mixers', 'ဘလန်ဒါနှင့်မစ်ဆာ', 10, 'home-blenders'),
  ('c4d00000-0000-4000-8000-000000000012', 'c3d00000-0000-4000-8000-000000000011', 'Rice Cookers', 'ထမင်းပေါင်းအိုး', 20, 'home-rice-cookers'),
  ('c4d00000-0000-4000-8000-000000000013', 'c3d00000-0000-4000-8000-000000000011', 'Coffee Makers', 'ကော်ဖီစက်', 30, 'home-coffee'),
  ('c4d00000-0000-4000-8000-000000000014', 'c3d00000-0000-4000-8000-000000000011', 'Electric Kettles', 'လျှပ်စစ်ရေနွေးအိုး', 40, 'home-kettles'),
  ('c4d00000-0000-4000-8000-000000000021', 'c3d00000-0000-4000-8000-000000000012', 'Vacuum Cleaners', 'ဖုန်စုပ်စက်', 10, 'home-vacuums'),
  ('c4d00000-0000-4000-8000-000000000022', 'c3d00000-0000-4000-8000-000000000012', 'Irons & Steamers', 'မီးပူနှင့်ငွေ့ပူ', 20, 'home-irons')
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id, name_en = EXCLUDED.name_en, name_mm = EXCLUDED.name_mm,
  sort_order = EXCLUDED.sort_order, slug = EXCLUDED.slug;

-- ============================================================================
-- GROCERIES
-- ============================================================================

INSERT INTO categories (id, parent_id, name_en, name_mm, sort_order, slug) VALUES
  ('c2900000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000010', 'Fresh Food', 'လတ်ဆတ်သောအစားအစာ', 10, 'groc-fresh'),
  ('c2900000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000010', 'Pantry Staples', 'အိမ်သုံးစားသောက်ကုန်', 20, 'groc-pantry'),
  ('c2900000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000010', 'Beverages', 'သောက်စရာ', 30, 'groc-beverages'),
  ('c2900000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000010', 'Snacks & Sweets', 'အဆာပြေနှင့်ချိုမြိန်', 40, 'groc-snacks'),
  ('c2900000-0000-4000-8000-000000000005', 'c1000000-0000-4000-8000-000000000010', 'Dairy & Eggs', 'နို့ထွက်နှင့်ဥ', 50, 'groc-dairy'),
  ('c2900000-0000-4000-8000-000000000006', 'c1000000-0000-4000-8000-000000000010', 'Frozen', 'အေးခဲအစားအစာ', 60, 'groc-frozen')
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id, name_en = EXCLUDED.name_en, name_mm = EXCLUDED.name_mm,
  sort_order = EXCLUDED.sort_order, slug = EXCLUDED.slug;

INSERT INTO categories (id, parent_id, name_en, name_mm, sort_order, slug) VALUES
  ('c3900000-0000-4000-8000-000000000001', 'c2900000-0000-4000-8000-000000000001', 'Fruits', 'သစ်သီး', 10, 'groc-fruits'),
  ('c3900000-0000-4000-8000-000000000002', 'c2900000-0000-4000-8000-000000000001', 'Vegetables', 'ဟင်းသီးဟင်းရွက်', 20, 'groc-vegetables'),
  ('c3900000-0000-4000-8000-000000000003', 'c2900000-0000-4000-8000-000000000001', 'Meat & Seafood', 'အသားနှင့်ပင်လယ်စာ', 30, 'groc-meat-seafood'),
  ('c3900000-0000-4000-8000-000000000011', 'c2900000-0000-4000-8000-000000000002', 'Rice & Grains', 'ဆန်နှင့်စပါး', 10, 'groc-rice'),
  ('c3900000-0000-4000-8000-000000000012', 'c2900000-0000-4000-8000-000000000002', 'Oils & Sauces', 'ဆီနှင့်ဆော့စ်', 20, 'groc-oils'),
  ('c3900000-0000-4000-8000-000000000013', 'c2900000-0000-4000-8000-000000000002', 'Noodles & Pasta', 'ခေါက်ဆွဲနှင့်ပါစတာ', 30, 'groc-noodles'),
  ('c3900000-0000-4000-8000-000000000014', 'c2900000-0000-4000-8000-000000000002', 'Canned & Jarred', 'ဘူးနှင့်အိုးထုတ်', 40, 'groc-canned'),
  ('c3900000-0000-4000-8000-000000000015', 'c2900000-0000-4000-8000-000000000002', 'Spices & Seasonings', 'ဟင်းခတ်အမွှေးအကြိုင်', 50, 'groc-spices'),
  ('c3900000-0000-4000-8000-000000000021', 'c2900000-0000-4000-8000-000000000003', 'Water & Soft Drinks', 'ရေနှင့်အချိုရည်', 10, 'groc-soft-drinks'),
  ('c3900000-0000-4000-8000-000000000022', 'c2900000-0000-4000-8000-000000000003', 'Tea & Coffee', 'လက်ဖက်ရည်နှင့်ကော်ဖီ', 20, 'groc-tea-coffee'),
  ('c3900000-0000-4000-8000-000000000023', 'c2900000-0000-4000-8000-000000000003', 'Juice & Milk Alternatives', 'ဖျော်ရည်နှင့်နို့အစား', 30, 'groc-juice'),
  ('c3900000-0000-4000-8000-000000000031', 'c2900000-0000-4000-8000-000000000004', 'Chips & Crackers', 'ချစ်ပ်နှင့်ခရက်ကာ', 10, 'groc-chips'),
  ('c3900000-0000-4000-8000-000000000032', 'c2900000-0000-4000-8000-000000000004', 'Chocolate & Candy', 'ချောကလက်နှင့်သကြားလုံး', 20, 'groc-candy'),
  ('c3900000-0000-4000-8000-000000000033', 'c2900000-0000-4000-8000-000000000004', 'Biscuits & Cookies', 'ဘီစကစ်', 30, 'groc-biscuits')
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id, name_en = EXCLUDED.name_en, name_mm = EXCLUDED.name_mm,
  sort_order = EXCLUDED.sort_order, slug = EXCLUDED.slug;

INSERT INTO categories (id, parent_id, name_en, name_mm, sort_order, slug) VALUES
  ('c4900000-0000-4000-8000-000000000001', 'c3900000-0000-4000-8000-000000000003', 'Chicken', 'ကြက်သား', 10, 'groc-chicken'),
  ('c4900000-0000-4000-8000-000000000002', 'c3900000-0000-4000-8000-000000000003', 'Beef & Pork', 'အမဲနှင့်ဝက်သား', 20, 'groc-beef-pork'),
  ('c4900000-0000-4000-8000-000000000003', 'c3900000-0000-4000-8000-000000000003', 'Fish & Seafood', 'ငါးနှင့်ပင်လယ်စာ', 30, 'groc-fish'),
  ('c4900000-0000-4000-8000-000000000011', 'c3900000-0000-4000-8000-000000000011', 'White Rice', 'ဆန်ဖြူ', 10, 'groc-white-rice'),
  ('c4900000-0000-4000-8000-000000000012', 'c3900000-0000-4000-8000-000000000011', 'Brown & Specialty Rice', 'ဆန်ညိုနှင့်အထူးဆန်', 20, 'groc-specialty-rice'),
  ('c4900000-0000-4000-8000-000000000013', 'c3900000-0000-4000-8000-000000000011', 'Beans & Lentils', 'ပဲအမျိုးမျိုး', 30, 'groc-beans')
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id, name_en = EXCLUDED.name_en, name_mm = EXCLUDED.name_mm,
  sort_order = EXCLUDED.sort_order, slug = EXCLUDED.slug;

-- ============================================================================
-- SPORTS & OUTDOORS
-- ============================================================================

INSERT INTO categories (id, parent_id, name_en, name_mm, sort_order, slug) VALUES
  ('c2500000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000011', 'Exercise & Fitness', 'လေ့ကျင့်ခန်းနှင့်ကြံ့ခိုင်မှု', 10, 'sports-fitness'),
  ('c2500000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000011', 'Outdoor Recreation', 'ပြင်ပအပန်းဖြေ', 20, 'sports-outdoor'),
  ('c2500000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000011', 'Team Sports', 'အဖွဲ့အားကစား', 30, 'sports-team'),
  ('c2500000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000011', 'Cycling', 'စက်ဘီးစီး', 40, 'sports-cycling'),
  ('c2500000-0000-4000-8000-000000000005', 'c1000000-0000-4000-8000-000000000011', 'Water Sports', 'ရေအားကစား', 50, 'sports-water')
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id, name_en = EXCLUDED.name_en, name_mm = EXCLUDED.name_mm,
  sort_order = EXCLUDED.sort_order, slug = EXCLUDED.slug;

INSERT INTO categories (id, parent_id, name_en, name_mm, sort_order, slug) VALUES
  ('c3500000-0000-4000-8000-000000000001', 'c2500000-0000-4000-8000-000000000001', 'Cardio Equipment', 'နှလုံးကြွက်သားကိရိယာ', 10, 'sports-cardio'),
  ('c3500000-0000-4000-8000-000000000002', 'c2500000-0000-4000-8000-000000000001', 'Strength Training', 'ကြွက်သားလေ့ကျင့်', 20, 'sports-strength'),
  ('c3500000-0000-4000-8000-000000000003', 'c2500000-0000-4000-8000-000000000001', 'Yoga & Pilates', 'ယောဂနှင့်ပီလေး', 30, 'sports-yoga'),
  ('c3500000-0000-4000-8000-000000000011', 'c2500000-0000-4000-8000-000000000002', 'Camping & Hiking', 'စခန်းချနှင့်တောင်တက်', 10, 'sports-camping'),
  ('c3500000-0000-4000-8000-000000000012', 'c2500000-0000-4000-8000-000000000002', 'Fishing', 'ငါးမျှား', 20, 'sports-fishing'),
  ('c3500000-0000-4000-8000-000000000021', 'c2500000-0000-4000-8000-000000000003', 'Football & Soccer', 'ဘောလုံး', 10, 'sports-football'),
  ('c3500000-0000-4000-8000-000000000022', 'c2500000-0000-4000-8000-000000000003', 'Basketball', 'ဘတ်စကက်ဘော', 20, 'sports-basketball'),
  ('c3500000-0000-4000-8000-000000000023', 'c2500000-0000-4000-8000-000000000003', 'Badminton & Tennis', 'ကြက်တောင်နှင့်တင်းနစ်', 30, 'sports-racket')
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id, name_en = EXCLUDED.name_en, name_mm = EXCLUDED.name_mm,
  sort_order = EXCLUDED.sort_order, slug = EXCLUDED.slug;

-- ============================================================================
-- BABY & KIDS
-- ============================================================================

INSERT INTO categories (id, parent_id, name_en, name_mm, sort_order, slug) VALUES
  ('c2700000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000012', 'Diapering', 'အနှီး', 10, 'baby-diapering'),
  ('c2700000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000012', 'Feeding', 'ကျွေးမွေးရေး', 20, 'baby-feeding'),
  ('c2700000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000012', 'Baby Care', 'မွေးကင်းစစောင့်ရှောက်မှု', 30, 'baby-care'),
  ('c2700000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000012', 'Toys', 'ကစားစရာ', 40, 'baby-toys'),
  ('c2700000-0000-4000-8000-000000000005', 'c1000000-0000-4000-8000-000000000012', 'Kids Fashion', 'ကလေးဖက်ရှင်', 50, 'baby-fashion'),
  ('c2700000-0000-4000-8000-000000000006', 'c1000000-0000-4000-8000-000000000012', 'Nursery', 'မွေးကင်းစအခန်း', 60, 'baby-nursery')
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id, name_en = EXCLUDED.name_en, name_mm = EXCLUDED.name_mm,
  sort_order = EXCLUDED.sort_order, slug = EXCLUDED.slug;

INSERT INTO categories (id, parent_id, name_en, name_mm, sort_order, slug) VALUES
  ('c3700000-0000-4000-8000-000000000001', 'c2700000-0000-4000-8000-000000000001', 'Diapers', 'အနှီး', 10, 'baby-diapers'),
  ('c3700000-0000-4000-8000-000000000002', 'c2700000-0000-4000-8000-000000000001', 'Wipes', 'သုတ်ပုဝါစို', 20, 'baby-wipes'),
  ('c3700000-0000-4000-8000-000000000011', 'c2700000-0000-4000-8000-000000000002', 'Formula & Baby Food', 'နို့မှုန့်နှင့်ကလေးအစားအစာ', 10, 'baby-food'),
  ('c3700000-0000-4000-8000-000000000012', 'c2700000-0000-4000-8000-000000000002', 'Bottles & Nursers', 'နို့ဗူး', 20, 'baby-bottles'),
  ('c3700000-0000-4000-8000-000000000021', 'c2700000-0000-4000-8000-000000000003', 'Bath & Skincare', 'ရေချိုးနှင့်အရေပြား', 10, 'baby-bath'),
  ('c3700000-0000-4000-8000-000000000022', 'c2700000-0000-4000-8000-000000000003', 'Health & Safety', 'ကျန်းမာရေးနှင့်ဘေးကင်းမှု', 20, 'baby-health'),
  ('c3700000-0000-4000-8000-000000000031', 'c2700000-0000-4000-8000-000000000004', 'Educational Toys', 'ပညာရေးကစားစရာ', 10, 'baby-edu-toys'),
  ('c3700000-0000-4000-8000-000000000032', 'c2700000-0000-4000-8000-000000000004', 'Outdoor Toys', 'ပြင်ပကစားစရာ', 20, 'baby-outdoor-toys'),
  ('c3700000-0000-4000-8000-000000000041', 'c2700000-0000-4000-8000-000000000005', 'Boys Clothing', 'ယောက်ျားလေးအဝတ်', 10, 'baby-boys'),
  ('c3700000-0000-4000-8000-000000000042', 'c2700000-0000-4000-8000-000000000005', 'Girls Clothing', 'မိန်းကလေးအဝတ်', 20, 'baby-girls')
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id, name_en = EXCLUDED.name_en, name_mm = EXCLUDED.name_mm,
  sort_order = EXCLUDED.sort_order, slug = EXCLUDED.slug;

-- ============================================================================
-- AUTOMOTIVE
-- ============================================================================

INSERT INTO categories (id, parent_id, name_en, name_mm, sort_order, slug) VALUES
  ('c2a00000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000013', 'Car Care', 'ကားထိန်းသိမ်းရေး', 10, 'auto-car-care'),
  ('c2a00000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000013', 'Oils & Fluids', 'ဆီနှင့်အရည်', 20, 'auto-oils'),
  ('c2a00000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000013', 'Exterior Accessories', 'အပြင်ဘက်ဆက်စပ်', 30, 'auto-exterior'),
  ('c2a00000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000013', 'Interior Accessories', 'အတွင်းဘက်ဆက်စပ်', 40, 'auto-interior'),
  ('c2a00000-0000-4000-8000-000000000005', 'c1000000-0000-4000-8000-000000000013', 'Motorcycle', 'ဆိုင်ကယ်', 50, 'auto-motorcycle'),
  ('c2a00000-0000-4000-8000-000000000006', 'c1000000-0000-4000-8000-000000000013', 'Tools & Equipment', 'ကိရိယာနှင့်စက်ပစ္စည်း', 60, 'auto-tools')
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id, name_en = EXCLUDED.name_en, name_mm = EXCLUDED.name_mm,
  sort_order = EXCLUDED.sort_order, slug = EXCLUDED.slug;

INSERT INTO categories (id, parent_id, name_en, name_mm, sort_order, slug) VALUES
  ('c3a00000-0000-4000-8000-000000000001', 'c2a00000-0000-4000-8000-000000000001', 'Wash & Wax', 'ဆေးနှင့်ဖယောင်း', 10, 'auto-wash'),
  ('c3a00000-0000-4000-8000-000000000002', 'c2a00000-0000-4000-8000-000000000001', 'Cleaning Kits', 'သန့်ရှင်းရေးအစုံ', 20, 'auto-cleaning-kits'),
  ('c3a00000-0000-4000-8000-000000000011', 'c2a00000-0000-4000-8000-000000000002', 'Engine Oil', 'အင်ဂျင်ဆီ', 10, 'auto-engine-oil'),
  ('c3a00000-0000-4000-8000-000000000012', 'c2a00000-0000-4000-8000-000000000002', 'Coolant & Brake Fluid', 'အအေးနှင့်ဘရိတ်အရည်', 20, 'auto-fluids'),
  ('c3a00000-0000-4000-8000-000000000021', 'c2a00000-0000-4000-8000-000000000005', 'Helmets', 'ဦးထုပ်ခေါင်းအုံး', 10, 'auto-helmets'),
  ('c3a00000-0000-4000-8000-000000000022', 'c2a00000-0000-4000-8000-000000000005', 'Motorcycle Parts', 'ဆိုင်ကယ်အစိတ်အပိုင်း', 20, 'auto-moto-parts')
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id, name_en = EXCLUDED.name_en, name_mm = EXCLUDED.name_mm,
  sort_order = EXCLUDED.sort_order, slug = EXCLUDED.slug;

-- ============================================================================
-- BOOKS & STATIONERY
-- ============================================================================

INSERT INTO categories (id, parent_id, name_en, name_mm, sort_order, slug) VALUES
  ('c2800000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000014', 'Books', 'စာအုပ်', 10, 'books'),
  ('c2800000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000014', 'School Supplies', 'ကျောင်းသုံးပစ္စည်း', 20, 'stationery-school'),
  ('c2800000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000014', 'Office Supplies', 'ရုံးသုံးပစ္စည်း', 30, 'stationery-office'),
  ('c2800000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000014', 'Art & Craft', 'အနုပညာနှင့်လက်မှု', 40, 'stationery-art')
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id, name_en = EXCLUDED.name_en, name_mm = EXCLUDED.name_mm,
  sort_order = EXCLUDED.sort_order, slug = EXCLUDED.slug;

INSERT INTO categories (id, parent_id, name_en, name_mm, sort_order, slug) VALUES
  ('c3800000-0000-4000-8000-000000000001', 'c2800000-0000-4000-8000-000000000001', 'Fiction', 'စိတ်ကူးယဉ်', 10, 'books-fiction'),
  ('c3800000-0000-4000-8000-000000000002', 'c2800000-0000-4000-8000-000000000001', 'Non-Fiction', 'အခြေခံအချက်အလက်', 20, 'books-nonfiction'),
  ('c3800000-0000-4000-8000-000000000003', 'c2800000-0000-4000-8000-000000000001', 'Children''s Books', 'ကလေးစာအုပ်', 30, 'books-children'),
  ('c3800000-0000-4000-8000-000000000004', 'c2800000-0000-4000-8000-000000000001', 'Educational', 'ပညာရေး', 40, 'books-educational'),
  ('c3800000-0000-4000-8000-000000000011', 'c2800000-0000-4000-8000-000000000002', 'Notebooks', 'မှတ်စုစာအုပ်', 10, 'stat-notebooks'),
  ('c3800000-0000-4000-8000-000000000012', 'c2800000-0000-4000-8000-000000000002', 'Pens & Pencils', 'ဘောပင်နှင့်ခဲတံ', 20, 'stat-pens'),
  ('c3800000-0000-4000-8000-000000000013', 'c2800000-0000-4000-8000-000000000002', 'Bags & Cases', 'ကျောင်းအိတ်', 30, 'stat-bags'),
  ('c3800000-0000-4000-8000-000000000021', 'c2800000-0000-4000-8000-000000000003', 'Paper & Printing', 'စက္ကူနှင့်ပုံနှိပ်', 10, 'stat-paper'),
  ('c3800000-0000-4000-8000-000000000022', 'c2800000-0000-4000-8000-000000000003', 'Desk Organizers', 'စားပွဲစီစဉ်', 20, 'stat-desk')
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id, name_en = EXCLUDED.name_en, name_mm = EXCLUDED.name_mm,
  sort_order = EXCLUDED.sort_order, slug = EXCLUDED.slug;

-- ============================================================================
-- PETS
-- ============================================================================

INSERT INTO categories (id, parent_id, name_en, name_mm, sort_order, slug) VALUES
  ('c2600000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000015', 'Dog', 'ခွေး', 10, 'pets-dog'),
  ('c2600000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000015', 'Cat', 'ကြောင်', 20, 'pets-cat'),
  ('c2600000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000015', 'Fish & Aquatics', 'ငါးနှင့်ရေသတ္တဝါ', 30, 'pets-fish'),
  ('c2600000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000015', 'Bird & Small Pets', 'ငှက်နှင့်သေးငယ်အိမ်မွေး', 40, 'pets-small'),
  ('c2600000-0000-4000-8000-000000000005', 'c1000000-0000-4000-8000-000000000015', 'Pet Health', 'အိမ်မွေးကျန်းမာရေး', 50, 'pets-health')
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id, name_en = EXCLUDED.name_en, name_mm = EXCLUDED.name_mm,
  sort_order = EXCLUDED.sort_order, slug = EXCLUDED.slug;

INSERT INTO categories (id, parent_id, name_en, name_mm, sort_order, slug) VALUES
  ('c3600000-0000-4000-8000-000000000001', 'c2600000-0000-4000-8000-000000000001', 'Dog Food', 'ခွေးအစာ', 10, 'pets-dog-food'),
  ('c3600000-0000-4000-8000-000000000002', 'c2600000-0000-4000-8000-000000000001', 'Dog Treats & Toys', 'ခွေးသရေစာနှင့်ကစားစရာ', 20, 'pets-dog-treats'),
  ('c3600000-0000-4000-8000-000000000003', 'c2600000-0000-4000-8000-000000000001', 'Dog Grooming', 'ခွေးအလှပြင်', 30, 'pets-dog-grooming'),
  ('c3600000-0000-4000-8000-000000000011', 'c2600000-0000-4000-8000-000000000002', 'Cat Food', 'ကြောင်အစာ', 10, 'pets-cat-food'),
  ('c3600000-0000-4000-8000-000000000012', 'c2600000-0000-4000-8000-000000000002', 'Litter & Accessories', 'အမှိုက်သဲနှင့်ဆက်စပ်', 20, 'pets-cat-litter'),
  ('c3600000-0000-4000-8000-000000000013', 'c2600000-0000-4000-8000-000000000002', 'Cat Toys', 'ကြောင်ကစားစရာ', 30, 'pets-cat-toys'),
  ('c3600000-0000-4000-8000-000000000021', 'c2600000-0000-4000-8000-000000000003', 'Aquarium Supplies', 'ငါးကန်ပစ္စည်း', 10, 'pets-aquarium'),
  ('c3600000-0000-4000-8000-000000000022', 'c2600000-0000-4000-8000-000000000003', 'Fish Food', 'ငါးအစာ', 20, 'pets-fish-food')
ON CONFLICT (id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id, name_en = EXCLUDED.name_en, name_mm = EXCLUDED.name_mm,
  sort_order = EXCLUDED.sort_order, slug = EXCLUDED.slug;

-- ---------------------------------------------------------------------------
-- Backfill specific emoji icons (aligned with 017). Safe if 017 already ran.
-- ---------------------------------------------------------------------------
UPDATE categories
SET emoji_icon = CASE name_en
  WHEN 'Beauty' THEN '💄'
  WHEN 'Electronics' THEN '💻'
  WHEN 'Fashion' THEN '👗'
  WHEN 'Home & Kitchen' THEN '🏠'
  WHEN 'Groceries' THEN '🛒'
  WHEN 'Sports & Outdoors' THEN '⚽'
  WHEN 'Baby & Kids' THEN '🍼'
  WHEN 'Automotive' THEN '🚗'
  WHEN 'Books & Stationery' THEN '📚'
  WHEN 'Pets' THEN '🐾'
  WHEN 'Cosmetics' THEN '✨'
  WHEN 'Pharmacy' THEN '💊'
  WHEN 'Personal Care' THEN '🛁'
  WHEN 'Fragrance' THEN '🌸'
  WHEN 'Hair Care' THEN '💇'
  WHEN 'Makeup' THEN '💄'
  WHEN 'Skincare' THEN '🧴'
  WHEN 'Nail Care' THEN '💅'
  WHEN 'Beauty Tools' THEN '🪞'
  WHEN 'Face' THEN '🙂'
  WHEN 'Eyes' THEN '👀'
  WHEN 'Lips' THEN '💋'
  WHEN 'Cheeks' THEN '😊'
  WHEN 'Makeup Sets' THEN '🎁'
  WHEN 'Cleansers' THEN '🧼'
  WHEN 'Toners' THEN '💧'
  WHEN 'Moisturizers' THEN '🧴'
  WHEN 'Serums & Treatments' THEN '🧪'
  WHEN 'Sunscreen' THEN '☀️'
  WHEN 'Masks' THEN '😷'
  WHEN 'Eye Care' THEN '👁️'
  WHEN 'Supplements' THEN '💊'
  WHEN 'OTC Medicine' THEN '💉'
  WHEN 'First Aid' THEN '🩹'
  WHEN 'Medical Devices' THEN '🩺'
  WHEN 'Vitamins' THEN '🍊'
  WHEN 'Minerals' THEN '🪨'
  WHEN 'Protein & Sports Nutrition' THEN '💪'
  WHEN 'Herbal Supplements' THEN '🌿'
  WHEN 'Bath & Body' THEN '🛁'
  WHEN 'Oral Care' THEN '🦷'
  WHEN 'Men''s Grooming' THEN '🧔'
  WHEN 'Feminine Care' THEN '♀️'
  WHEN 'Shower Gel' THEN '🚿'
  WHEN 'Body Lotion' THEN '🧴'
  WHEN 'Hand Care' THEN '🖐️'
  WHEN 'Deodorant' THEN '💨'
  WHEN 'Soap Bars' THEN '🧼'
  WHEN 'Shampoo' THEN '🫧'
  WHEN 'Conditioner' THEN '💆'
  WHEN 'Hair Treatments' THEN '✨'
  WHEN 'Hair Styling' THEN '💇'
  WHEN 'Hair Color' THEN '🎨'
  WHEN 'Women''s Fragrance' THEN '🌸'
  WHEN 'Men''s Fragrance' THEN '🪵'
  WHEN 'Unisex & Sets' THEN '🎁'
  WHEN 'Mobile & Tablets' THEN '📱'
  WHEN 'Computers' THEN '🖥️'
  WHEN 'TV & AV' THEN '📺'
  WHEN 'Audio' THEN '🎧'
  WHEN 'Cameras' THEN '📷'
  WHEN 'Wearables' THEN '⌚'
  WHEN 'Gaming' THEN '🎮'
  WHEN 'Accessories' THEN '🔌'
  WHEN 'Smartphones' THEN '📱'
  WHEN 'Tablets' THEN '📲'
  WHEN 'Feature Phones' THEN '☎️'
  WHEN 'Mobile Accessories' THEN '🔋'
  WHEN 'Laptops' THEN '💻'
  WHEN 'Desktops' THEN '🖥️'
  WHEN 'Monitors' THEN '🖥️'
  WHEN 'Storage & Drives' THEN '💾'
  WHEN 'PC Components' THEN '🧩'
  WHEN 'Televisions' THEN '📺'
  WHEN 'Streaming Devices' THEN '📡'
  WHEN 'Projectors' THEN '📽️'
  WHEN 'Headphones' THEN '🎧'
  WHEN 'Speakers' THEN '🔊'
  WHEN 'Home Theater' THEN '🎬'
  WHEN 'Consoles' THEN '🕹️'
  WHEN 'Games' THEN '👾'
  WHEN 'Gaming Accessories' THEN '🎛️'
  WHEN 'Chargers & Cables' THEN '🔌'
  WHEN 'Cases & Covers' THEN '📱'
  WHEN 'Power Banks' THEN '🔋'
  WHEN 'Screen Protectors' THEN '🛡️'
  WHEN 'CPUs' THEN '🧠'
  WHEN 'GPU' THEN '🖼️'
  WHEN 'RAM' THEN '📟'
  WHEN 'Motherboards' THEN '🧱'
  WHEN 'Women''s Clothing' THEN '👚'
  WHEN 'Men''s Clothing' THEN '👔'
  WHEN 'Shoes' THEN '👟'
  WHEN 'Bags & Luggage' THEN '👜'
  WHEN 'Watches & Jewelry' THEN '💎'
  WHEN 'Dresses' THEN '👗'
  WHEN 'Tops & Blouses' THEN '👚'
  WHEN 'Bottoms' THEN '👖'
  WHEN 'Outerwear' THEN '🧥'
  WHEN 'Activewear' THEN '🏃'
  WHEN 'Shirts & Polos' THEN '👔'
  WHEN 'T-Shirts' THEN '👕'
  WHEN 'Pants & Jeans' THEN '👖'
  WHEN 'Sneakers' THEN '👟'
  WHEN 'Sandals & Flip-Flops' THEN '🩴'
  WHEN 'Formal Shoes' THEN '👞'
  WHEN 'Boots' THEN '🥾'
  WHEN 'Handbags' THEN '👜'
  WHEN 'Backpacks' THEN '🎒'
  WHEN 'Travel Luggage' THEN '🧳'
  WHEN 'Belts' THEN '🪢'
  WHEN 'Hats & Caps' THEN '🧢'
  WHEN 'Scarves & Gloves' THEN '🧣'
  WHEN 'Sunglasses' THEN '🕶️'
  WHEN 'Kitchenware' THEN '🍳'
  WHEN 'Home Appliances' THEN '🔌'
  WHEN 'Furniture' THEN '🛋️'
  WHEN 'Bedding & Bath' THEN '🛏️'
  WHEN 'Home Decor' THEN '🖼️'
  WHEN 'Storage & Organization' THEN '📦'
  WHEN 'Cleaning Supplies' THEN '🧹'
  WHEN 'Cookware' THEN '🍳'
  WHEN 'Bakeware' THEN '🧁'
  WHEN 'Utensils & Gadgets' THEN '🥄'
  WHEN 'Dinnerware' THEN '🍽️'
  WHEN 'Drinkware' THEN '☕'
  WHEN 'Food Storage' THEN '🫙'
  WHEN 'Kitchen Appliances' THEN '🍲'
  WHEN 'Cleaning Appliances' THEN '🧹'
  WHEN 'Climate Control' THEN '❄️'
  WHEN 'Living Room' THEN '🛋️'
  WHEN 'Bedroom' THEN '🛏️'
  WHEN 'Office Furniture' THEN '🪑'
  WHEN 'Bed Linens' THEN '🛏️'
  WHEN 'Towels' THEN '🧺'
  WHEN 'Bathroom Accessories' THEN '🚽'
  WHEN 'Pots & Pans' THEN '🥘'
  WHEN 'Knife Sets' THEN '🔪'
  WHEN 'Cutting Boards' THEN '🪵'
  WHEN 'Blenders & Mixers' THEN '🥤'
  WHEN 'Rice Cookers' THEN '🍚'
  WHEN 'Coffee Makers' THEN '☕'
  WHEN 'Electric Kettles' THEN '🫖'
  WHEN 'Vacuum Cleaners' THEN '🧹'
  WHEN 'Irons & Steamers' THEN '♨️'
  WHEN 'Fresh Food' THEN '🥗'
  WHEN 'Pantry Staples' THEN '🧂'
  WHEN 'Beverages' THEN '🧃'
  WHEN 'Snacks & Sweets' THEN '🍪'
  WHEN 'Dairy & Eggs' THEN '🥛'
  WHEN 'Frozen' THEN '🧊'
  WHEN 'Fruits' THEN '🍎'
  WHEN 'Vegetables' THEN '🥦'
  WHEN 'Meat & Seafood' THEN '🥩'
  WHEN 'Rice & Grains' THEN '🌾'
  WHEN 'Oils & Sauces' THEN '🫒'
  WHEN 'Noodles & Pasta' THEN '🍜'
  WHEN 'Canned & Jarred' THEN '🥫'
  WHEN 'Spices & Seasonings' THEN '🌶️'
  WHEN 'Water & Soft Drinks' THEN '🥤'
  WHEN 'Tea & Coffee' THEN '🍵'
  WHEN 'Juice & Milk Alternatives' THEN '🧃'
  WHEN 'Chips & Crackers' THEN '🥨'
  WHEN 'Chocolate & Candy' THEN '🍫'
  WHEN 'Biscuits & Cookies' THEN '🍪'
  WHEN 'Chicken' THEN '🍗'
  WHEN 'Beef & Pork' THEN '🥩'
  WHEN 'Fish & Seafood' THEN '🐟'
  WHEN 'White Rice' THEN '🍚'
  WHEN 'Brown & Specialty Rice' THEN '🌾'
  WHEN 'Beans & Lentils' THEN '🫘'
  WHEN 'Exercise & Fitness' THEN '🏋️'
  WHEN 'Outdoor Recreation' THEN '🏕️'
  WHEN 'Team Sports' THEN '🏟️'
  WHEN 'Cycling' THEN '🚴'
  WHEN 'Water Sports' THEN '🏊'
  WHEN 'Cardio Equipment' THEN '🏃'
  WHEN 'Strength Training' THEN '🏋️'
  WHEN 'Yoga & Pilates' THEN '🧘'
  WHEN 'Camping & Hiking' THEN '⛺'
  WHEN 'Fishing' THEN '🎣'
  WHEN 'Football & Soccer' THEN '⚽'
  WHEN 'Basketball' THEN '🏀'
  WHEN 'Badminton & Tennis' THEN '🏸'
  WHEN 'Diapering' THEN '🧷'
  WHEN 'Feeding' THEN '🍼'
  WHEN 'Baby Care' THEN '👶'
  WHEN 'Toys' THEN '🧸'
  WHEN 'Kids Fashion' THEN '🧒'
  WHEN 'Nursery' THEN '🛏️'
  WHEN 'Diapers' THEN '🧷'
  WHEN 'Wipes' THEN '🧻'
  WHEN 'Formula & Baby Food' THEN '🍼'
  WHEN 'Bottles & Nursers' THEN '🍼'
  WHEN 'Bath & Skincare' THEN '🛁'
  WHEN 'Health & Safety' THEN '⛑️'
  WHEN 'Educational Toys' THEN '🧩'
  WHEN 'Outdoor Toys' THEN '🪁'
  WHEN 'Boys Clothing' THEN '👦'
  WHEN 'Girls Clothing' THEN '👧'
  WHEN 'Car Care' THEN '🧽'
  WHEN 'Oils & Fluids' THEN '🛢️'
  WHEN 'Exterior Accessories' THEN '🚦'
  WHEN 'Interior Accessories' THEN '🪑'
  WHEN 'Motorcycle' THEN '🏍️'
  WHEN 'Tools & Equipment' THEN '🔧'
  WHEN 'Wash & Wax' THEN '✨'
  WHEN 'Cleaning Kits' THEN '🧽'
  WHEN 'Engine Oil' THEN '🛢️'
  WHEN 'Coolant & Brake Fluid' THEN '💧'
  WHEN 'Helmets' THEN '⛑️'
  WHEN 'Motorcycle Parts' THEN '⚙️'
  WHEN 'Books' THEN '📖'
  WHEN 'School Supplies' THEN '✏️'
  WHEN 'Office Supplies' THEN '🖇️'
  WHEN 'Art & Craft' THEN '🎨'
  WHEN 'Fiction' THEN '📕'
  WHEN 'Non-Fiction' THEN '📘'
  WHEN 'Children''s Books' THEN '📗'
  WHEN 'Educational' THEN '📙'
  WHEN 'Notebooks' THEN '📓'
  WHEN 'Pens & Pencils' THEN '🖊️'
  WHEN 'Bags & Cases' THEN '🎒'
  WHEN 'Paper & Printing' THEN '📄'
  WHEN 'Desk Organizers' THEN '🗂️'
  WHEN 'Dog' THEN '🐶'
  WHEN 'Cat' THEN '🐱'
  WHEN 'Fish & Aquatics' THEN '🐠'
  WHEN 'Bird & Small Pets' THEN '🐦'
  WHEN 'Pet Health' THEN '🩺'
  WHEN 'Dog Food' THEN '🦴'
  WHEN 'Dog Treats & Toys' THEN '🎾'
  WHEN 'Dog Grooming' THEN '✂️'
  WHEN 'Cat Food' THEN '🐟'
  WHEN 'Litter & Accessories' THEN '📦'
  WHEN 'Cat Toys' THEN '🧶'
  WHEN 'Aquarium Supplies' THEN '🫧'
  WHEN 'Fish Food' THEN '🦐'
  ELSE COALESCE(NULLIF(btrim(emoji_icon), ''), '📦')
END
WHERE emoji_icon IS NULL
   OR btrim(emoji_icon) = ''
   OR emoji_icon = '📦'
   OR emoji_icon = '🏷️';

UPDATE categories
SET emoji_icon = CASE
  WHEN name_en ILIKE '%water sport%' OR name_en ILIKE '%swim%' THEN '🏊'
  WHEN name_en ILIKE '%exercise%' OR name_en ILIKE '%fitness%' OR name_en ILIKE '%gym%' THEN '🏋️'
  WHEN name_en ILIKE '%yoga%' THEN '🧘'
  WHEN name_en ILIKE '%cycl%' OR name_en ILIKE '%bike%' THEN '🚴'
  WHEN name_en ILIKE '%camp%' OR name_en ILIKE '%hike%' THEN '⛺'
  WHEN name_en ILIKE '%fish%' THEN '🎣'
  WHEN name_en ILIKE '%beauty%' OR name_en ILIKE '%cosmetic%' OR name_en ILIKE '%makeup%' THEN '💄'
  WHEN name_en ILIKE '%phone%' OR name_en ILIKE '%mobile%' THEN '📱'
  WHEN name_en ILIKE '%computer%' OR name_en ILIKE '%laptop%' THEN '💻'
  WHEN name_en ILIKE '%shoe%' OR name_en ILIKE '%sneaker%' THEN '👟'
  WHEN name_en ILIKE '%kitchen%' OR name_en ILIKE '%cook%' THEN '🍳'
  WHEN name_en ILIKE '%grocery%' OR name_en ILIKE '%food%' THEN '🛒'
  WHEN name_en ILIKE '%baby%' OR name_en ILIKE '%kids%' OR name_en ILIKE '%child%' THEN '🍼'
  WHEN name_en ILIKE '%pet%' OR name_en ILIKE '%dog%' OR name_en ILIKE '%cat%' THEN '🐾'
  WHEN name_en ILIKE '%book%' THEN '📚'
  WHEN name_en ILIKE '%car%' OR name_en ILIKE '%auto%' OR name_en ILIKE '%motor%' THEN '🚗'
  WHEN name_en ILIKE '%sport%' THEN '⚽'
  WHEN name_en ILIKE '%home%' OR name_en ILIKE '%furniture%' THEN '🏠'
  WHEN name_en ILIKE '%fashion%' OR name_en ILIKE '%cloth%' THEN '👗'
  WHEN name_en ILIKE '%electronic%' THEN '💻'
  ELSE '📦'
END
WHERE emoji_icon IS NULL
   OR btrim(emoji_icon) = ''
   OR emoji_icon = '🏷️';

-- Keep a safe default for future inserts that omit emoji_icon
ALTER TABLE categories
  ALTER COLUMN emoji_icon SET DEFAULT '📦';

ALTER TABLE categories
  ALTER COLUMN emoji_icon SET NOT NULL;

ALTER TABLE categories
  DROP CONSTRAINT IF EXISTS categories_emoji_icon_required;

ALTER TABLE categories
  ADD CONSTRAINT categories_emoji_icon_required
  CHECK (length(btrim(emoji_icon)) > 0 AND emoji_icon <> '🏷️');

-- ---------------------------------------------------------------------------
-- Sanity checks (optional — comment out if you prefer silent seed)
-- ---------------------------------------------------------------------------
-- SELECT parent_id IS NULL AS is_root, count(*) FROM categories GROUP BY 1;
-- SELECT * FROM category_descendant_ids('c1000000-0000-4000-8000-000000000006'); -- Beauty tree
