-- ============================================================
-- SEED PRODUCTS FOR ALL CATEGORIES
-- Run this after ensuring categories exist in the database
-- ============================================================

-- ============================================================
-- 1. STONES (type = 'stones')
-- ============================================================

-- Insert stone products
INSERT INTO "Product" (id, slug, "categoryId", type, "nameFA", "nameEN", "descriptionFA", "descriptionEN", price, currency, stock, "isActive", "isFeatured", "isBestSeller", "tagsEN", "tagsFA")
VALUES
  -- Amethyst
  ('stone-001', 'amethyst', (SELECT id FROM "Category" WHERE slug = 'stones' LIMIT 1), 'stones',
   'آمیتیست', 'Amethyst',
   'سنگی برای آرامش ذهن و تقویت شهود. مناسب برای مدیتیشن و خواب آرام.',
   'A stone for peace of mind and enhancing intuition. Ideal for meditation and restful sleep.',
   250000, 'IRT', 50, true, true, false,
   ARRAY['PROTECTION', 'HEALING', 'CLARITY', 'SPIRITUAL'],
   ARRAY['محافظت', 'شفا', 'شفافیت', 'معنوی']),

  -- Rose Quartz
  ('stone-002', 'rose-quartz', (SELECT id FROM "Category" WHERE slug = 'stones' LIMIT 1), 'stones',
   'کوارتز رز', 'Rose Quartz',
   'سنگ عشق و شفقت. قلب را باز می‌کند و انرژی عشق بی‌قید و شرط را تقویت می‌کند.',
   'The stone of love and compassion. Opens the heart and amplifies unconditional love energy.',
   180000, 'IRT', 45, true, true, false,
   ARRAY['LOVE', 'HEALING', 'COMPASSION', 'HEART'],
   ARRAY['عشق', 'شفا', 'شفقت', 'قلب']),

  -- Citrine
  ('stone-003', 'citrine', (SELECT id FROM "Category" WHERE slug = 'stones' LIMIT 1), 'stones',
   'سیترین', 'Citrine',
   'سنگ فراوانی و موفقیت. انرژی مثبت و اعتماد به نفس را افزایش می‌دهد.',
   'The stone of abundance and success. Boosts positive energy and self-confidence.',
   320000, 'IRT', 30, true, false, true,
   ARRAY['ABUNDANCE', 'JOY', 'CONFIDENCE', 'MANIFESTATION'],
   ARRAY['فراوانی', 'شادی', 'اعتماد به نفس', 'تجلی']),

  -- Black Tourmaline
  ('stone-004', 'black-tourmaline', (SELECT id FROM "Category" WHERE slug = 'stones' LIMIT 1), 'stones',
   'تورمالین سیاه', 'Black Tourmaline',
   'قوی‌ترین سنگ محافظتی. انرژی‌های منفی را دفع می‌کند و میدان انرژی را پاکسازی می‌کند.',
   'The strongest protection stone. Repels negative energies and cleanses the energy field.',
   280000, 'IRT', 35, true, false, false,
   ARRAY['PROTECTION', 'SHIELD', 'GROUNDING', 'CLEANSING'],
   ARRAY['محافظت', 'سپر', 'زمین‌کردن', 'پاکسازی']),

  -- Labradorite
  ('stone-005', 'labradorite', (SELECT id FROM "Category" WHERE slug = 'stones' LIMIT 1), 'stones',
   'لابرادوریت', 'Labradorite',
   'سنگ تحول و جادو. شهود را تقویت می‌کند و به تحولات مثبت کمک می‌کند.',
   'The stone of transformation and magic. Enhances intuition and supports positive change.',
   350000, 'IRT', 20, true, false, false,
   ARRAY['MANIFESTATION', 'MAGIC', 'TRANSFORMATION', 'INTUITION'],
   ARRAY['تجلی', 'جادو', 'تحول', 'شهود']),

  -- Clear Quartz
  ('stone-006', 'clear-quartz', (SELECT id FROM "Category" WHERE slug = 'stones' LIMIT 1), 'stones',
   'کوارتز شفاف', 'Clear Quartz',
   'استاد شفابخش. انرژی را تقویت می‌کند و برای هر نوع کار انرژی مناسب است.',
   'The master healer. Amplifies energy and is suitable for all types of energy work.',
   150000, 'IRT', 60, true, true, true,
   ARRAY['HEALING', 'CLARITY', 'AMPLIFY', 'BALANCE'],
   ARRAY['شفا', 'شفافیت', 'تقویت', 'تعادل']),

  -- Selenite
  ('stone-007', 'selenite', (SELECT id FROM "Category" WHERE slug = 'stones' LIMIT 1), 'stones',
   'سلنیت', 'Selenite',
   'سنگ پاکسازی و شفافیت. انرژی‌های راکد را پاک می‌کند و ارتباط با خود برتر را تقویت می‌کند.',
   'The stone of cleansing and clarity. Clears stagnant energy and enhances connection to higher self.',
   220000, 'IRT', 25, true, false, false,
   ARRAY['CLEANSING', 'CLARITY', 'HEALING', 'SPIRITUAL'],
   ARRAY['پاکسازی', 'شفافیت', 'شفا', 'معنوی']);

