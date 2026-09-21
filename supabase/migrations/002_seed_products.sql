-- Seed products + default announcement
-- Prefer fixed UUIDs so re-runs are idempotent.

INSERT INTO products (
  id, name_en, name_mm, description_en, description_mm,
  price, discount_price, image_url, stock_quantity
)
VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Wireless Headphones',
    'ကြိုးမဲ့နားကြပ်',
    'Comfortable over-ear headphones with clear sound and long battery life.',
    'ကြည်လင်သောအသံနှင့် ဘက်ထရီကြာရှည်ခံသော နားကြပ်။',
    89000, 69000,
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    24
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Minimal Desk Lamp',
    'စားပွဲမီးအိမ်',
    'Soft LED desk lamp with adjustable brightness for work and reading.',
    'အလုပ်နှင့်စာဖတ်ရန် တောက်ပမှုချိန်နိုင်သော LED မီးအိမ်။',
    45000, NULL,
    'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    40
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Cotton Everyday Tee',
    'နေ့စဉ်ဝတ်တီရှပ်',
    'Soft cotton t-shirt with a clean fit. Available in neutral tones.',
    'ပျော့ပျောင်းသော ချည်သားတီရှပ်။ အရောင်သင်းသင်းများ။',
    22000, 18000,
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    60
  ),
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'Ceramic Mug Set',
    'ကြွေခွက်အစုံ',
    'Set of two matte ceramic mugs — simple and durable for daily use.',
    'နေ့စဉ်သုံးရန် ကြွေခွက်နှစ်လုံးအစုံ။',
    28000, NULL,
    'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80',
    35
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'Portable Power Bank',
    'ပါဝါဘဏ်',
    '10,000mAh slim power bank with dual USB output.',
    'USB အထွက်နှစ်ခုပါ 10,000mAh ပါဝါဘဏ်။',
    35000, 27500,
    'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80',
    50
  ),
  (
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    'Leather Card Holder',
    'ကတ်အိတ်',
    'Slim leather card holder for everyday essentials.',
    'နေ့စဉ်သုံး ကတ်အိတ်ပါးပါး။',
    18000, NULL,
    'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80',
    8
  )
ON CONFLICT (id) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_mm = EXCLUDED.name_mm,
  description_en = EXCLUDED.description_en,
  description_mm = EXCLUDED.description_mm,
  price = EXCLUDED.price,
  discount_price = EXCLUDED.discount_price,
  image_url = EXCLUDED.image_url,
  stock_quantity = EXCLUDED.stock_quantity;

INSERT INTO store_settings (
  id, announcement_text_en, announcement_text_mm, is_active
)
VALUES (
  '99999999-9999-9999-9999-999999999999',
  'Welcome to The supplier Kaung Set — free delivery on orders over Ks 50,000.',
  'The supplier Kaung Set မှ ကြိုဆိုပါတယ် — ကျပ် ၅၀,၀၀၀ အထက် အခမဲ့ပို့ဆောင်ပေးပါသည်။',
  true
)
ON CONFLICT (id) DO UPDATE SET
  announcement_text_en = EXCLUDED.announcement_text_en,
  announcement_text_mm = EXCLUDED.announcement_text_mm,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- After creating your admin auth user in the dashboard, promote them with:
-- UPDATE profiles SET role = 'admin' WHERE id = '<auth-user-uuid>';
