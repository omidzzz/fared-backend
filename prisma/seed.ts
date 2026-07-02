import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { Role, CourseLevel, CourseLanguage, TourLevel } from "../src/generated/prisma";

const pool = new Pool({
  connectionString: process.env["DATABASE_URL"],
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log('🌱 Seeding database...');

  // ── Clean existing data ──────────────────────────────────
  await prisma.mentorshipSession.deleteMany();
  await prisma.mentor.deleteMany();
  await prisma.courseEnrollment.deleteMany();
  await prisma.courseLesson.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.paymentReceipt.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.tourEnquiry.deleteMany();
  await prisma.tourDay.deleteMany();
  await prisma.tourImage.deleteMany();
  await prisma.productColor.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productAttribute.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.course.deleteMany();
  await prisma.tour.deleteMany();
  await prisma.forumReply.deleteMany();
  await prisma.forumTopic.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.address.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.oTP.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.educationalPost.deleteMany();
  await prisma.book.deleteMany();
  await prisma.article.deleteMany();
  await prisma.poem.deleteMany();
  await prisma.mediaFile.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // ── Admin User ───────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      phone: '09000000000',
      nameFA: 'ادمین',
      name: 'Admin',
      role: Role.SUPER_ADMIN,
      isVerified: true,
    },
  });
  console.log(`  ✅ Admin user: ${admin.id}`);

  // ── Categories (7 Chakra) ────────────────────────────────
  const categories = await Promise.all([
    prisma.category.create({
      data: { slug: 'clothes', nameFA: 'پوشاک', nameEN: 'Clothes', chakraColor: '--chakra-root', chakraHex: '#c0392b', sortOrder: 1 },
    }),
    prisma.category.create({
      data: { slug: 'candles', nameFA: 'شمع', nameEN: 'Candles', chakraColor: '--chakra-sacral', chakraHex: '#e67e22', sortOrder: 2 },
    }),
    prisma.category.create({
      data: { slug: 'accessories', nameFA: 'اکسسوری', nameEN: 'Accessories', chakraColor: '--chakra-solar', chakraHex: '#f1c40f', sortOrder: 3 },
    }),
    prisma.category.create({
      data: { slug: 'tours', nameFA: 'تور', nameEN: 'Tours', chakraColor: '--chakra-heart', chakraHex: '#27ae60', sortOrder: 4 },
    }),
    prisma.category.create({
      data: { slug: 'stones', nameFA: 'سنگ‌ها', nameEN: 'Stones', chakraColor: '--chakra-throat', chakraHex: '#2980b9', sortOrder: 5 },
    }),
    prisma.category.create({
      data: { slug: 'courses', nameFA: 'دوره‌ها', nameEN: 'Courses', chakraColor: '--chakra-third', chakraHex: '#8e44ad', sortOrder: 6 },
    }),
    prisma.category.create({
      data: { slug: 'mentorship', nameFA: 'منتورشیپ', nameEN: 'Mentorship', chakraColor: '--chakra-crown', chakraHex: '#9b59b6', sortOrder: 7 },
    }),
  ]);
  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]));
  console.log('  ✅ Categories seeded');

  // ── Stones (3) ───────────────────────────────────────────
  const stonesCatId = catMap.stones;
  const amethyst = await prisma.product.create({
    data: {
      slug: 'amethyst',
      categoryId: stonesCatId,
      type: 'stones',
      nameFA: 'آمتیست',
      nameEN: 'Amethyst',
      descriptionFA: 'سنگ آمتیست با انرژی آرامش‌بخش و محافظت‌کننده. این سنگ قدرتمند به کاهش استرس، تقویت شهود و تعادل چاکرای تاج کمک می‌کند. مناسب برای مدیتیشن و پاکسازی انرژی.',
      descriptionEN: 'Amethyst crystal with calming and protective energy. This powerful stone helps reduce stress, enhance intuition, and balance the crown chakra. Ideal for meditation and energy cleansing.',
      price: 450000,
      currency: 'IRT',
      comparePrice: 550000,
      stock: 20,
      isActive: true,
      isFeatured: true,
      isBestSeller: true,
      tagsFA: ['آمتیست', 'سنگ', 'مدیتیشن', 'آرامش'],
      tagsEN: ['amethyst', 'crystal', 'meditation', 'calm'],
    },
  });
  await prisma.productImage.createMany({
    data: [
      { productId: amethyst.id, url: 'https://picsum.photos/seed/amethyst1/800/800', altFA: 'آمتیست - نمای اصلی', sortOrder: 0 },
      { productId: amethyst.id, url: 'https://picsum.photos/seed/amethyst2/800/800', altFA: 'آمتیست - زاویه دوم', sortOrder: 1 },
    ],
  });
  await prisma.productAttribute.createMany({
    data: [
      { productId: amethyst.id, key: 'origin', valueFA: 'برزیل', valueEN: 'Brazil', sortOrder: 0 },
      { productId: amethyst.id, key: 'property', valueFA: 'آرامش', valueEN: 'Calm', sortOrder: 1 },
      { productId: amethyst.id, key: 'intention', valueFA: 'محافظت', valueEN: 'Protection', sortOrder: 2 },
      { productId: amethyst.id, key: 'chakra', valueFA: 'چاکرای تاج', valueEN: 'Crown Chakra', sortOrder: 3 },
    ],
  });

  const roseQuartz = await prisma.product.create({
    data: {
      slug: 'rose-quartz',
      categoryId: stonesCatId,
      type: 'stones',
      nameFA: 'کوارتز رز',
      nameEN: 'Rose Quartz',
      descriptionFA: 'سنگ عشق بی‌قید و شرط. کوارتز رز قلب را می‌گشاید و انرژی عشق، بخشش و مهربانی را تقویت می‌کند. مناسب برای بهبود روابط و خودشناسی.',
      descriptionEN: 'The stone of unconditional love. Rose quartz opens the heart and strengthens the energy of love, forgiveness, and kindness. Great for relationships and self-discovery.',
      price: 350000,
      currency: 'IRT',
      stock: 15,
      isActive: true,
      isFeatured: true,
      tagsFA: ['کوارتز', 'عشق', 'قلب', 'رز'],
      tagsEN: ['quartz', 'love', 'heart', 'rose'],
    },
  });
  await prisma.productImage.createMany({
    data: [
      { productId: roseQuartz.id, url: 'https://picsum.photos/seed/rose1/800/800', altFA: 'کوارتز رز', sortOrder: 0 },
    ],
  });
  await prisma.productAttribute.createMany({
    data: [
      { productId: roseQuartz.id, key: 'origin', valueFA: 'ماداگاسکار', valueEN: 'Madagascar', sortOrder: 0 },
      { productId: roseQuartz.id, key: 'property', valueFA: 'عشق', valueEN: 'Love', sortOrder: 1 },
      { productId: roseQuartz.id, key: 'chakra', valueFA: 'چاکرای قلب', valueEN: 'Heart Chakra', sortOrder: 2 },
    ],
  });

  const labradorite = await prisma.product.create({
    data: {
      slug: 'labradorite',
      categoryId: stonesCatId,
      type: 'stones',
      nameFA: 'لابرادوریت',
      nameEN: 'Labradorite',
      descriptionFA: 'سنگ تحول و شهود. لابرادوریت با درخشش رنگین‌کمانی خود، سپر محافظتی قدرتمندی ایجاد می‌کند و توانایی‌های شهودی را بیدار می‌سازد.',
      descriptionEN: 'Stone of transformation and intuition. Labradorite creates a powerful protective shield with its rainbow-like iridescence while awakening intuitive abilities.',
      price: 520000,
      currency: 'IRT',
      comparePrice: 600000,
      stock: 8,
      isActive: true,
      tagsFA: ['لابرادوریت', 'شهود', 'تحول', 'محافظت'],
      tagsEN: ['labradorite', 'intuition', 'transformation', 'protection'],
    },
  });
  await prisma.productImage.createMany({
    data: [
      { productId: labradorite.id, url: 'https://picsum.photos/seed/lab1/800/800', altFA: 'لابرادوریت', sortOrder: 0 },
    ],
  });
  await prisma.productAttribute.createMany({
    data: [
      { productId: labradorite.id, key: 'origin', valueFA: 'فنلاند', valueEN: 'Finland', sortOrder: 0 },
      { productId: labradorite.id, key: 'property', valueFA: 'شهود', valueEN: 'Intuition', sortOrder: 1 },
      { productId: labradorite.id, key: 'chakra', valueFA: 'چاکرای چشم سوم', valueEN: 'Third Eye Chakra', sortOrder: 2 },
    ],
  });

  // ── Candles (3) ─────────────────────────────────────────
  const candlesCatId = catMap.candles;
  const moonCandle = await prisma.product.create({
    data: {
      slug: 'moon-ritual-candle',
      categoryId: candlesCatId,
      type: 'candles',
      nameFA: 'شمع آیینی ماه',
      nameEN: 'Moon Ritual Candle',
      descriptionFA: 'شمع آیینی مخصوص مراسم ماه کامل. ساخته شده از موم طبیعی سویا و اسانس اسطوخودوس. طراحی شده برای پاکسازی انرژی و تقویت نیت‌های ماه نو.',
      descriptionEN: 'Full moon ritual candle. Made from natural soy wax and lavender essential oil. Designed for energy cleansing and amplifying new moon intentions.',
      price: 280000,
      currency: 'IRT',
      stock: 30,
      isActive: true,
      isFeatured: true,
      tagsFA: ['شمع', 'ماه', 'آیینی', 'اسطوخودوس'],
      tagsEN: ['candle', 'moon', 'ritual', 'lavender'],
    },
  });
  await prisma.productImage.createMany({
    data: [
      { productId: moonCandle.id, url: 'https://picsum.photos/seed/mooncandle/800/800', altFA: 'شمع آیینی ماه', sortOrder: 0 },
    ],
  });
  await prisma.productAttribute.createMany({
    data: [
      { productId: moonCandle.id, key: 'scent', valueFA: 'اسطوخودوس', valueEN: 'Lavender', sortOrder: 0 },
      { productId: moonCandle.id, key: 'burnTime', valueFA: '۴۰-۵۰ ساعت', valueEN: '40-50 hours', sortOrder: 1 },
      { productId: moonCandle.id, key: 'material', valueFA: 'موم سویا', valueEN: 'Soy Wax', sortOrder: 2 },
      { productId: moonCandle.id, key: 'intention', valueFA: 'پاکسازی', valueEN: 'Cleansing', sortOrder: 3 },
    ],
  });

  const chakraCandle = await prisma.product.create({
    data: {
      slug: 'chakra-cleanse-candle',
      categoryId: candlesCatId,
      type: 'candles',
      nameFA: 'شمع پاکسازی چاکرا',
      nameEN: 'Chakra Cleanse Candle',
      descriptionFA: 'شمع هفت چاکرا با لایه‌های رنگی. هر لایه با اسانس متفاوتی برای متعادل‌سازی چاکرای متناظر ساخته شده است. تجربه‌ای کامل از پاکسازی انرژی.',
      descriptionEN: 'Seven chakra candle with colored layers. Each layer is infused with a different essential oil to balance the corresponding chakra. A complete energy cleansing experience.',
      price: 320000,
      currency: 'IRT',
      comparePrice: 380000,
      stock: 25,
      isActive: true,
      isBestSeller: true,
      tagsFA: ['شمع', 'چاکرا', 'پاکسازی', 'هفت‌گانه'],
      tagsEN: ['candle', 'chakra', 'cleanse', 'seven'],
    },
  });
  await prisma.productImage.createMany({
    data: [
      { productId: chakraCandle.id, url: 'https://picsum.photos/seed/chakracandle/800/800', altFA: 'شمع پاکسازی چاکرا', sortOrder: 0 },
    ],
  });
  await prisma.productAttribute.createMany({
    data: [
      { productId: chakraCandle.id, key: 'scent', valueFA: 'ترکیبی از ۷ اسانس', valueEN: 'Blend of 7 Oils', sortOrder: 0 },
      { productId: chakraCandle.id, key: 'burnTime', valueFA: '۵۰-۶۰ ساعت', valueEN: '50-60 hours', sortOrder: 1 },
      { productId: chakraCandle.id, key: 'material', valueFA: 'موم نارگیل', valueEN: 'Coconut Wax', sortOrder: 2 },
      { productId: chakraCandle.id, key: 'intention', valueFA: 'تعادل چاکراها', valueEN: 'Chakra Balance', sortOrder: 3 },
    ],
  });

  const protectionCandle = await prisma.product.create({
    data: {
      slug: 'protection-candle',
      categoryId: candlesCatId,
      type: 'candles',
      nameFA: 'شمع محافظت',
      nameEN: 'Protection Candle',
      descriptionFA: 'شمع محافظت با رایحه مریم گلی و سدر. این شمع سیاه قدرتمند برای دفع انرژی‌های منفی، شکستن طلسم و ایجاد سد محافظتی طراحی شده است.',
      descriptionEN: 'Protection candle with sage and cedarwood scent. This powerful black candle is designed to repel negative energies, break spells, and create a protective barrier.',
      price: 250000,
      currency: 'IRT',
      stock: 18,
      isActive: true,
      tagsFA: ['شمع', 'محافظت', 'مریم گلی', 'دفع'],
      tagsEN: ['candle', 'protection', 'sage', 'warding'],
    },
  });
  await prisma.productImage.createMany({
    data: [
      { productId: protectionCandle.id, url: 'https://picsum.photos/seed/protcandle/800/800', altFA: 'شمع محافظت', sortOrder: 0 },
    ],
  });
  await prisma.productAttribute.createMany({
    data: [
      { productId: protectionCandle.id, key: 'scent', valueFA: 'مریم گلی و سدر', valueEN: 'Sage & Cedarwood', sortOrder: 0 },
      { productId: protectionCandle.id, key: 'burnTime', valueFA: '۳۰-۴۰ ساعت', valueEN: '30-40 hours', sortOrder: 1 },
      { productId: protectionCandle.id, key: 'material', valueFA: 'موم زنبور عسل', valueEN: 'Beeswax', sortOrder: 2 },
    ],
  });

  // ── Clothes (3) ─────────────────────────────────────────
  const clothesCatId = catMap.clothes;
  const redDress = await prisma.product.create({
    data: {
      slug: 'red-energy-dress',
      categoryId: clothesCatId,
      type: 'clothes',
      nameFA: 'لباس انرژی قرمز',
      nameEN: 'Red Energy Dress',
      descriptionFA: 'لباس بلند از جنس نخ ارگانیک با رنگ قرمز چاکرای ریشه. طراحی آزاد و راحت برای مدیتیشن، یوگا و استفاده روزمره. الیاف طبیعی با قابلیت تنفس عالی.',
      descriptionEN: 'Long organic cotton dress in root chakra red. Loose, comfortable design for meditation, yoga, and daily wear. Natural fibers with excellent breathability.',
      price: 780000,
      currency: 'IRT',
      comparePrice: 950000,
      stock: 12,
      isActive: true,
      isFeatured: true,
      tagsFA: ['لباس', 'مدیتیشن', 'نخ', 'قرمز'],
      tagsEN: ['dress', 'meditation', 'cotton', 'red'],
    },
  });
  await prisma.productImage.createMany({
    data: [
      { productId: redDress.id, url: 'https://picsum.photos/seed/reddress/800/800', altFA: 'لباس انرژی قرمز', sortOrder: 0 },
    ],
  });
  await prisma.productAttribute.createMany({
    data: [
      { productId: redDress.id, key: 'material', valueFA: 'نخ ارگانیک', valueEN: 'Organic Cotton', sortOrder: 0 },
      { productId: redDress.id, key: 'fit', valueFA: 'آزاد', valueEN: 'Loose Fit', sortOrder: 1 },
    ],
  });
  await prisma.productVariant.createMany({
    data: [
      { productId: redDress.id, label: 'S', stock: 5 },
      { productId: redDress.id, label: 'M', stock: 4 },
      { productId: redDress.id, label: 'L', stock: 3 },
    ],
  });
  await prisma.productColor.createMany({
    data: [
      { productId: redDress.id, hex: '#8B2635', nameFA: 'قرمز تیره' },
      { productId: redDress.id, hex: '#C0392B', nameFA: 'قرمز' },
    ],
  });

  const meditationRobe = await prisma.product.create({
    data: {
      slug: 'meditation-robe',
      categoryId: clothesCatId,
      type: 'clothes',
      nameFA: 'روپوش مراقبه',
      nameEN: 'Meditation Robe',
      descriptionFA: 'روپوش مراقبه از جنس لینن طبیعی. طراحی مینیمال و راحت با الهام از البسه سنتی. دارای جیب‌های مخفی برای نگهداری کریستال‌ها.',
      descriptionEN: 'Meditation robe made from natural linen. Minimalist, comfortable design inspired by traditional garments. Features hidden pockets for holding crystals.',
      price: 650000,
      currency: 'IRT',
      stock: 8,
      isActive: true,
      tagsFA: ['روپوش', 'مراقبه', 'لینن', 'مینیمال'],
      tagsEN: ['robe', 'meditation', 'linen', 'minimal'],
    },
  });
  await prisma.productImage.createMany({
    data: [
      { productId: meditationRobe.id, url: 'https://picsum.photos/seed/robe/800/800', altFA: 'روپوش مراقبه', sortOrder: 0 },
    ],
  });
  await prisma.productAttribute.createMany({
    data: [
      { productId: meditationRobe.id, key: 'material', valueFA: 'لینن طبیعی', valueEN: 'Natural Linen', sortOrder: 0 },
      { productId: meditationRobe.id, key: 'fit', valueFA: 'گشاد', valueEN: 'Oversized', sortOrder: 1 },
    ],
  });
  await prisma.productVariant.createMany({
    data: [
      { productId: meditationRobe.id, label: 'M', stock: 3 },
      { productId: meditationRobe.id, label: 'L', stock: 3 },
      { productId: meditationRobe.id, label: 'XL', stock: 2 },
    ],
  });
  await prisma.productColor.createMany({
    data: [
      { productId: meditationRobe.id, hex: '#F5F0E8', nameFA: 'کرم' },
      { productId: meditationRobe.id, hex: '#E8E0D5', nameFA: 'بژ' },
    ],
  });

  const yogaSet = await prisma.product.create({
    data: {
      slug: 'yoga-set',
      categoryId: clothesCatId,
      type: 'clothes',
      nameFA: 'ست یوگا',
      nameEN: 'Yoga Set',
      descriptionFA: 'ست دو تکه یوگا (تاپ و لگینگ) از جنس بامبو. الیاف ضد باکتریال و تنفس‌پذیر. طراحی ارگونومیک برای آزادی حرکت کامل در آساناها.',
      descriptionEN: 'Two-piece yoga set (top and leggings) made from bamboo fabric. Antibacterial and breathable fibers. Ergonomic design for full freedom of movement in asanas.',
      price: 520000,
      currency: 'IRT',
      stock: 20,
      isActive: true,
      isBestSeller: true,
      tagsFA: ['یوگا', 'ست', 'بامبو', 'ورزش'],
      tagsEN: ['yoga', 'set', 'bamboo', 'sport'],
    },
  });
  await prisma.productImage.createMany({
    data: [
      { productId: yogaSet.id, url: 'https://picsum.photos/seed/yogaset/800/800', altFA: 'ست یوگا', sortOrder: 0 },
    ],
  });
  await prisma.productAttribute.createMany({
    data: [
      { productId: yogaSet.id, key: 'material', valueFA: 'بامبو', valueEN: 'Bamboo', sortOrder: 0 },
      { productId: yogaSet.id, key: 'fit', valueFA: 'چسبان', valueEN: 'Fitted', sortOrder: 1 },
    ],
  });
  await prisma.productVariant.createMany({
    data: [
      { productId: yogaSet.id, label: 'S', stock: 8 },
      { productId: yogaSet.id, label: 'M', stock: 7 },
      { productId: yogaSet.id, label: 'L', stock: 5 },
    ],
  });
  await prisma.productColor.createMany({
    data: [
      { productId: yogaSet.id, hex: '#2C3E50', nameFA: 'سرمه‌ای' },
      { productId: yogaSet.id, hex: '#7D3C98', nameFA: 'بنفش' },
    ],
  });

  // ── Accessories (3) ─────────────────────────────────────
  const accessoriesCatId = catMap.accessories;
  const pendulum = await prisma.product.create({
    data: {
      slug: 'crystal-pendulum',
      categoryId: accessoriesCatId,
      type: 'accessories',
      nameFA: 'پاندول کریستال',
      nameEN: 'Crystal Pendulum',
      descriptionFA: 'پاندول کریستال آمتیست با زنجیر نقره. ابزاری قدرتمند برای دریافت راهنمایی شهودی، پاسخ به سوالات و ارتباط با خود برتر. همراه با راهنمای استفاده.',
      descriptionEN: 'Amethyst crystal pendulum with silver chain. A powerful tool for receiving intuitive guidance, answering questions, and connecting with your higher self. Includes usage guide.',
      price: 350000,
      currency: 'IRT',
      stock: 15,
      isActive: true,
      isFeatured: true,
      tagsFA: ['پاندول', 'آمتیست', 'شهود', 'فال'],
      tagsEN: ['pendulum', 'amethyst', 'intuition', 'divination'],
    },
  });
  await prisma.productImage.createMany({
    data: [
      { productId: pendulum.id, url: 'https://picsum.photos/seed/pendulum/800/800', altFA: 'پاندول کریستال', sortOrder: 0 },
    ],
  });
  await prisma.productAttribute.createMany({
    data: [
      { productId: pendulum.id, key: 'material', valueFA: 'آمتیست و نقره', valueEN: 'Amethyst & Silver', sortOrder: 0 },
      { productId: pendulum.id, key: 'usage', valueFA: 'فال و شهود', valueEN: 'Divination', sortOrder: 1 },
    ],
  });

  const malaBeads = await prisma.product.create({
    data: {
      slug: 'mala-beads',
      categoryId: accessoriesCatId,
      type: 'accessories',
      nameFA: 'مالا',
      nameEN: 'Mala Beads',
      descriptionFA: 'گردنبند مالا ۱۰۸ دانه از چوب صندل و مهره‌های رودراکشا. همراه با منگوله ابریشمی و مهره گورو. مناسب برای مدیتیشن، chanting و تمرینات ذهن‌آگاهی.',
      descriptionEN: '108-bead mala necklace made from sandalwood and rudraksha seeds. With silk tassel and guru bead. Perfect for meditation, chanting, and mindfulness practices.',
      price: 420000,
      currency: 'IRT',
      comparePrice: 490000,
      stock: 10,
      isActive: true,
      tagsFA: ['مالا', 'مدیتیشن', 'صندل', 'گردنبند'],
      tagsEN: ['mala', 'meditation', 'sandalwood', 'necklace'],
    },
  });
  await prisma.productImage.createMany({
    data: [
      { productId: malaBeads.id, url: 'https://picsum.photos/seed/mala/800/800', altFA: 'مالا', sortOrder: 0 },
    ],
  });
  await prisma.productAttribute.createMany({
    data: [
      { productId: malaBeads.id, key: 'material', valueFA: 'چوب صندل و رودراکشا', valueEN: 'Sandalwood & Rudraksha', sortOrder: 0 },
      { productId: malaBeads.id, key: 'beads', valueFA: '۱۰۸ دانه', valueEN: '108 Beads', sortOrder: 1 },
      { productId: malaBeads.id, key: 'intention', valueFA: 'تمرکز و ذهن‌آگاهی', valueEN: 'Focus & Mindfulness', sortOrder: 2 },
    ],
  });

  const smudgeBundle = await prisma.product.create({
    data: {
      slug: 'smudge-bundle',
      categoryId: accessoriesCatId,
      type: 'accessories',
      nameFA: 'دسته حکیم',
      nameEN: 'Smudge Bundle',
      descriptionFA: 'بسته کامل پاکسازی انرژی شامل دسته مریم گلی سفید، چوب پالو سانتو، پر غاز وحشی و صدف آبالون. همه آنچه برای مراسم پاکسازی نیاز دارید.',
      descriptionEN: 'Complete energy cleansing kit including white sage bundle, palo santo wood, wild goose feather, and abalone shell. Everything you need for a smudging ceremony.',
      price: 580000,
      currency: 'IRT',
      stock: 7,
      isActive: true,
      tagsFA: ['مریم گلی', 'پاکسازی', 'حکیم', 'پالو سانتو'],
      tagsEN: ['sage', 'cleansing', 'smudge', 'palo santo'],
    },
  });
  await prisma.productImage.createMany({
    data: [
      { productId: smudgeBundle.id, url: 'https://picsum.photos/seed/smudge/800/800', altFA: 'دسته حکیم', sortOrder: 0 },
    ],
  });
  await prisma.productAttribute.createMany({
    data: [
      { productId: smudgeBundle.id, key: 'material', valueFA: 'مریم گلی سفید', valueEN: 'White Sage', sortOrder: 0 },
      { productId: smudgeBundle.id, key: 'includes', valueFA: 'صدف، پر، پالو سانتو', valueEN: 'Shell, Feather, Palo Santo', sortOrder: 1 },
      { productId: smudgeBundle.id, key: 'usage', valueFA: 'پاکسازی فضا', valueEN: 'Space Cleansing', sortOrder: 2 },
    ],
  });

  // ── Courses (3) ─────────────────────────────────────────
  const coursesCatId = catMap.courses;

  // Create instructor user
  const instructor = await prisma.user.create({
    data: {
      phone: '09120000001',
      nameFA: 'استاد مینا رضایی',
      name: 'Mina Rezaei',
      email: 'mina@faredvibe.ir',
      role: Role.INSTRUCTOR,
      isVerified: true,
    },
  });

  const meditationCourse = await prisma.course.create({
    data: {
      slug: 'meditation-fundamentals',
      nameFA: 'مبانی مدیتیشن و ذهن‌آگاهی',
      nameEN: 'Meditation & Mindfulness Fundamentals',
      descriptionFA: 'دوره ۸ هفته‌ای مبانی مدیتیشن. از تنفس پایه تا تکنیک‌های پیشرفته ذهن‌آگاهی. مناسب برای مبتدیان و کسانی که می‌خواهند پایه‌های تمرین خود را مستحکم کنند.',
      descriptionEN: 'An 8-week course on meditation fundamentals. From basic breathing to advanced mindfulness techniques. Suitable for beginners and those wanting to strengthen their practice foundations.',
      price: 1490000,
      currency: 'IRT',
      instructorId: instructor.id,
      duration: '8 هفته',
      durationWeeks: 8,
      lessons: 8,
      level: CourseLevel.BEGINNER,
      language: CourseLanguage.FA,
      certificate: true,
      isActive: true,
      isFeatured: true,
      categoryId: coursesCatId,
    },
  });
  await prisma.courseLesson.createMany({
    data: [
      { courseId: meditationCourse.id, order: 1, titleFA: 'مقدمه: مدیتیشن چیست؟', titleEN: 'Introduction: What is Meditation?', durationMinutes: 30, isFree: true },
      { courseId: meditationCourse.id, order: 2, titleFA: 'تنفس آگاهانه', titleEN: 'Conscious Breathing', durationMinutes: 45, isFree: false },
      { courseId: meditationCourse.id, order: 3, titleFA: 'اسکن بدن', titleEN: 'Body Scan', durationMinutes: 40, isFree: false },
      { courseId: meditationCourse.id, order: 4, titleFA: 'مدیتیشن متمرکز', titleEN: 'Focused Meditation', durationMinutes: 50, isFree: false },
      { courseId: meditationCourse.id, order: 5, titleFA: 'مدیتیشن ذهن‌آگاهی', titleEN: 'Mindfulness Meditation', durationMinutes: 45, isFree: false },
      { courseId: meditationCourse.id, order: 6, titleFA: 'مدیتیشن محبت-مهربانی', titleEN: 'Loving-Kindness Meditation', durationMinutes: 50, isFree: false },
      { courseId: meditationCourse.id, order: 7, titleFA: 'مدیتیشن چاکرا', titleEN: 'Chakra Meditation', durationMinutes: 55, isFree: false },
      { courseId: meditationCourse.id, order: 8, titleFA: 'جمع‌بندی و مسیر پیش رو', titleEN: 'Integration & The Path Forward', durationMinutes: 40, isFree: false },
    ],
  });

  const crystalHealingCourse = await prisma.course.create({
    data: {
      slug: 'crystal-healing',
      nameFA: 'کریستال درمانی پیشرفته',
      nameEN: 'Advanced Crystal Healing',
      descriptionFA: 'دوره جامع کریستال درمانی. از شناسایی سنگ‌ها تا ساخت شبکه‌های کریستالی و درمان با چیدمان سنگ روی چاکراها. همراه با جزوه راهنمای ۱۰۰ سنگ.',
      descriptionEN: 'Comprehensive crystal healing course. From stone identification to creating crystal grids and chakra stone layouts. Includes a 100-stone reference guide.',
      price: 2490000,
      currency: 'IRT',
      instructorId: instructor.id,
      duration: '۱۲ هفته',
      durationWeeks: 12,
      lessons: 12,
      level: CourseLevel.INTERMEDIATE,
      language: CourseLanguage.BILINGUAL,
      certificate: true,
      isActive: true,
      categoryId: coursesCatId,
    },
  });
  await prisma.courseLesson.createMany({
    data: [
      { courseId: crystalHealingCourse.id, order: 1, titleFA: 'تاریخچه کریستال درمانی', titleEN: 'History of Crystal Healing', durationMinutes: 35, isFree: true },
      { courseId: crystalHealingCourse.id, order: 2, titleFA: 'شناخت ساختار کریستال‌ها', titleEN: 'Understanding Crystal Structures', durationMinutes: 45, isFree: false },
      { courseId: crystalHealingCourse.id, order: 3, titleFA: 'انتخاب و پاکسازی سنگ', titleEN: 'Choosing & Cleansing Stones', durationMinutes: 50, isFree: false },
      { courseId: crystalHealingCourse.id, order: 4, titleFA: 'برنامه‌ریزی کریستال', titleEN: 'Crystal Programming', durationMinutes: 40, isFree: false },
      { courseId: crystalHealingCourse.id, order: 5, titleFA: 'شبکه‌های کریستالی', titleEN: 'Crystal Grids', durationMinutes: 55, isFree: false },
    ],
  });

  const chakraCourse = await prisma.course.create({
    data: {
      slug: 'chakra-balancing',
      nameFA: 'تعادل چاکراها',
      nameEN: 'Chakra Balancing',
      descriptionFA: 'سفری ۶ هفته‌ای در دنیای چاکراها. هر هفته یک چاکرا را عمیقاً می‌شناسید، تمرینات عملی انجام می‌دهید و تعادل را به سیستم انرژی خود بازمی‌گردانید.',
      descriptionEN: 'A 6-week journey into the world of chakras. Each week you deeply explore one chakra, practice hands-on exercises, and restore balance to your energy system.',
      price: 990000,
      currency: 'IRT',
      instructorId: instructor.id,
      duration: '۶ هفته',
      durationWeeks: 6,
      lessons: 6,
      level: CourseLevel.BEGINNER,
      language: CourseLanguage.FA,
      certificate: false,
      isActive: true,
      categoryId: coursesCatId,
    },
  });
  await prisma.courseLesson.createMany({
    data: [
      { courseId: chakraCourse.id, order: 1, titleFA: 'چاکرای ریشه: بنیاد وجود', durationMinutes: 40, isFree: true },
      { courseId: chakraCourse.id, order: 2, titleFA: 'چاکرای خاجی: خلاقیت و احساسات', durationMinutes: 45, isFree: false },
      { courseId: chakraCourse.id, order: 3, titleFA: 'چاکرای شبکه خورشیدی: قدرت شخصی', durationMinutes: 40, isFree: false },
      { courseId: chakraCourse.id, order: 4, titleFA: 'چاکرای قلب: عشق و شفقت', durationMinutes: 45, isFree: false },
      { courseId: chakraCourse.id, order: 5, titleFA: 'چاکرای گلو: بیان حقیقت', durationMinutes: 40, isFree: false },
      { courseId: chakraCourse.id, order: 6, titleFA: 'چاکرای چشم سوم و تاج: شهود و اتصال', durationMinutes: 50, isFree: false },
    ],
  });

  console.log('  ✅ Courses seeded');

  // ── Mentors (2) ─────────────────────────────────────────
  const mentorsCatId = catMap.mentorship;

  const mentor1User = await prisma.user.create({
    data: {
      phone: '09120000002',
      nameFA: 'دکتر آرش کمالی',
      name: 'Dr. Arash Kamali',
      email: 'arash@faredvibe.ir',
      role: Role.MENTOR,
      isVerified: true,
    },
  });

  const mentor1 = await prisma.mentor.create({
    data: {
      userId: mentor1User.id,
      nameFA: 'دکتر آرش کمالی',
      nameEN: 'Dr. Arash Kamali',
      titleFA: 'درمانگر انرژی کریستال',
      titleEN: 'Crystal Energy Healer',
      bioFA: 'دکتر آرش کمالی با بیش از ۱۵ سال تجربه در زمینه کریستال درمانی و انرژی درمانی. فارغ‌التحصیل موسسه Crystal Academy لندن و دارای گواهینامه Reiki Master. ایشان تلفیقی از دانش شرقی و غربی را در جلسات خود به کار می‌گیرند.',
      bioEN: 'Dr. Arash Kamali with over 15 years of experience in crystal healing and energy therapy. Graduate of the Crystal Academy London and certified Reiki Master. He integrates Eastern and Western knowledge in his sessions.',
      specialtiesFA: ['کریستال درمانی', 'انرژی درمانی', 'Reiki', 'پاکسازی چاکرا'],
      specialtiesEN: ['Crystal Healing', 'Energy Therapy', 'Reiki', 'Chakra Cleansing'],
      sessionPrice: 85,
      sessionDuration: 60,
      currency: 'USD',
      rating: 4.8,
      reviewCount: 124,
      isAvailable: true,
      image: 'https://picsum.photos/seed/mentor1/400/400',
    },
  });

  const mentor2User = await prisma.user.create({
    data: {
      phone: '09120000003',
      nameFA: 'سارا نوربخش',
      name: 'Sara Nourbakhsh',
      email: 'sara@faredvibe.ir',
      role: Role.MENTOR,
      isVerified: true,
    },
  });

  const mentor2 = await prisma.mentor.create({
    data: {
      userId: mentor2User.id,
      nameFA: 'سارا نوربخش',
      nameEN: 'Sara Nourbakhsh',
      titleFA: 'راهنمای مدیتیشن و یوگا',
      titleEN: 'Meditation & Yoga Guide',
      bioFA: 'سارا نوربخش، مربی certified یوگا (RYT-500) و معلم مدیتیشن Vipassana. با بیش از ۱۰ سال تمرین و تدریس، ایشان به شما کمک می‌کنند تا از طریق مدیتیشن و حرکت آگاهانه، آرامش را در زندگی روزمره خود بیابید.',
      bioEN: 'Sara Nourbakhsh, certified yoga instructor (RYT-500) and Vipassana meditation teacher. With over 10 years of practice and teaching, she helps you find peace in daily life through meditation and mindful movement.',
      specialtiesFA: ['مدیتیشن', 'یوگا', 'ذهن‌آگاهی', 'تنفس درمانی'],
      specialtiesEN: ['Meditation', 'Yoga', 'Mindfulness', 'Breathwork'],
      sessionPrice: 65,
      sessionDuration: 45,
      currency: 'USD',
      rating: 4.9,
      reviewCount: 89,
      isAvailable: true,
      image: 'https://picsum.photos/seed/mentor2/400/400',
    },
  });

  console.log('  ✅ Mentors seeded');

  // ── Tours (2) ───────────────────────────────────────────
  const toursCatId = catMap.tours;

  const baliTour = await prisma.tour.create({
    data: {
      slug: 'bali-spiritual-retreat',
      destination: 'Bali',
      titleFA: 'تور بالی: بیداری معنوی در جزیره خدایان',
      titleEN: 'Bali Spiritual Awakening Retreat',
      descriptionFA: 'سفری ۱۰ روزه به قلب معنوی بالی. از معابد مقدس اوبود تا سواحل بکر اولوواتو. تجربه مدیتیشن با راهبان محلی، پاکسازی در آبشارهای مقدس، یوگا در تراس‌های برنج و شنا با دلفین‌ها در lovina.',
      descriptionEN: 'A 10-day journey to the spiritual heart of Bali. From sacred temples of Ubud to pristine beaches of Uluwatu. Experience meditation with local monks, cleansing in sacred waterfalls, yoga in rice terraces, and dolphin swimming in Lovina.',
      highlightsFA: ['مدیتیشن در معبد تیرتا امپول', 'یوگا در تراس برنج تگالالانگ', 'پاکسازی در آبشار مقدس', 'اقامت در اقامتگاه بوم‌گردی'],
      highlightsEN: ['Meditation at Tirta Empul Temple', 'Yoga in Tegallalang Rice Terraces', 'Sacred Waterfall Cleansing', 'Eco-Lodge Accommodation'],
      dateRange: 'Jul 12 – Jul 21, 2026',
      startDate: new Date('2026-07-12'),
      endDate: new Date('2026-07-21'),
      durationDays: 10,
      price: 2450,
      currency: 'USD',
      spotsTotal: 15,
      spotsLeft: 9,
      heroImage: 'https://picsum.photos/seed/bali/1200/600',
      includedFA: ['اقامت ۱۰ شب در اقامتگاه بوم‌گردی', 'سه وعده غذای ارگانیک', 'ترانسفر فرودگاهی', 'کلیه کلاس‌های یوگا و مدیتیشن', 'بیمه مسافرتی'],
      notIncludedFA: ['بلیط هواپیما', 'ویزای اندونزی', 'خرید شخصی'],
      instructor: 'Dr. Arash Kamali & Sara Nourbakhsh',
      level: TourLevel.ALL_LEVELS,
      isActive: true,
      isFeatured: true,
      categoryId: toursCatId,
    },
  });

  await prisma.tourImage.createMany({
    data: [
      { tourId: baliTour.id, url: 'https://picsum.photos/seed/bali1/800/600', sortOrder: 0 },
      { tourId: baliTour.id, url: 'https://picsum.photos/seed/bali2/800/600', sortOrder: 1 },
      { tourId: baliTour.id, url: 'https://picsum.photos/seed/bali3/800/600', sortOrder: 2 },
    ],
  });

  await prisma.tourDay.createMany({
    data: [
      { tourId: baliTour.id, day: 1, titleFA: 'ورود به بالی و توجیه', descriptionFA: 'ورود به فرودگاه انگوراه رای، ترانسفر به اقامتگاه در اوبود. مراسم خوش‌آمدگویی و پاکسازی با گل. شام ارگانیک و جلسه توجیهی.' },
      { tourId: baliTour.id, day: 2, titleFA: 'بیداری در اوبود', descriptionFA: 'یوگای صبحگاهی مشرف به جنگل. صبحانه ارگانیک. بازدید از معبد تیرتا امپول و مراسم پاکسازی در آب مقدس. مدیتیشن هدایت‌شده در غروب.' },
      { tourId: baliTour.id, day: 3, titleFA: 'آبشار مقدس', descriptionFA: 'پیاده‌روی به سمت آبشار مقدس. مراسم پاکسازی زیر آبشار. ناهار پیک‌نیک. بعدازظهر آزاد برای کاوش در بازار هنر اوبود.' },
      { tourId: baliTour.id, day: 7, titleFA: 'جزیره نوسا پنیدا', descriptionFA: 'سفر یک روزه به جزیره نوسا پنیدا با قایق تندرو. شنا در ساحل Kelingking. بازدید از ساحل الماس و غارهای مقدس.' },
      { tourId: baliTour.id, day: 10, titleFA: 'اختتامیه و خداحافظی', descriptionFA: 'مراسم اختتامیه با تقدیم هدایای محلی. جلسه اشتراک‌گذاری تجربیات. ترانسفر به فرودگاه.' },
    ],
  });

  const egyptTour = await prisma.tour.create({
    data: {
      slug: 'egypt-mystical-journey',
      destination: 'Egypt',
      titleFA: 'تور مصر: سفر به سرزمین فراعنه',
      titleEN: 'Egypt Mystical Journey',
      descriptionFA: 'سفری ۸ روزه به مصر باستان. مدیتیشن در اتاق پادشاه هرم بزرگ، بازدید از معابد اقصر و کارناک، کروز در رود نیل و شب‌زنده‌داری در صحرای سفید.',
      descriptionEN: 'An 8-day journey to ancient Egypt. Meditation in the King\'s Chamber of the Great Pyramid, visits to Luxor and Karnak temples, Nile cruise, and overnight in the White Desert.',
      highlightsFA: ['مدیتیشن در هرم بزرگ جیزه', 'کروز نیل', 'بازدید از معبد کارناک', 'کمپ شبانه در صحرای سفید'],
      highlightsEN: ['Great Pyramid Meditation', 'Nile Cruise', 'Karnak Temple Visit', 'White Desert Camping'],
      dateRange: 'Nov 5 – Nov 12, 2026',
      startDate: new Date('2026-11-05'),
      endDate: new Date('2026-11-12'),
      durationDays: 8,
      price: 3200,
      currency: 'USD',
      spotsTotal: 12,
      spotsLeft: 12,
      heroImage: 'https://picsum.photos/seed/egypt/1200/600',
      includedFA: ['اقامت ۷ شب (هتل ۵ ستاره + کروز)', 'صبحانه و شام', 'ترانسفر', 'بلیط ورودی تمام اماکن', 'راهنمای فارسی‌زبان'],
      notIncludedFA: ['بلیط هواپیما', 'ویزای مصر', 'انعام‌ها'],
      instructor: 'Dr. Arash Kamali',
      level: TourLevel.INTERMEDIATE,
      isActive: true,
      categoryId: toursCatId,
    },
  });

  await prisma.tourImage.createMany({
    data: [
      { tourId: egyptTour.id, url: 'https://picsum.photos/seed/egypt1/800/600', sortOrder: 0 },
      { tourId: egyptTour.id, url: 'https://picsum.photos/seed/egypt2/800/600', sortOrder: 1 },
    ],
  });

  await prisma.tourDay.createMany({
    data: [
      { tourId: egyptTour.id, day: 1, titleFA: 'ورود به قاهره', descriptionFA: 'ورود به فرودگاه قاهره، ترانسفر به هتل. شام خوش‌آمدگویی و معرفی برنامه سفر.' },
      { tourId: egyptTour.id, day: 2, titleFA: 'اهرام جیزه', descriptionFA: 'بازدید از اهرام ثلاثه و ابوالهول. جلسه مدیتیشن خصوصی در پای هرم بزرگ. موزه مصر.' },
      { tourId: egyptTour.id, day: 3, titleFA: 'پرواز به اقصر', descriptionFA: 'پرواز به اقصر. بازدید از معبد کارناک در غروب. اقامت در کشتی کروز.' },
      { tourId: egyptTour.id, day: 5, titleFA: 'کروز نیل', descriptionFA: 'ادامه کروز در رود نیل. مدیتیشن صبحگاهی روی عرشه. بازدید از معبد کوم امبو.' },
      { tourId: egyptTour.id, day: 8, titleFA: 'صحرای سفید و خداحافظی', descriptionFA: 'بازگشت به قاهره. بازدید از بازار خان الخلیلی. شام اختتامیه و بدرقه.' },
    ],
  });

  console.log('  ✅ Tours seeded');

  // ── Quotes (5) ──────────────────────────────────────────
  await prisma.quote.createMany({
    data: [
      {
        textFA: 'تو خود را آنگونه که باید بشناس، نه آنگونه که دیگران می‌پندارند.',
        textEN: 'Know yourself as you should, not as others perceive you.',
        sourceFA: 'مولانا',
        sourceEN: 'Rumi',
        isActive: true,
      },
      {
        textFA: 'هر نفسی که فرو می‌رود، ممد حیات است و چون برمی‌آید، مفرح ذات.',
        textEN: 'Every breath that goes in is a sustainer of life, and when it comes out, it brings joy to the soul.',
        sourceFA: 'مولانا',
        sourceEN: 'Rumi',
        isActive: true,
      },
      {
        textFA: 'جهان پر از نیروهای جادویی است که صبورانه منتظر بیدار شدن حواس ما هستند.',
        textEN: 'The world is full of magical forces patiently waiting for our senses to awaken.',
        sourceFA: 'ادیس شهید',
        sourceEN: 'Edis Shahid',
        isActive: true,
      },
      {
        textFA: 'وقتی چیزی را با تمام وجود بخواهی، تمام کائنات دست به دست هم می‌دهند تا تو به خواسته‌ات برسی.',
        sourceFA: 'پائولو کوئیلو',
        sourceEN: 'Paulo Coelho',
        isActive: true,
      },
      {
        textFA: 'کائنات از درون تو آغاز می‌شود، نه بیرون. هر آنچه در درون توست، بیرون را می‌سازد.',
        sourceFA: 'اکهارت تُله',
        sourceEN: 'Eckhart Tolle',
        isActive: true,
      },
    ],
  });

  console.log('  ✅ Quotes seeded');
  console.log('🎉 Seed complete!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