-- Add images for stones
INSERT INTO "ProductImage" (id, url, "altFA", "sortOrder", "productId")
VALUES
  ('stone-img-01', '/images/products/amethyst-1.webp', 'آمیتیست', 0, 'stone-001'),
  ('stone-img-02', '/images/products/rose-quartz-1.webp', 'کوارتز رز', 0, 'stone-002'),
  ('stone-img-03', '/images/products/citrine-1.webp', 'سیترین', 0, 'stone-003'),
  ('stone-img-04', '/images/products/black-tourmaline-1.webp', 'تورمالین سیاه', 0, 'stone-004'),
  ('stone-img-05', '/images/products/labradorite-1.webp', 'لابرادوریت', 0, 'stone-005'),
  ('stone-img-06', '/images/products/clear-quartz-1.webp', 'کوارتز شفاف', 0, 'stone-006'),
  ('stone-img-07', '/images/products/selenite-1.webp', 'سلنیت', 0, 'stone-007');

-- Add attributes for stones (hardness, chakra, origin)
INSERT INTO "ProductAttribute" (id, key, "valueFA", "valueEN", "sortOrder", "productId")
VALUES
  -- Amethyst
  ('stone-attr-01a', 'hardness', '۷', '7', 0, 'stone-001'),
  ('stone-attr-01b', 'chakra', 'چاکرای چشم سوم', 'Third Eye Chakra', 1, 'stone-001'),
  ('stone-attr-01c', 'origin', 'برزیل', 'Brazil', 2, 'stone-001'),
  -- Rose Quartz
  ('stone-attr-02a', 'hardness', '۷', '7', 0, 'stone-002'),
  ('stone-attr-02b', 'chakra', 'چاکرای قلب', 'Heart Chakra', 1, 'stone-002'),
  ('stone-attr-02c', 'origin', 'ماداگاسکار', 'Madagascar', 2, 'stone-002'),
  -- Citrine
  ('stone-attr-03a', 'hardness', '۷', '7', 0, 'stone-003'),
  ('stone-attr-03b', 'chakra', 'چاکرای خورشیدی', 'Solar Plexus Chakra', 1, 'stone-003'),
  ('stone-attr-03c', 'origin', 'برزیل', 'Brazil', 2, 'stone-003'),
  -- Black Tourmaline
  ('stone-attr-04a', 'hardness', '۷', '7.5', 0, 'stone-004'),
  ('stone-attr-04b', 'chakra', 'چاکرای ریشه', 'Root Chakra', 1, 'stone-004'),
  ('stone-attr-04c', 'origin', 'افغانستان', 'Afghanistan', 2, 'stone-004'),
  -- Labradorite
  ('stone-attr-05a', 'hardness', '۶', '6.5', 0, 'stone-005'),
  ('stone-attr-05b', 'chakra', 'چاکرای چشم سوم', 'Third Eye Chakra', 1, 'stone-005'),
  ('stone-attr-05c', 'origin', 'کانادا', 'Canada', 2, 'stone-005'),
  -- Clear Quartz
  ('stone-attr-06a', 'hardness', '۷', '7', 0, 'stone-006'),
  ('stone-attr-06b', 'chakra', 'همه چاکراها', 'All Chakras', 1, 'stone-006'),
  ('stone-attr-06c', 'origin', 'برزیل', 'Brazil', 2, 'stone-006'),
  -- Selenite
  ('stone-attr-07a', 'hardness', '۲', '2', 0, 'stone-007'),
  ('stone-attr-07b', 'chakra', 'چاکرای تاج', 'Crown Chakra', 1, 'stone-007'),
  ('stone-attr-07c', 'origin', 'مکزیک', 'Mexico', 2, 'stone-007');


