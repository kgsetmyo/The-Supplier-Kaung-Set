-- 015 — Category emoji icons (cute minimalist storefront menu)
-- Prerequisites: 007/011 (categories table)
-- Safe to re-run.

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS emoji_icon TEXT;

COMMENT ON COLUMN categories.emoji_icon IS
  'Optional emoji glyph for storefront category menus (e.g. 💄, 💻).';

-- Seed emojis for known roots + common branches (by fixed seed UUIDs from 010/012)
UPDATE categories SET emoji_icon = '💄' WHERE id = 'c1000000-0000-4000-8000-000000000006' AND (emoji_icon IS NULL OR emoji_icon = ''); -- Beauty
UPDATE categories SET emoji_icon = '💻' WHERE id = 'c1000000-0000-4000-8000-000000000001' AND (emoji_icon IS NULL OR emoji_icon = ''); -- Electronics
UPDATE categories SET emoji_icon = '👗' WHERE id = 'c1000000-0000-4000-8000-000000000004' AND (emoji_icon IS NULL OR emoji_icon = ''); -- Fashion
UPDATE categories SET emoji_icon = '🏠' WHERE id = 'c1000000-0000-4000-8000-000000000005' AND (emoji_icon IS NULL OR emoji_icon = ''); -- Home & Kitchen
UPDATE categories SET emoji_icon = '🛒' WHERE id = 'c1000000-0000-4000-8000-000000000010' AND (emoji_icon IS NULL OR emoji_icon = ''); -- Groceries
UPDATE categories SET emoji_icon = '⚽' WHERE id = 'c1000000-0000-4000-8000-000000000011' AND (emoji_icon IS NULL OR emoji_icon = ''); -- Sports
UPDATE categories SET emoji_icon = '🍼' WHERE id = 'c1000000-0000-4000-8000-000000000012' AND (emoji_icon IS NULL OR emoji_icon = ''); -- Baby & Kids
UPDATE categories SET emoji_icon = '🚗' WHERE id = 'c1000000-0000-4000-8000-000000000013' AND (emoji_icon IS NULL OR emoji_icon = ''); -- Automotive
UPDATE categories SET emoji_icon = '📚' WHERE id = 'c1000000-0000-4000-8000-000000000014' AND (emoji_icon IS NULL OR emoji_icon = ''); -- Books
UPDATE categories SET emoji_icon = '🐾' WHERE id = 'c1000000-0000-4000-8000-000000000015' AND (emoji_icon IS NULL OR emoji_icon = ''); -- Pets

-- Nested examples (Beauty / Electronics / Home)
UPDATE categories SET emoji_icon = '✨' WHERE id = 'c2b00000-0000-4000-8000-000000000001' AND (emoji_icon IS NULL OR emoji_icon = ''); -- Cosmetics
UPDATE categories SET emoji_icon = '💊' WHERE id = 'c2b00000-0000-4000-8000-000000000002' AND (emoji_icon IS NULL OR emoji_icon = ''); -- Pharmacy
UPDATE categories SET emoji_icon = '🛁' WHERE id = 'c2b00000-0000-4000-8000-000000000003' AND (emoji_icon IS NULL OR emoji_icon = ''); -- Personal Care
UPDATE categories SET emoji_icon = '📱' WHERE id = 'c2e00000-0000-4000-8000-000000000001' AND (emoji_icon IS NULL OR emoji_icon = ''); -- Mobile
UPDATE categories SET emoji_icon = '🖥️' WHERE id = 'c2e00000-0000-4000-8000-000000000002' AND (emoji_icon IS NULL OR emoji_icon = ''); -- Computers
UPDATE categories SET emoji_icon = '🍳' WHERE id = 'c1000000-0000-4000-8000-000000000002' AND (emoji_icon IS NULL OR emoji_icon = ''); -- Kitchenware
UPDATE categories SET emoji_icon = '👟' WHERE id = 'c1000000-0000-4000-8000-000000000003' AND (emoji_icon IS NULL OR emoji_icon = ''); -- Shoes

-- Fallback for any remaining rows without an icon
UPDATE categories
SET emoji_icon = '🏷️'
WHERE emoji_icon IS NULL OR btrim(emoji_icon) = '';
