-- Quick verify / force-seed category emojis for storefront filters
-- Safe to re-run. Ensures emoji_icon column exists, then assigns icons.

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS emoji_icon TEXT;

-- Top-level roots
UPDATE categories SET emoji_icon = '💄' WHERE id = 'c1000000-0000-4000-8000-000000000006'; -- Beauty
UPDATE categories SET emoji_icon = '💻' WHERE id = 'c1000000-0000-4000-8000-000000000001'; -- Electronics
UPDATE categories SET emoji_icon = '👗' WHERE id = 'c1000000-0000-4000-8000-000000000004'; -- Fashion
UPDATE categories SET emoji_icon = '🏠' WHERE id = 'c1000000-0000-4000-8000-000000000005'; -- Home & Kitchen
UPDATE categories SET emoji_icon = '🛒' WHERE id = 'c1000000-0000-4000-8000-000000000010'; -- Groceries
UPDATE categories SET emoji_icon = '⚽' WHERE id = 'c1000000-0000-4000-8000-000000000011'; -- Sports
UPDATE categories SET emoji_icon = '🍼' WHERE id = 'c1000000-0000-4000-8000-000000000012'; -- Baby & Kids
UPDATE categories SET emoji_icon = '🚗' WHERE id = 'c1000000-0000-4000-8000-000000000013'; -- Automotive
UPDATE categories SET emoji_icon = '📚' WHERE id = 'c1000000-0000-4000-8000-000000000014'; -- Books
UPDATE categories SET emoji_icon = '🐾' WHERE id = 'c1000000-0000-4000-8000-000000000015'; -- Pets

-- Common nested
UPDATE categories SET emoji_icon = '✨' WHERE id = 'c2b00000-0000-4000-8000-000000000001'; -- Cosmetics
UPDATE categories SET emoji_icon = '💊' WHERE id = 'c2b00000-0000-4000-8000-000000000002'; -- Pharmacy
UPDATE categories SET emoji_icon = '🛁' WHERE id = 'c2b00000-0000-4000-8000-000000000003'; -- Personal Care
UPDATE categories SET emoji_icon = '📱' WHERE id = 'c2e00000-0000-4000-8000-000000000001'; -- Mobile
UPDATE categories SET emoji_icon = '🖥️' WHERE id = 'c2e00000-0000-4000-8000-000000000002'; -- Computers
UPDATE categories SET emoji_icon = '🍳' WHERE id = 'c1000000-0000-4000-8000-000000000002'; -- Kitchenware
UPDATE categories SET emoji_icon = '👟' WHERE id = 'c1000000-0000-4000-8000-000000000003'; -- Shoes

-- Anything still empty
UPDATE categories
SET emoji_icon = '🏷️'
WHERE emoji_icon IS NULL OR btrim(emoji_icon) = '';

-- Spot-check
-- SELECT name_en, emoji_icon FROM categories WHERE parent_id IS NULL ORDER BY sort_order;