-- ============================================================
-- 2. CLOTHES (type = 'clothes')
-- ============================================================

INSERT INTO "Product" (id, slug, "categoryId", type, "nameFA", "nameEN", "descriptionFA", "descriptionEN", price, currency, stock, "isActive", "isFeatured", "isBestSeller", "tagsEN", "tagsFA")
VALUES
  ('cloth-001', 'meditation-mantle', (SELECT id FROM "Category" WHERE slug = 'clothes' LIMIT 1), 'clothes',
   'شنل مدیتیشن', 'Meditation Mantle',
   'شنل نرم و راحت برای مدیتیشن و تمرینات معنوی. از پارچه ارگانیک با ارتعاش بالا.',
   'Soft and comfortable mantle for meditation and spiritual practice. Made from high-vibration organic fabric.',
   580000, 'IRT', 20, true, true, false,
   ARRAY['MEDITATION', 'SPIRITUAL', 'ORGANIC'],
   ARRAY['مدیتیشن', 'معنوی', 'ارگانیک']),

  ('cloth-002', 'yoga-tunic', (SELECT id FROM "Category" WHERE slug = 'clothes' LIMIT 1), 'clothes',
   'تونیک یوگا', 'Yoga Tunic',
   'تونیک سبک و آزاد برای یوگا و حرکات کششی. طراحی شده برای آزادی حرکت کامل.',
   'Lightweight and loose tunic for yoga and stretching. Designed for complete freedom of movement.',
   420000, 'IRT', 30, true, false, true,
   ARRAY['YOGA', 'COMFORT', 'COTTON'],
   ARRAY['یوگا', 'راحتی', 'پنبه']),

  ('cloth-003', 'ceremonial-robe', (SELECT id FROM "Category" WHERE slug = 'clothes' LIMIT 1), 'clothes',
   'عبای آیینی', 'Ceremonial Robe',
   'عبای بلند و باشکوه برای مراسم معنوی و آیین‌های خاص. با انرژی مثبت دوخته شده.',
   'Long and majestic robe for spiritual ceremonies and special rituals. Sewn with positive energy.',
   750000, 'IRT', 15, true, true, false,
   ARRAY['CEREMONY', 'RITUAL', 'SPIRITUAL'],
   ARRAY['مراسم', 'آیین', 'معنوی']),

  ('cloth-004', 'energy-scarf', (SELECT id FROM "Category" WHERE slug = 'clothes' LIMIT 1), 'clothes',
   'شال انرژی', 'Energy Scarf',
   'شال ابریشمی با رنگ‌های چاکرا. مناسب برای مدیتیشن و پوشش روزانه با انرژی مثبت.',
   'Silk scarf with chakra colors. Suitable for meditation and daily wear with positive energy.',
   320000, 'IRT', 40, true, false, false,
   ARRAY['CHAKRA', 'SILK', 'DAILY'],
   ARRAY['چاکرا', 'ابریشم', 'روزانه']);

