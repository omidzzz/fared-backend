import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

// Helper to generate random items from array
const randomItem = <T>(items: T[]): T =>
  items[Math.floor(Math.random() * items.length)];

// Helper to generate unique slugs
const generateSlug = (text: string): string => {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    faker.string.alphanumeric(6)
  );
};

async function main() {
  console.log("🌱 Seeding database...");

  // ─────────────────────────────────────────────
  // 1. USERS (10)
  // ─────────────────────────────────────────────
  console.log("Creating users...");
  const users = await Promise.all(
    Array.from({ length: 10 }, async (_, i) => {
      const roles = [
        "CUSTOMER",
        "ADMIN",
        "SUPER_ADMIN",
        "MENTOR",
        "INSTRUCTOR",
      ] as const;
      const role =
        i === 0 ? "SUPER_ADMIN" : i === 1 ? "ADMIN" : "CUSTOMER";

      return prisma.user.create({
        data: {
          nameFA: faker.person.firstName() + " " + faker.person.lastName(),
          name: faker.person.fullName(),
          phone: faker.phone.number({ style: "international" }),
          email: faker.internet.email(),
          passwordHash: faker.string.alphanumeric(60),
          avatar: faker.image.avatar(),
          role: role,
          isVerified: faker.datatype.boolean(0.8),
          isActive: true,
          createdAt: faker.date.past({ years: 1 }),
        },
      });
    }),
  );

  // ─────────────────────────────────────────────
  // 2. CATEGORIES (10)
  // ─────────────────────────────────────────────
  console.log("Creating categories...");
  const categories = await Promise.all(
    [
      {
        slug: "stones",
        nameFA: "سنگ‌های قیمتی",
        nameEN: "Stones",
        chakraColor: "--chakra-throat",
        chakraHex: "#2980b9",
      },
      {
        slug: "candles",
        nameFA: "شمع‌ها",
        nameEN: "Candles",
        chakraColor: "--chakra-sacral",
        chakraHex: "#e67e22",
      },
      {
        slug: "accessories",
        nameFA: "اکسسوری‌ها",
        nameEN: "Accessories",
        chakraColor: "--chakra-root",
        chakraHex: "#c0392b",
      },
      {
        slug: "clothes",
        nameFA: "لباس‌ها",
        nameEN: "Clothes",
        chakraColor: "--chakra-heart",
        chakraHex: "#27ae60",
      },
      {
        slug: "crystals",
        nameFA: "کریستال‌ها",
        nameEN: "Crystals",
        chakraColor: "--chakra-third-eye",
        chakraHex: "#8e44ad",
      },
      {
        slug: "meditation",
        nameFA: "مدیتیشن",
        nameEN: "Meditation",
        chakraColor: "--chakra-crown",
        chakraHex: "#f1c40f",
      },
      {
        slug: "books",
        nameFA: "کتاب‌ها",
        nameEN: "Books",
        chakraColor: "--chakra-throat",
        chakraHex: "#3498db",
      },
      {
        slug: "tours",
        nameFA: "تورها",
        nameEN: "Tours",
        chakraColor: "--chakra-sacral",
        chakraHex: "#e67e22",
      },
      {
        slug: "courses",
        nameFA: "دوره‌ها",
        nameEN: "Courses",
        chakraColor: "--chakra-heart",
        chakraHex: "#2ecc71",
      },
      {
        slug: "workshops",
        nameFA: "کارگاه‌ها",
        nameEN: "Workshops",
        chakraColor: "--chakra-root",
        chakraHex: "#e74c3c",
      },
    ].map((cat, index) =>
      prisma.category.create({
        data: {
          ...cat,
          sortOrder: index,
          isActive: true,
        },
      }),
    ),
  );

  // ─────────────────────────────────────────────
  // 3. PRODUCTS (10)
  // ─────────────────────────────────────────────
  console.log("Creating products...");
  const products = await Promise.all(
    Array.from({ length: 10 }, async (_, i) => {
      const types = ["clothes", "candles", "accessories", "stones"];
      const type = types[i % types.length];
      const category = categories[i % categories.length];
      const name = faker.commerce.productName();

      return prisma.product.create({
        data: {
          slug: generateSlug(name),
          categoryId: category.id,
          type: type,
          nameFA: name,
          nameEN: faker.commerce.productName(),
          descriptionFA: faker.lorem.paragraphs(2),
          descriptionEN: faker.lorem.paragraphs(2),
          price: faker.number.int({ min: 100000, max: 5000000 }),
          currency: randomItem(["IRT", "USD"]),
          comparePrice: faker.datatype.boolean(0.3)
            ? faker.number.int({ min: 200000, max: 6000000 })
            : null,
          stock: faker.number.int({ min: 0, max: 100 }),
          isActive: true,
          isFeatured: faker.datatype.boolean(0.3),
          isBestSeller: faker.datatype.boolean(0.2),
          tagsEN: faker.helpers.arrayElements(
            ["crystal", "healing", "energy", "meditation", "spiritual"],
            3,
          ),
          tagsFA: ["کریستال", "انرژی", "مدیتیشن", "شفا", "معنوی"],
          images: {
            create: [
              { url: faker.image.url(), altFA: "تصویر محصول", sortOrder: 0 },
              { url: faker.image.url(), altFA: "تصویر محصول ۲", sortOrder: 1 },
            ],
          },
          attributes: {
            create: [
              { key: "material", valueFA: "پنبه", valueEN: "Cotton" },
              { key: "scent", valueFA: "وانیل", valueEN: "Vanilla" },
            ],
          },
          variants: {
            create: [
              { label: "S", stock: faker.number.int({ min: 0, max: 20 }) },
              { label: "M", stock: faker.number.int({ min: 0, max: 20 }) },
              { label: "L", stock: faker.number.int({ min: 0, max: 20 }) },
            ],
          },
          colorOptions: {
            create: [
              { hex: "#8B2635", nameFA: "قرمز" },
              { hex: "#2C3E50", nameFA: "آبی تیره" },
            ],
          },
        },
      });
    }),
  );

  // ─────────────────────────────────────────────
  // 4. TOURS (10)
  // ─────────────────────────────────────────────
  console.log("Creating tours...");
  const destinations = [
    "Bali",
    "Kyoto",
    "Santorini",
    "Machu Picchu",
    "Reykjavik",
    "Marrakech",
    "Himalayas",
    "Egypt",
    "Peru",
    "Nepal",
  ];
  const tours = await Promise.all(
    Array.from({ length: 10 }, async (_, i) => {
      const startDate = faker.date.future({ years: 1 });
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);
      const destination = destinations[i % destinations.length];
      const category =
        categories.find((c) => c.slug === "tours") || categories[0];

      return prisma.tour.create({
        data: {
          slug: generateSlug(destination),
          destination: destination,
          titleFA: `تور ${destination}`,
          titleEN: `Tour to ${destination}`,
          descriptionFA: faker.lorem.paragraphs(3),
          descriptionEN: faker.lorem.paragraphs(3),
          highlightsFA: [
            "دیدار با افراد محلی",
            "زیارت مکان‌های مقدس",
            "مدیتیشن روزانه",
          ],
          highlightsEN: [
            "Meet locals",
            "Visit sacred sites",
            "Daily meditation",
          ],
          dateRange: `${startDate.toLocaleDateString()} – ${endDate.toLocaleDateString()}`,
          startDate: startDate,
          endDate: endDate,
          durationDays: 7,
          price: faker.number.int({ min: 1000, max: 5000 }),
          currency: "USD",
          spotsTotal: faker.number.int({ min: 10, max: 30 }),
          spotsLeft: faker.number.int({ min: 0, max: 20 }),
          heroImage: faker.image.url(),
          includedFA: ["اقامت", "وعده‌های غذایی", "راهنما"],
          notIncludedFA: ["پرواز", "بیمه"],
          instructor: faker.person.fullName(),
          level: randomItem([
            "BEGINNER",
            "INTERMEDIATE",
            "ALL_LEVELS",
          ] as const),
          isActive: true,
          isFeatured: faker.datatype.boolean(0.3),
          categoryId: category.id,
          images: {
            create: [
              { url: faker.image.url(), sortOrder: 0 },
              { url: faker.image.url(), sortOrder: 1 },
            ],
          },
          itinerary: {
            create: [
              {
                day: 1,
                titleFA: "ورود و استقبال",
                descriptionFA: faker.lorem.paragraph(),
              },
              {
                day: 2,
                titleFA: "بازدید از معبد",
                descriptionFA: faker.lorem.paragraph(),
              },
              {
                day: 3,
                titleFA: "مدیتیشن گروهی",
                descriptionFA: faker.lorem.paragraph(),
              },
            ],
          },
        },
      });
    }),
  );

  // ─────────────────────────────────────────────
  // 5. COURSES (10)
  // ─────────────────────────────────────────────
  console.log("Creating courses...");
  const courses = await Promise.all(
    Array.from({ length: 10 }, async (_, i) => {
      const instructor = users[i % users.length];
      const category =
        categories.find((c) => c.slug === "courses") || categories[0];
      const levels = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
      const languages = ["FA", "EN", "BILINGUAL"] as const;
      const name = faker.lorem.words(3);

      return prisma.course.create({
        data: {
          slug: generateSlug(name),
          nameFA: name,
          nameEN: faker.lorem.words(3),
          descriptionFA: faker.lorem.paragraphs(2),
          descriptionEN: faker.lorem.paragraphs(2),
          price: faker.number.int({ min: 500000, max: 3000000 }),
          currency: "IRT",
          instructorId: instructor.id,
          duration: `${faker.number.int({ min: 4, max: 12 })} weeks`,
          durationWeeks: faker.number.int({ min: 4, max: 12 }),
          lessons: faker.number.int({ min: 10, max: 30 }),
          level: "Beginner",
          language: "En",
          certificate: faker.datatype.boolean(0.7),
          heroImage: faker.image.url(),
          isActive: true,
          isFeatured: faker.datatype.boolean(0.3),
          categoryId: category.id,
          curriculum: {
            create: [
              { order: 1, titleFA: "مقدمه", durationMinutes: 45, isFree: true },
              {
                order: 2,
                titleFA: "درس اول",
                durationMinutes: 60,
                isFree: false,
              },
              {
                order: 3,
                titleFA: "درس دوم",
                durationMinutes: 45,
                isFree: false,
              },
            ],
          },
        },
      });
    }),
  );

  // ─────────────────────────────────────────────
  // 6. MENTORS (7)
  // ─────────────────────────────────────────────
  console.log("Creating mentors...");
  const mentors = await Promise.all(
    users.slice(3, 10).map(async (user) => {
      return prisma.mentor.create({
        data: {
          userId: user.id,
          nameFA: user.nameFA || faker.person.fullName(),
          nameEN: user.name || faker.person.fullName(),
          titleFA: "درمانگر انرژی",
          titleEN: "Energy Healer",
          bioFA: faker.lorem.paragraphs(2),
          bioEN: faker.lorem.paragraphs(2),
          specialtiesFA: ["کریستال", "مدیتیشن", "یوگا"],
          specialtiesEN: ["Crystals", "Meditation", "Yoga"],
          sessionPrice: faker.number.int({ min: 500000, max: 2000000 }),
          sessionDuration: faker.number.int({ min: 30, max: 90 }),
          currency: "IRT",
          rating: faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),
          reviewCount: faker.number.int({ min: 0, max: 50 }),
          image: faker.image.avatar(),
          isAvailable: true,
          calendarUrl: faker.internet.url(),
        },
      });
    }),
  );

  // ─────────────────────────────────────────────
  // 7. ADDRESSES (10)
  // ─────────────────────────────────────────────
  console.log("Creating addresses...");
  await Promise.all(
    users.slice(0, 10).map((user, i) =>
      prisma.address.create({
        data: {
          userId: user.id,
          fullName: user.nameFA || faker.person.fullName(),
          phone: faker.phone.number({ style: "international" }),
          country: "Iran",
          city: faker.location.city(),
          address1: faker.location.streetAddress(),
          address2: faker.datatype.boolean(0.3)
            ? faker.location.secondaryAddress()
            : null,
          postalCode: faker.location.zipCode(),
          notes: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null,
          isDefault: i === 0,
        },
      }),
    ),
  );

  // ─────────────────────────────────────────────
  // 8. ORDERS & ORDER ITEMS (10)
  // ─────────────────────────────────────────────
  console.log("Creating orders...");
  const orders = await Promise.all(
    Array.from({ length: 10 }, async (_, i) => {
      const user = users[i % users.length];
      const product = products[i % products.length];
      const course = courses[i % courses.length];
      const address = await prisma.address.findFirst({
        where: { userId: user.id },
        select: { id: true },
      });

      const statuses = [
        "PENDING",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
      ] as const;
      const paymentMethods = ["IR_GATEWAY", "CARD_TO_CARD"] as const;
      const paymentStatuses = [
        "PENDING",
        "AWAITING_CONFIRMATION",
        "CONFIRMED",
        "FAILED",
      ] as const;

      const subtotal = faker.number.int({ min: 1000000, max: 10000000 });
      const shipping = faker.datatype.boolean(0.5)
        ? faker.number.int({ min: 50000, max: 200000 })
        : 0;
      const discount = faker.datatype.boolean(0.3)
        ? faker.number.int({ min: 100000, max: 500000 })
        : 0;

      return prisma.order.create({
        data: {
          orderNumber: `ORD-${faker.string.alphanumeric(6).toUpperCase()}`,
          userId: user.id,
          status: "PENDING",
          paymentMethod: "IR_GATEWAY",
          paymentStatus: "PENDING",
          subtotal: subtotal,
          shippingAmount: shipping,
          discountAmount: discount,
          total: subtotal + shipping - discount,
          currency: "IRT",
          addressId: address?.id || null,
          notes: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null,
          createdAt: faker.date.past({ years: 1 }),
          items: {
            create: [
              {
                productType: "clothes",
                refId: product.id,
                nameFA: product.nameFA,
                nameEN: product.nameEN || "",
                price: product.price,
                quantity: faker.number.int({ min: 1, max: 3 }),
                variant: "M",
                image: faker.image.url(),
              },
              {
                productType: "course",
                refId: course.id,
                nameFA: course.nameFA,
                nameEN: course.nameEN || "",
                price: course.price,
                quantity: 1,
                image: faker.image.url(),
              },
            ],
          },
        },
      });
    }),
  );

  // ─────────────────────────────────────────────
  // 9. TOUR ENQUIRIES (10)
  // ─────────────────────────────────────────────
  console.log("Creating tour enquiries...");
  await Promise.all(
    Array.from({ length: 10 }, async (_, i) => {
      const tour = tours[i % tours.length];
      const statuses = ["NEW", "CONTACTED", "CONFIRMED", "CANCELLED"] as const;

      return prisma.tourEnquiry.create({
        data: {
          fullName: faker.person.fullName(),
          email: faker.internet.email(),
          phone: faker.phone.number({ style: "international" }),
          tourId: tour.id,
          arrivalDate: faker.date.future({ years: 1 }),
          message: faker.lorem.paragraph(),
          status: "NEW",
          adminNotes: faker.datatype.boolean(0.3)
            ? faker.lorem.sentence()
            : null,
          createdAt: faker.date.past({ years: 1 }),
        },
      });
    }),
  );

  // ─────────────────────────────────────────────
  // 10. REVIEWS (10)
  // ─────────────────────────────────────────────
  console.log("Creating reviews...");
  await Promise.all(
    Array.from({ length: 10 }, async (_, i) => {
      const user = users[i % users.length];
      const product = products[i % products.length];
      const course = courses[i % courses.length];

      return prisma.review.create({
        data: {
          userId: user.id,
          productId: i % 2 === 0 ? product.id : null,
          courseId: i % 2 === 1 ? course.id : null,
          productType: i % 2 === 0 ? "product" : "course",
          rating: faker.number.int({ min: 1, max: 5 }),
          bodyFA: faker.lorem.paragraph(),
          bodyEN: faker.datatype.boolean(0.5) ? faker.lorem.paragraph() : null,
          isApproved: faker.datatype.boolean(0.7),
          adminReply: faker.datatype.boolean(0.3)
            ? faker.lorem.sentence()
            : null,
          adminReplyAt: faker.datatype.boolean(0.3)
            ? faker.date.recent()
            : null,
          createdAt: faker.date.past({ years: 1 }),
        },
      });
    }),
  );

  // ─────────────────────────────────────────────
  // 11. WISHLIST ITEMS (10)
  // ─────────────────────────────────────────────
  console.log("Creating wishlist items...");
  await Promise.all(
    Array.from({ length: 10 }, async (_, i) => {
      const user = users[i % users.length];
      const product = products[i % products.length];
      const course = courses[i % courses.length];

      return prisma.wishlistItem.create({
        data: {
          userId: user.id,
          productId: i % 2 === 0 ? product.id : null,
          courseId: i % 2 === 1 ? course.id : null,
          productType: i % 2 === 0 ? "product" : "course",
        },
      });
    }),
  );

  // ─────────────────────────────────────────────
  // 12. CART ITEMS (10)
  // ─────────────────────────────────────────────
  console.log("Creating cart items...");
  await Promise.all(
    Array.from({ length: 10 }, async (_, i) => {
      const user = users[i % users.length];
      const product = products[i % products.length];
      const course = courses[i % courses.length];
      const mentor = mentors[i % mentors.length];

      const type = i % 3;
      return prisma.cartItem.create({
        data: {
          userId: user.id,
          productId: type === 0 ? product.id : null,
          courseId: type === 1 ? course.id : null,
          mentorId: type === 2 ? mentor.id : null,
          quantity: faker.number.int({ min: 1, max: 3 }),
          createdAt: faker.date.recent(),
        },
      });
    }),
  );

  // ─────────────────────────────────────────────
  // 13. EDUCATIONAL POSTS (10)
  // ─────────────────────────────────────────────
  console.log("Creating educational posts...");
  await Promise.all(
    Array.from({ length: 10 }, async () => {
      const title = faker.lorem.words(5);

      return prisma.educationalPost.create({
        data: {
          slug: generateSlug(title),
          titleFA: title,
          titleEN: faker.lorem.words(5),
          categoryFA: randomItem(["مدیتیشن", "کریستال", "یوگا", "معنویت"]),
          categoryEN: randomItem([
            "Meditation",
            "Crystals",
            "Yoga",
            "Spirituality",
          ]),
          bodyFA: faker.lorem.paragraphs(5),
          bodyEN: faker.datatype.boolean(0.5)
            ? faker.lorem.paragraphs(5)
            : null,
          excerptFA: faker.lorem.sentence(),
          image: faker.image.url(),
          tagsFA: ["معنوی", "انرژی"],
          readMinutes: faker.number.int({ min: 3, max: 15 }),
          isPublished: faker.datatype.boolean(0.7),
          publishedAt: faker.datatype.boolean(0.7) ? faker.date.past() : null,
          authorId: randomItem(users).id,
        },
      });
    }),
  );

  // ─────────────────────────────────────────────
  // 14. BOOKS (10)
  // ─────────────────────────────────────────────
  console.log("Creating books...");
  await Promise.all(
    Array.from({ length: 10 }, async () => {
      const title = faker.lorem.words(4);

      return prisma.book.create({
        data: {
          slug: generateSlug(title),
          titleFA: title,
          titleEN: faker.lorem.words(4),
          authorFA: faker.person.fullName(),
          authorEN: faker.person.fullName(),
          descriptionFA: faker.lorem.paragraphs(2),
          categoryFA: randomItem(["معنوی", "روانشناسی", "فلسفه"]),
          coverImage: faker.image.url(),
          year: faker.number.int({ min: 1900, max: 2024 }),
          pages: faker.number.int({ min: 100, max: 500 }),
          rating: faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),
          isPublished: faker.datatype.boolean(0.7),
        },
      });
    }),
  );

  // ─────────────────────────────────────────────
  // 15. ARTICLES (10)
  // ─────────────────────────────────────────────
  console.log("Creating articles...");
  await Promise.all(
    Array.from({ length: 10 }, async () => {
      const title = faker.lorem.words(5);

      return prisma.article.create({
        data: {
          slug: generateSlug(title),
          titleFA: title,
          excerptFA: faker.lorem.sentence(),
          bodyFA: faker.lorem.paragraphs(4),
          authorFA: faker.person.fullName(),
          categoryFA: randomItem(["معنویت", "سفر", "هنر"]),
          image: faker.image.url(),
          readMinutes: faker.number.int({ min: 3, max: 10 }),
          isFeatured: faker.datatype.boolean(0.3),
          isPublished: faker.datatype.boolean(0.7),
          publishedAt: faker.datatype.boolean(0.7) ? faker.date.past() : null,
        },
      });
    }),
  );

  // ─────────────────────────────────────────────
  // 16. POEMS (10)
  // ─────────────────────────────────────────────
  console.log("Creating poems...");
  await Promise.all(
    Array.from({ length: 10 }, async () => {
      const title = faker.lorem.words(3);
      const lines = Array.from(
        { length: faker.number.int({ min: 4, max: 12 }) },
        () => faker.lorem.sentence(),
      );

      return prisma.poem.create({
        data: {
          slug: generateSlug(title),
          titleFA: title,
          poetFA: faker.person.fullName(),
          poetEN: faker.person.fullName(),
          era: randomItem(["معاصر", "کلاسیک", "رمانتیک"]),
          linesFA: lines,
          theme: ["عشق", "زندگی", "طبیعت", "معنویت"],
          backgroundGradient: `linear-gradient(135deg, #${faker.string
            .hexadecimal({ length: 6 })
            .replace("0x", "")}, #${faker.string
            .hexadecimal({ length: 6 })
            .replace("0x", "")})`,
          isPublished: faker.datatype.boolean(0.7),
        },
      });
    }),
  );

  // ─────────────────────────────────────────────
  // 17. QUOTES (10)
  // ─────────────────────────────────────────────
  console.log("Creating quotes...");
  await Promise.all(
    Array.from({ length: 10 }, async () => {
      return prisma.quote.create({
        data: {
          textFA: faker.lorem.sentence(),
          textEN: faker.datatype.boolean(0.5) ? faker.lorem.sentence() : null,
          sourceFA: faker.person.fullName(),
          sourceEN: faker.datatype.boolean(0.5)
            ? faker.person.fullName()
            : null,
          scheduledDate: faker.datatype.boolean(0.3)
            ? faker.date.future()
            : null,
          isActive: true,
        },
      });
    }),
  );

  // ─────────────────────────────────────────────
  // 18. FORUM TOPICS & REPLIES (10 each)
  // ─────────────────────────────────────────────
  console.log("Creating forum topics...");
  const forumTopics = await Promise.all(
    Array.from({ length: 10 }, async () => {
      const author = randomItem(users);
      const title = faker.lorem.words(4);

      return prisma.forumTopic.create({
        data: {
          slug: generateSlug(title),
          titleFA: title,
          titleEN: faker.lorem.words(4),
          bodyFA: faker.lorem.paragraphs(3),
          bodyEN: faker.datatype.boolean(0.5)
            ? faker.lorem.paragraphs(3)
            : null,
          authorId: author.id,
          category: randomItem(["کریستال", "مدیتیشن", "یوگا", "معنویت"]),
          tags: ["انرژی", "شفا"],
          viewCount: faker.number.int({ min: 0, max: 1000 }),
          isPinned: faker.datatype.boolean(0.1),
          isLocked: faker.datatype.boolean(0.1),
          isApproved: faker.datatype.boolean(0.8),
          createdAt: faker.date.past({ years: 1 }),
        },
      });
    }),
  );

  console.log("Creating forum replies...");
  await Promise.all(
    Array.from({ length: 10 }, async (_, i) => {
      const topic = forumTopics[i % forumTopics.length];
      const author = randomItem(users);

      return prisma.forumReply.create({
        data: {
          topicId: topic.id,
          authorId: author.id,
          bodyFA: faker.lorem.paragraph(),
          bodyEN: faker.datatype.boolean(0.5) ? faker.lorem.paragraph() : null,
          isApproved: faker.datatype.boolean(0.8),
          createdAt: faker.date.recent(),
        },
      });
    }),
  );

  // ─────────────────────────────────────────────
  // 19. NOTIFICATIONS (10)
  // ─────────────────────────────────────────────
  console.log("Creating notifications...");
  await Promise.all(
    Array.from({ length: 10 }, async () => {
      const user = randomItem(users);
      const types = [
        "ORDER_UPDATE",
        "PAYMENT_STATUS",
        "REVIEW_REPLY",
        "MENTORSHIP_REMINDER",
        "TOUR_ENQUIRY_UPDATE",
        "GENERAL",
      ] as const;

      return prisma.notification.create({
        data: {
          userId: user.id,
          type: "ORDER_UPDATE",
          titleFA: faker.lorem.sentence(),
          bodyFA: faker.lorem.paragraph(),
          isRead: faker.datatype.boolean(0.3),
          data: { orderId: faker.string.alphanumeric(8) },
          createdAt: faker.date.recent(),
        },
      });
    }),
  );

  // ─────────────────────────────────────────────
  // 20. MEDIA FILES (10)
  // ─────────────────────────────────────────────
  console.log("Creating media files...");
  await Promise.all(
    Array.from({ length: 10 }, async () => {
      const user = randomItem(users);
      const folders = [
        "products/stones",
        "products/candles",
        "avatars",
        "receipts",
        "tours",
        "courses",
      ];

      return prisma.mediaFile.create({
        data: {
          url: faker.image.url(),
          key: `${randomItem(folders)}/${faker.string.alphanumeric(16)}.jpg`,
          mimeType: "image/jpeg",
          sizeBytes: faker.number.int({ min: 100000, max: 5000000 }),
          uploadedBy: user.id,
          folder: randomItem(folders),
          createdAt: faker.date.past({ years: 1 }),
        },
      });
    }),
  );

  // ─────────────────────────────────────────────
  // 21. PAYMENT RECEIPTS (10)
  // ─────────────────────────────────────────────
  console.log("Creating payment receipts...");
  await Promise.all(
    orders.slice(0, 10).map((order, i) => {
      const statuses = ["PENDING", "APPROVED", "REJECTED"] as const;
      const user = users[i % users.length];

      return prisma.paymentReceipt.create({
        data: {
          orderId: order.id,
          userId: user.id,
          imageUrl: faker.image.url(),
          amount: order.total,
          status: "APPROVED",
          reviewedBy: faker.datatype.boolean(0.5) ? randomItem(users).id : null,
          reviewedAt: faker.datatype.boolean(0.5) ? faker.date.recent() : null,
          rejectReason: faker.datatype.boolean(0.2)
            ? faker.lorem.sentence()
            : null,
          uploadedAt: faker.date.recent(),
        },
      });
    }),
  );

  // ─────────────────────────────────────────────
  // 22. MENTORSHIP SESSIONS (10)
  // ─────────────────────────────────────────────
  console.log("Creating mentorship sessions...");
  await Promise.all(
    Array.from({ length: 10 }, async (_, i) => {
      const user = users[i % users.length];
      const mentor = mentors[i % mentors.length];
      const order = orders[i % orders.length];
      const statuses = [
        "PENDING",
        "SCHEDULED",
        "COMPLETED",
        "CANCELLED",
      ] as const;

      return prisma.mentorshipSession.create({
        data: {
          userId: user.id,
          mentorId: mentor.id,
          scheduledAt: faker.date.future({ years: 1 }),
          status: "COMPLETED",
          notes: faker.datatype.boolean(0.3) ? faker.lorem.paragraph() : null,
          orderId: order.id,
          createdAt: faker.date.past({ years: 1 }),
        },
      });
    }),
  );

  // ─────────────────────────────────────────────
  // 23. COURSE ENROLLMENTS (10)
  // ─────────────────────────────────────────────
  console.log("Creating course enrollments...");
  await Promise.all(
    Array.from({ length: 10 }, async (_, i) => {
      const user = users[i % users.length];
      const course = courses[i % courses.length];
      const order = orders[i % orders.length];

      return prisma.courseEnrollment.create({
        data: {
          userId: user.id,
          courseId: course.id,
          orderId: order.id,
          createdAt: faker.date.past({ years: 1 }),
        },
      });
    }),
  );

  console.log("✅ Seeding completed successfully!");
  console.log(
    `📊 Created: ${users.length} users, ${categories.length} categories, ${products.length} products, ${tours.length} tours, ${courses.length} courses, and more!`,
  );
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