-- Add variants (sizes) for clothes
INSERT INTO "ProductVariant" (id, label, stock, "productId")
VALUES
  ('cloth-var-01a', 'S', 5, 'cloth-001'),
  ('cloth-var-01b', 'M', 8, 'cloth-001'),
  ('cloth-var-01c', 'L', 5, 'cloth-001'),
  ('cloth-var-01d', 'XL', 2, 'cloth-001'),
  ('cloth-var-02a', 'S', 8, 'cloth-002'),
  ('cloth-var-02b', 'M', 12, 'cloth-002'),
  ('cloth-var-02c', 'L', 8, 'cloth-002'),
  ('cloth-var-02d', 'XL', 2, 'cloth-002'),
  ('cloth-var-03a', 'M', 5, 'cloth-003'),
  ('cloth-var-03b', 'L', 7, 'cloth-003'),
  ('cloth-var-03c', 'XL', 3, 'cloth-003'),
  ('cloth-var-04a', 'ONE SIZE', 40, 'cloth-004');

-- Add color options for clothes
INSERT INTO "ProductColor" (id, hex, "nameFA", "sortOrder", "productId")
VALUES
  ('cloth-col-01a', '#4A0E4E', 'بنفش سلطنتی', 0, 'cloth-001'),
  ('cloth-col-01b', '#1A1A2E', 'نیلی عمیق', 1, 'cloth-001'),
  ('cloth-col-02a', '#F5F5DC', 'کرم', 0, 'cloth-002'),
  ('cloth-col-02b', '#E8D5B7', 'بژ', 1, 'cloth-002'),
  ('cloth-col-03a', '#2D1B69', 'نیلی', 0, 'cloth-003'),
  ('cloth-col-03b', '#800020', 'بورگاندی', 1, 'cloth-003'),
  ('cloth-col-04a', '#FF6B6B', 'قرمز', 0, 'cloth-004'),
  ('cloth-col-04b', '#4ECDC4', 'فیروزه‌ای', 1, 'cloth-004'),
  ('cloth-col-04c', '#FFE66D', 'زرد', 2, 'cloth-004');

-- Add images for clothes
INSERT INTO "ProductImage" (id, url, "altFA", "sortOrder", "productId")
VALUES
  ('cloth-img-01', '/images/products/meditation-mantle-1.webp', 'شنل مدیتیشن', 0, 'cloth-001'),
  ('cloth-img-02', '/images/products/yoga-tunic-1.webp', 'تونیک یوگا', 0, 'cloth-002'),
  ('cloth-img-03', '/images/products/ceremonial-robe-1.webp', 'عبای آیینی', 0, 'cloth-003'),
  ('cloth-img-04', '/images/products/energy-scarf-1.webp', 'شال انرژی', 0, 'cloth-004');


-- ============================================================
-- 3. CANDLES (type = 'candles')
-- ============================================================

INSERT INTO "Product" (id, slug, "categoryId", type, "nameFA", "nameEN", "descriptionFA", "descriptionEN", price, currency, stock, "isActive", "isFeatured", "isBestSeller", "tagsEN", "tagsFA")
VALUES
  ('candle-001', 'lavender-peace-candle', (SELECT id FROM "Category" WHERE slug = 'candles' LIMIT 1), 'candles',
   'شمع آرامش اسطوخودوس', 'Lavender Peace Candle',
   'شمع دست‌ساز با عطر اسطوخودوس طبیعی. مناسب برای آرامش و مدیتیشن.',
   'Handmade candle with natural lavender fragrance. Perfect for relaxation and meditation.',
   180000, 'IRT', 40, true, true, false,
   ARRAY['SCENT', 'LAVENDER', 'RELAXATION', 'MEDITATION'],
   ARRAY['رایحه', 'اسطوخودوس', 'آرامش', 'مدیتیشن']),

  ('candle-002', 'rose-love-candle', (SELECT id FROM "Category" WHERE slug = 'candles' LIMIT 1), 'candles',
   'شمع عشق رز', 'Rose Love Candle',
   'شمع با عطر گل رز و انرژی عشق. برای تقویت عشق به خود و دیگران.',
   'Candle with rose fragrance and love energy. For enhancing love for self and others.',
   200000, 'IRT', 35, true, true, true,
   ARRAY['SCENT', 'ROSE', 'LOVE', 'HEART'],
   ARRAY['رایحه', 'رز', 'عشق', 'قلب']),

  ('candle-003', 'vanilla-abundance-candle', (SELECT id FROM "Category" WHERE slug = 'candles' LIMIT 1), 'candles',
   'شمع فراوانی وانیل', 'Vanilla Abundance Candle',
   'شمع با عطر وانیل گرم. برای جذب فراوانی و موفقیت.',
   'Candle with warm vanilla fragrance. For attracting abundance and success.',
   190000, 'IRT', 30, true, false, false,
   ARRAY['SCENT', 'VANILLA', 'ABUNDANCE', 'PROSPERITY'],
   ARRAY['رایحه', 'وانیل', 'فراوانی', 'موفقیت']),

  ('candle-004', 'sandalwood-protection-candle', (SELECT id FROM "Category" WHERE slug = 'candles' LIMIT 1), 'candles',
   'شمع محافظت صندل', 'Sandalwood Protection Candle',
   'شمع با عطر صندل مقدس. برای پاکسازی فضا و محافظت انرژی.',
   'Candle with sacred sandalwood fragrance. For space cleansing and energy protection.',
   220000, 'IRT', 25, true, false, false,
   ARRAY['SCENT', 'SANDALWOOD', 'PROTECTION', 'CLEANSING'],
   ARRAY['رایحه', 'صندل', 'محافظت', 'پاکسازی']);

-- Add images for candles
INSERT INTO "ProductImage" (id, url, "altFA", "sortOrder", "productId")
VALUES
  ('candle-img-01', '/images/products/lavender-candle-1.webp', 'شمع اسطوخودوس', 0, 'candle-001'),
  ('candle-img-02', '/images/products/rose-candle-1.webp', 'شمع رز', 0, 'candle-002'),
  ('candle-img-03', '/images/products/vanilla-candle-1.webp', 'شمع وانیل', 0, 'candle-003'),
  ('candle-img-04', '/images/products/sandalwood-candle-1.webp', 'شمع صندل', 0, 'candle-004');

-- Add attributes for candles
INSERT INTO "ProductAttribute" (id, key, "valueFA", "valueEN", "sortOrder", "productId")
VALUES
  ('candle-attr-01a', 'burnTime', '۴۰ ساعت', '40 hours', 0, 'candle-001'),
  ('candle-attr-01b', 'waxType', 'موم سویا', 'Soy Wax', 1, 'candle-001'),
  ('candle-attr-02a', 'burnTime', '۳۵ ساعت', '35 hours', 0, 'candle-002'),
  ('candle-attr-02b', 'waxType', 'موم گیاهی', 'Plant Wax', 1, 'candle-002'),
  ('candle-attr-03a', 'burnTime', '۴۵ ساعت', '45 hours', 0, 'candle-003'),
  ('candle-attr-03b', 'waxType', 'موم سویا', 'Soy Wax', 1, 'candle-003'),
  ('candle-attr-04a', 'burnTime', '۵۰ ساعت', '50 hours', 0, 'candle-004'),
  ('candle-attr-04b', 'waxType', 'موم زنبور عسل', 'Beeswax', 1, 'candle-004');


-- ============================================================
-- 4. ACCESSORIES (type = 'accessories')
-- ============================================================

INSERT INTO "Product" (id, slug, "categoryId", type, "nameFA", "nameEN", "descriptionFA", "descriptionEN", price, currency, stock, "isActive", "isFeatured", "isBestSeller", "tagsEN", "tagsFA")
VALUES
  ('acc-001', 'crystal-mala-beads', (SELECT id FROM "Category" WHERE slug = 'accessories' LIMIT 1), 'accessories',
   'تسبیح کریستال', 'Crystal Mala Beads',
   'تسبیح ۱۰۸ دانه از کریستال طبیعی. مناسب برای مدیتیشن و ذکر.',
   '108-bead mala made from natural crystal. Suitable for meditation and mantra practice.',
   350000, 'IRT', 25, true, true, false,
   ARRAY['MEDITATION', 'MALA', 'CRYSTAL', 'SPIRITUAL'],
   ARRAY['مدیتیشن', 'مالا', 'کریستال', 'معنوی']),

  ('acc-002', 'singing-bowl', (SELECT id FROM "Category" WHERE slug = 'accessories' LIMIT 1), 'accessories',
   'کاسه تبتی', 'Singing Bowl',
   'کاسه تبتی دست‌ساز برای صدا درمانی و پاکسازی فضا. با صدای عمیق و آرامش‌بخش.',
   'Handmade singing bowl for sound therapy and space cleansing. Deep and soothing sound.',
   650000, 'IRT', 10, true, true, true,
   ARRAY['SOUND', 'HEALING', 'MEDITATION', 'CLEANSING'],
   ARRAY['صدا', 'شفا', 'مدیتیشن', 'پاکسازی']),

  ('acc-003', 'incense-holder', (SELECT id FROM "Category" WHERE slug = 'accessories' LIMIT 1), 'accessories',
   'عطردان چوبی', 'Wooden Incense Holder',
   'عطردان دست‌ساز از چوب طبیعی. برای نگهداری و سوزاندن عود.',
   'Handmade incense holder from natural wood. For storing and burning incense sticks.',
   120000, 'IRT', 50, true, false, false,
   ARRAY['INCENSE', 'WOOD', 'DECOR', 'RITUAL'],
   ARRAY['عود', 'چوب', 'دکور', 'آیین']),

  ('acc-004', 'dream-catcher', (SELECT id FROM "Category" WHERE slug = 'accessories' LIMIT 1), 'accessories',
   'رویاگیر', 'Dream Catcher',
   'رویاگیر دست‌بافت با پرهای طبیعی. برای محافظت در خواب و دیدن رویاهای زیبا.',
   'Handwoven dream catcher with natural feathers. For protection during sleep and beautiful dreams.',
   250000, 'IRT', 20, true, false, false,
   ARRAY['DECOR', 'PROTECTION', 'DREAMS', 'SPIRITUAL'],
   ARRAY['دکور', 'محافظت', 'رویا', 'معنوی']),

  ('acc-005', 'chakra-tuning-forks', (SELECT id FROM "Category" WHERE slug = 'accessories' LIMIT 1), 'accessories',
   'چنگال تنظیم چاکرا', 'Chakra Tuning Forks',
   'ست ۷ چنگال تنظیم برای هماهنگ‌سازی چاکراها. هر چنگال با فرکانس یک چاکرا.',
   'Set of 7 tuning forks for chakra harmonization. Each fork tuned to a chakra frequency.',
   480000, 'IRT', 15, true, false, false,
   ARRAY['SOUND', 'CHAKRA', 'HEALING', 'TOOL'],
   ARRAY['صدا', 'چاکرا', 'شفا', 'ابزار']);

-- Add images for accessories
INSERT INTO "ProductImage" (id, url, "altFA", "sortOrder", "productId")
VALUES
  ('acc-img-01', '/images/products/crystal-mala-1.webp', 'تسبیح کریستال', 0, 'acc-001'),
  ('acc-img-02', '/images/products/singing-bowl-1.webp', 'کاسه تبتی', 0, 'acc-002'),
  ('acc-img-03', '/images/products/incense-holder-1.webp', 'عطردان چوبی', 0, 'acc-003'),
  ('acc-img-04', '/images/products/dream-catcher-1.webp', 'رویاگیر', 0, 'acc-004'),
  ('acc-img-05', '/images/products/chakra-forks-1.webp', 'چنگال تنظیم چاکرا', 0, 'acc-005');


-- ============================================================
-- VERIFICATION QUERIES (run these to check your data)
-- ============================================================

-- Check total products per category:
-- SELECT c."nameEN", COUNT(p.id) as product_count
-- FROM "Category" c
-- LEFT JOIN "Product" p ON p."categoryId" = c.id
-- GROUP BY c.id, c."nameEN"
-- ORDER BY c."nameEN";

-- Check all products with their types:
-- SELECT p."nameEN", p.type, p.price, p."isFeatured", p."isBestSeller"
-- FROM "Product" p
-- ORDER BY p.type, p."nameEN";