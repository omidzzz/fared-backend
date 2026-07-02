# PROJECT.md — fared-backend (v2.0 — Final)

> Technical reference for the fared-backend API: full database schema, API route
> tables, payment/auth flows, storage layout, and coding conventions.
> For delivery status and known gaps see [HANDOFF.md](HANDOFF.md); for a quick
> start see [README.md](README.md).

## Project Reference

| Field                | Value                                                        |
| -------------------- | ------------------------------------------------------------ |
| **Repo**             | `fared-backend`                                              |
| **Platform**         | Aura Mystic — Premium spiritual/mystical e-commerce          |
| **Repos**            | `fared-frontend` · `fared-backend` · `fared-admin` (3 total) |
| **Target market**    | Persian-speaking users (Iran + diaspora), English secondary  |
| **Deploy**           | Liara.ir — Node.js managed app                               |
| **Domain**           | `api.faredvibe.ir`                                           |
| **Frontend env var** | `NEXT_PUBLIC_MEDUSA_URL` → points to this backend            |

---

## 🏗️ Tech Stack

| Layer           | Choice                     | Reason                                |
| --------------- | -------------------------- | ------------------------------------- |
| Runtime         | Node.js 20 LTS             | Stable, Liara first-class support     |
| Framework       | Express.js                 | Lightweight, well-understood          |
| Language        | TypeScript (strict)        | Type safety, matches frontend         |
| ORM             | Prisma                     | Migrations, type generation, great DX |
| Database        | PostgreSQL 15              | Relational, handles orders/forum well |
| Auth            | JWT (access + refresh)     | Stateless, scalable                   |
| OTP             | Custom — Kavenegar SMS API | Iranian SMS gateway                   |
| Storage         | AWS SDK v3 (S3-compatible) | Liara Object Storage                  |
| Validation      | Zod                        | Runtime schema validation             |
| File upload     | Multer (memory storage)    | In-memory before S3 upload            |
| Logging         | Morgan + console           | Request logs                          |
| Process manager | PM2                        | Production process management         |

---

## 📁 Project Structure

```
fared-backend/
├── PROJECT.md
├── package.json
├── tsconfig.json
├── .env
├── .env.example
├── .gitignore
├── ecosystem.config.js          ← PM2 config
├── liara.json                   ← Liara deploy config
├── Dockerfile
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
└── src/
    ├── index.ts                 ← Entry point
    ├── app.ts                   ← Express setup, middleware, routes
    ├── config/
    │   ├── env.ts               ← Zod-validated env vars
    │   ├── database.ts          ← Prisma singleton
    │   └── storage.ts           ← S3 client for Liara
    ├── middleware/
    │   ├── auth.ts              ← JWT verify, attach req.user
    │   ├── adminAuth.ts         ← Admin/SuperAdmin guard
    │   ├── errorHandler.ts      ← Global error handler + AppError class
    │   ├── notFound.ts          ← 404 handler
    │   └── upload.ts            ← Multer config (images, 5MB max)
    ├── modules/
    │   ├── auth/                ← OTP + email/password + JWT
    │   ├── users/               ← Profile, avatar
    │   ├── categories/          ← 7 chakra categories
    │   ├── products/            ← Base products + images
    │   ├── clothes/             ← Extends product: sizes, colors, material
    │   ├── stones/              ← Extends product: properties, origin
    │   ├── candles/             ← Extends product: scent, burnTime
    │   ├── accessories/         ← Extends product: material, usage
    │   ├── courses/             ← Extends product: curriculum, instructor
    │   ├── mentors/             ← Mentor profiles, sessions, booking
    │   ├── tours/               ← Tour listings + TourEnquiry (NOT direct purchase)
    │   ├── cart/                ← Session cart, sync on login
    │   ├── orders/              ← Order lifecycle
    │   ├── payments/            ← Gateway + card-to-card receipt
    │   ├── reviews/             ← Comments with admin moderation
    │   ├── wishlist/
    │   ├── addresses/
    │   ├── notifications/
    │   ├── quotes/              ← Quote of the day
    │   ├── editorial/           ← EducationalPost, Book, Article, Poem
    │   ├── forum/               ← ForumTopic + ForumReply
    │   ├── media/               ← File upload to Object Storage
    │   └── admin/               ← Admin dashboard stats
    ├── utils/
    │   ├── response.ts          ← Standard API response helpers
    │   ├── pagination.ts
    │   ├── slug.ts
    │   ├── otp.ts               ← OTP generate + hash + verify
    │   └── sms.ts               ← Kavenegar integration
    └── types/
        ├── express.d.ts         ← Extend Request with req.user
        └── index.ts
```

---

## 🗄️ Full Database Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

enum Role {
  CUSTOMER
  ADMIN
  SUPER_ADMIN
  MENTOR
  INSTRUCTOR
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

enum PaymentMethod {
  IR_GATEWAY
  CARD_TO_CARD
}

enum PaymentStatus {
  PENDING
  AWAITING_CONFIRMATION // card-to-card: receipt uploaded, waiting admin
  CONFIRMED
  FAILED
}

enum ReceiptStatus {
  PENDING
  APPROVED
  REJECTED
}

enum TourEnquiryStatus {
  NEW
  CONTACTED
  CONFIRMED
  CANCELLED
}

enum BookingStatus {
  PENDING
  SCHEDULED
  COMPLETED
  CANCELLED
}

enum CourseLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

enum TourLevel {
  BEGINNER
  INTERMEDIATE
  ALL_LEVELS
}

enum CourseLanguage {
  FA
  EN
  BILINGUAL
}

enum NotificationType {
  ORDER_UPDATE
  PAYMENT_STATUS
  REVIEW_REPLY
  MENTORSHIP_REMINDER
  TOUR_ENQUIRY_UPDATE
  GENERAL
}

// ─────────────────────────────────────────────
// USERS & AUTH
// ─────────────────────────────────────────────

model User {
  id           String   @id @default(cuid())
  nameFA       String?
  name         String?
  phone        String?  @unique
  email        String?  @unique
  passwordHash String?
  avatar       String?
  role         Role     @default(CUSTOMER)
  isVerified   Boolean  @default(false)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  otps                 OTP[]
  refreshTokens        RefreshToken[]
  addresses            Address[]
  orders               Order[]
  cartItems            CartItem[]
  wishlistItems        WishlistItem[]
  reviews              Review[]
  notifications        Notification[]
  forumTopics          ForumTopic[]
  forumReplies         ForumReply[]
  mentorProfile        Mentor?
  instructorCourses    Course[]       @relation("CourseInstructor")
  mentorshipSessions   MentorshipSession[]
  paymentReceipts      PaymentReceipt[]
}

model OTP {
  id        String   @id @default(cuid())
  phone     String
  code      String   // stored as SHA-256 hash
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())
  userId    String?
  user      User?    @relation(fields: [userId], references: [id])
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique // SHA-256 hash
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ─────────────────────────────────────────────
// ADDRESSES
// ─────────────────────────────────────────────

model Address {
  id          String  @id @default(cuid())
  userId      String
  fullName    String
  phone       String
  country     String
  city        String
  address1    String  @db.Text
  address2    String?
  postalCode  String
  notes       String?
  isDefault   Boolean @default(false)
  user        User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  orders      Order[]
}

// ─────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────

model Category {
  id          String    @id @default(cuid())
  slug        String    @unique // e.g. "stones", "candles"
  nameFA      String
  nameEN      String
  chakraColor String    // CSS var name: "--chakra-throat"
  chakraHex   String    // "#2980b9"
  sortOrder   Int       @default(0)
  isActive    Boolean   @default(true)
  products    Product[]
  tours       Tour[]
  courses     Course[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

// ─────────────────────────────────────────────
// PRODUCTS (base + typed extensions)
// ─────────────────────────────────────────────

model Product {
  id           String   @id @default(cuid())
  slug         String   @unique
  categoryId   String
  // type discriminator: 'clothes' | 'candles' | 'accessories' | 'stones'
  // courses and mentorship handled in separate models
  type         String
  nameFA       String
  nameEN       String
  descriptionFA String  @db.Text
  descriptionEN String? @db.Text
  price        Int      // Integer: Toman for IRT, cents for USD
  currency     String   @default("IRT") // 'IRT' | 'USD'
  comparePrice Int?
  stock        Int      @default(0)
  isActive     Boolean  @default(true)
  isFeatured   Boolean  @default(false)
  isBestSeller Boolean  @default(false)
  tagsEN       String[] // PostgreSQL array
  tagsFA       String[]
  category     Category @relation(fields: [categoryId], references: [id])
  images       ProductImage[]
  attributes   ProductAttribute[]
  variants     ProductVariant[]   // sizes for clothes
  colorOptions ProductColor[]     // colors for clothes
  cartItems    CartItem[]
  wishlistItems WishlistItem[]
  orderItems   OrderItem[]
  reviews      Review[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model ProductImage {
  id        String  @id @default(cuid())
  url       String
  altFA     String?
  sortOrder Int     @default(0)
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
}

// Generic key-value for type-specific fields
// e.g. key="scent" valueFA="وانیل" valueEN="Vanilla"
//      key="burnTime" valueFA="۴۰-۵۰ ساعت" valueEN="40-50 hours"
//      key="property" valueFA="آرامش" valueEN="Calm"
//      key="origin" valueFA="برزیل" valueEN="Brazil"
//      key="material" valueFA="نخ پنبه‌ای" valueEN="Cotton"
//      key="intention" valueFA="محافظت" valueEN="Protection"
model ProductAttribute {
  id        String  @id @default(cuid())
  key       String
  valueFA   String
  valueEN   String?
  sortOrder Int     @default(0)
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
}

model ProductVariant {
  id        String  @id @default(cuid())
  label     String  // "XS" | "S" | "M" | "L" | "XL" | "XXL"
  stock     Int     @default(0)
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
}

model ProductColor {
  id        String  @id @default(cuid())
  hex       String  // e.g. "#8B2635"
  nameFA    String?
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
}

// ─────────────────────────────────────────────
// TOURS
// ─────────────────────────────────────────────

model Tour {
  id            String    @id @default(cuid())
  slug          String    @unique
  destination   String    // e.g. "Bali"
  titleFA       String
  titleEN       String?
  descriptionFA String    @db.Text
  descriptionEN String?   @db.Text
  highlightsFA  String[]
  highlightsEN  String[]
  dateRange     String    // display string: "Jul 12 – Jul 19, 2026"
  startDate     DateTime
  endDate       DateTime
  durationDays  Int
  price         Int
  currency      String    @default("USD")
  spotsTotal    Int
  spotsLeft     Int
  heroImage     String?
  images        TourImage[]
  includedFA    String[]
  notIncludedFA String[]
  itinerary     TourDay[]
  instructor    String    // guide name (plain text)
  level         TourLevel @default(ALL_LEVELS)
  isActive      Boolean   @default(true)
  isFeatured    Boolean   @default(false)
  categoryId    String
  category      Category  @relation(fields: [categoryId], references: [id])
  enquiries     TourEnquiry[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model TourImage {
  id        String @id @default(cuid())
  url       String
  sortOrder Int    @default(0)
  tourId    String
  tour      Tour   @relation(fields: [tourId], references: [id], onDelete: Cascade)
}

model TourDay {
  id            String @id @default(cuid())
  day           Int
  titleFA       String
  descriptionFA String @db.Text
  tourId        String
  tour          Tour   @relation(fields: [tourId], references: [id], onDelete: Cascade)
}

// Tours use ENQUIRY flow, not direct purchase
model TourEnquiry {
  id          String            @id @default(cuid())
  fullName    String
  email       String
  phone       String?
  tourId      String
  arrivalDate DateTime?
  message     String?           @db.Text
  status      TourEnquiryStatus @default(NEW)
  adminNotes  String?
  tour        TourEnquiry_Tour? @relation(name: "TourToEnquiry", fields: [tourId], references: [id])
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  @@index([tourId])
}

// Fix: direct relation without alias confusion
// ─────────────────────────────────────────────
// COURSES
// ─────────────────────────────────────────────

model Course {
  id            String       @id @default(cuid())
  slug          String       @unique
  nameFA        String
  nameEN        String?
  descriptionFA String       @db.Text
  descriptionEN String?      @db.Text
  price         Int
  currency      String       @default("IRT")
  instructorId  String
  instructor    User         @relation("CourseInstructor", fields: [instructorId], references: [id])
  duration      String       // display: "8 weeks"
  durationWeeks Int
  lessons       Int
  level         CourseLevel  @default(BEGINNER)
  language      CourseLanguage @default(FA)
  certificate   Boolean      @default(false)
  heroImage     String?
  isActive      Boolean      @default(true)
  isFeatured    Boolean      @default(false)
  categoryId    String
  category      Category     @relation(fields: [categoryId], references: [id])
  curriculum    CourseLesson[]
  enrollments   CourseEnrollment[]
  reviews       Review[]
  wishlistItems WishlistItem[]
  orderItems    OrderItem[]
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}

model CourseLesson {
  id              String  @id @default(cuid())
  order           Int
  titleFA         String
  titleEN         String?
  durationMinutes Int
  isFree          Boolean @default(false) // preview lesson
  courseId        String
  course          Course  @relation(fields: [courseId], references: [id], onDelete: Cascade)
}

model CourseEnrollment {
  id       String  @id @default(cuid())
  userId   String
  courseId String
  orderId  String?
  course   Course  @relation(fields: [courseId], references: [id])
  createdAt DateTime @default(now())

  @@unique([userId, courseId])
}

// ─────────────────────────────────────────────
// MENTORSHIP
// ─────────────────────────────────────────────

model Mentor {
  id              String  @id @default(cuid())
  userId          String  @unique
  nameFA          String
  nameEN          String?
  titleFA         String  // e.g. "درمانگر انرژی کریستال"
  titleEN         String?
  bioFA           String  @db.Text
  bioEN           String? @db.Text
  specialtiesFA   String[]
  specialtiesEN   String[]
  sessionPrice    Int
  sessionDuration Int     // minutes
  currency        String  @default("USD")
  rating          Float   @default(0)
  reviewCount     Int     @default(0)
  image           String?
  isAvailable     Boolean @default(true)
  calendarUrl     String?
  user            User    @relation(fields: [userId], references: [id])
  sessions        MentorshipSession[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model MentorshipSession {
  id          String        @id @default(cuid())
  userId      String
  mentorId    String
  scheduledAt DateTime?
  status      BookingStatus @default(PENDING)
  notes       String?       @db.Text
  orderId     String?
  user        User          @relation(fields: [userId], references: [id])
  mentor      Mentor        @relation(fields: [mentorId], references: [id])
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

// ─────────────────────────────────────────────
// CART & ORDERS
// ─────────────────────────────────────────────

model CartItem {
  id        String   @id @default(cuid())
  userId    String
  // One of these is set — products, courses, or mentorship sessions
  productId String?
  courseId  String?
  mentorId  String?  // for booking a mentorship session
  variantId String?  // size variant for clothes
  quantity  Int      @default(1)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  product   Product? @relation(fields: [productId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Order {
  id                   String        @id @default(cuid())
  orderNumber          String        @unique // "ORD-8X2KP9"
  userId               String
  status               OrderStatus   @default(PENDING)
  paymentMethod        PaymentMethod
  paymentStatus        PaymentStatus @default(PENDING)
  paymentConfirmedBy   String?       // admin userId
  paymentConfirmedAt   DateTime?
  subtotal             Int
  shippingAmount       Int           @default(0)
  discountAmount       Int           @default(0)
  total                Int
  currency             String        @default("IRT")
  addressId            String?
  trackingCode         String?
  notes                String?       @db.Text
  user                 User          @relation(fields: [userId], references: [id])
  address              Address?      @relation(fields: [addressId], references: [id])
  items                OrderItem[]
  receipt              PaymentReceipt?
  mentorshipSessions   MentorshipSession[]
  createdAt            DateTime      @default(now())
  updatedAt            DateTime      @updatedAt
}

model OrderItem {
  id          String  @id @default(cuid())
  orderId     String
  // Type of item
  productType String  // 'clothes' | 'candle' | 'accessory' | 'stone' | 'course' | 'mentorship'
  refId       String  // productId or courseId or mentorId — snapshot ref
  nameFA      String  // name snapshot at time of order
  nameEN      String?
  price       Int     // price snapshot
  quantity    Int
  variant     String? // size for clothes
  image       String? // first image snapshot
  order       Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
}

// ─────────────────────────────────────────────
// PAYMENTS
// ─────────────────────────────────────────────

// For card-to-card: user uploads a receipt image
model PaymentReceipt {
  id           String        @id @default(cuid())
  orderId      String        @unique
  userId       String
  imageUrl     String        // Object Storage URL
  amount       Int
  status       ReceiptStatus @default(PENDING)
  reviewedBy   String?       // admin userId
  reviewedAt   DateTime?
  rejectReason String?
  order        Order         @relation(fields: [orderId], references: [id])
  user         User          @relation(fields: [userId], references: [id])
  uploadedAt   DateTime      @default(now())
}

// ─────────────────────────────────────────────
// REVIEWS / COMMENTS
// ─────────────────────────────────────────────

model Review {
  id          String   @id @default(cuid())
  userId      String
  // One of these targets is set
  productId   String?
  courseId    String?
  productType String?  // for display/routing
  rating      Int      // 1–5
  bodyFA      String   @db.Text
  bodyEN      String?  @db.Text
  isApproved  Boolean  @default(false) // admin must approve
  adminReply  String?  @db.Text
  adminReplyAt DateTime?
  user        User     @relation(fields: [userId], references: [id])
  product     Product? @relation(fields: [productId], references: [id])
  course      Course?  @relation(fields: [courseId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// ─────────────────────────────────────────────
// WISHLIST
// ─────────────────────────────────────────────

model WishlistItem {
  id          String   @id @default(cuid())
  userId      String
  productId   String?
  courseId    String?
  productType String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  product     Product? @relation(fields: [productId], references: [id])
  course      Course?  @relation(fields: [courseId], references: [id])
  addedAt     DateTime @default(now())

  @@unique([userId, productId])
}

// ─────────────────────────────────────────────
// EDITORIAL (تحریریه)
// ─────────────────────────────────────────────

model EducationalPost {
  id          String   @id @default(cuid())
  slug        String   @unique
  titleFA     String
  titleEN     String?
  categoryFA  String
  categoryEN  String?
  bodyFA      String   @db.Text
  bodyEN      String?  @db.Text
  excerptFA   String
  image       String?
  tagsFA      String[]
  readMinutes Int      @default(5)
  isPublished Boolean  @default(false)
  publishedAt DateTime?
  authorId    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Book {
  id            String  @id @default(cuid())
  slug          String  @unique
  titleFA       String
  titleEN       String?
  authorFA      String
  authorEN      String?
  descriptionFA String  @db.Text
  categoryFA    String
  coverImage    String?
  year          Int?
  pages         Int?
  rating        Float   @default(0) // curated, not user-generated
  isPublished   Boolean @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Article {
  id          String   @id @default(cuid())
  slug        String   @unique
  titleFA     String
  excerptFA   String
  bodyFA      String   @db.Text
  authorFA    String
  categoryFA  String
  image       String?
  readMinutes Int      @default(5)
  isFeatured  Boolean  @default(false)
  isPublished Boolean  @default(false)
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Poem {
  id                 String   @id @default(cuid())
  slug               String   @unique
  titleFA            String
  poetFA             String
  poetEN             String?
  era                String?
  linesFA            String[] // array of lines
  theme              String[]
  backgroundGradient String?  // CSS gradient for card display
  isPublished        Boolean  @default(false)
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}

// ─────────────────────────────────────────────
// QUOTE OF THE DAY
// ─────────────────────────────────────────────

model Quote {
  id            String    @id @default(cuid())
  textFA        String    @db.Text
  textEN        String?
  sourceFA      String    // attribution
  sourceEN      String?
  scheduledDate DateTime? // null = goes into random pool
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
}

// ─────────────────────────────────────────────
// FORUM
// ─────────────────────────────────────────────

model ForumTopic {
  id          String       @id @default(cuid())
  slug        String       @unique
  titleFA     String
  titleEN     String?
  bodyFA      String       @db.Text
  bodyEN      String?      @db.Text
  authorId    String
  category    String
  tags        String[]
  viewCount   Int          @default(0)
  isPinned    Boolean      @default(false)
  isLocked    Boolean      @default(false)
  isApproved  Boolean      @default(false) // admin must approve
  author      User         @relation(fields: [authorId], references: [id])
  replies     ForumReply[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model ForumReply {
  id         String     @id @default(cuid())
  topicId    String
  authorId   String
  bodyFA     String     @db.Text
  bodyEN     String?
  isApproved Boolean    @default(false)
  topic      ForumTopic @relation(fields: [topicId], references: [id], onDelete: Cascade)
  author     User       @relation(fields: [authorId], references: [id])
  createdAt  DateTime   @default(now())
}

// ─────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────

model Notification {
  id        String           @id @default(cuid())
  userId    String
  type      NotificationType
  titleFA   String
  bodyFA    String
  isRead    Boolean          @default(false)
  data      Json?            // extra payload (orderId, enquiryId, etc.)
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime         @default(now())
}

// ─────────────────────────────────────────────
// MEDIA LIBRARY
// ─────────────────────────────────────────────

model MediaFile {
  id         String   @id @default(cuid())
  url        String
  key        String   @unique // storage path: "products/stones/amethyst.jpg"
  mimeType   String
  sizeBytes  Int
  uploadedBy String   // userId
  folder     String   // e.g. "products/stones", "receipts", "avatars"
  createdAt  DateTime @default(now())
}
```

---

## 🔌 API Endpoints

### Auth — `/api/auth`

| Method | Path          | Auth   | Description                        |
| ------ | ------------- | ------ | ---------------------------------- |
| POST   | `/send-otp`   | Public | Send OTP to phone                  |
| POST   | `/verify-otp` | Public | Verify OTP, return JWT             |
| POST   | `/login`      | Public | Email + password login             |
| POST   | `/register`   | Public | Create account with email/password |
| POST   | `/logout`     | Bearer | Invalidate refresh token           |
| POST   | `/refresh`    | Public | Refresh access token               |
| GET    | `/me`         | Bearer | Get current user                   |
| PUT    | `/profile`    | Bearer | Update profile                     |

### Products — `/api/products`

| Method | Path             | Auth   | Description                                                             |
| ------ | ---------------- | ------ | ----------------------------------------------------------------------- |
| GET    | `/`              | Public | All products, filterable by `?category=&featured=&search=&page=&limit=` |
| GET    | `/:id`           | Public | Product detail with images, attributes                                  |
| GET    | `/category/:cat` | Public | Products by category slug                                               |
| GET    | `/featured`      | Public | Featured + bestsellers                                                  |
| GET    | `/search`        | Public | `?q=keyword`                                                            |

### Category-specific — `/api/stones`, `/api/candles`, `/api/clothes`, `/api/accessories`

| Method | Path     | Auth   | Description                        |
| ------ | -------- | ------ | ---------------------------------- |
| GET    | `/`      | Public | List with category-specific fields |
| GET    | `/:slug` | Public | Detail with all attributes         |

### Courses — `/api/courses`

| Method | Path              | Auth   | Description            |
| ------ | ----------------- | ------ | ---------------------- |
| GET    | `/`               | Public | List courses           |
| GET    | `/:slug`          | Public | Course detail          |
| GET    | `/:id/curriculum` | Public | Course lessons         |
| POST   | `/:id/enroll`     | Bearer | Enroll (creates order) |

### Mentors — `/api/mentors`

| Method | Path                | Auth   | Description            |
| ------ | ------------------- | ------ | ---------------------- |
| GET    | `/`                 | Public | List available mentors |
| GET    | `/:id`              | Public | Mentor detail          |
| GET    | `/:id/availability` | Public | Available slots        |
| POST   | `/:id/book`         | Bearer | Book session           |
| GET    | `/sessions/my`      | Bearer | User's booked sessions |

### Tours — `/api/tours`

| Method | Path       | Auth   | Description                                   |
| ------ | ---------- | ------ | --------------------------------------------- |
| GET    | `/`        | Public | List tours                                    |
| GET    | `/:slug`   | Public | Tour detail with itinerary                    |
| POST   | `/enquiry` | Public | Submit tour enquiry form (**NOT a purchase**) |

### Cart — `/api/cart`

| Method | Path              | Auth   | Description                                                           |
| ------ | ----------------- | ------ | --------------------------------------------------------------------- |
| GET    | `/`               | Bearer | Get cart with totals                                                  |
| POST   | `/add`            | Bearer | Add item `{ productId?, courseId?, mentorId?, variantId?, quantity }` |
| PUT    | `/update`         | Bearer | Update `{ itemId, quantity }`                                         |
| DELETE | `/remove/:itemId` | Bearer | Remove item                                                           |
| DELETE | `/clear`          | Bearer | Empty cart                                                            |

### Orders — `/api/orders`

| Method | Path           | Auth   | Description                       |
| ------ | -------------- | ------ | --------------------------------- |
| POST   | `/`            | Bearer | Create order from cart            |
| GET    | `/`            | Bearer | User's order history              |
| GET    | `/:id`         | Bearer | Order detail                      |
| POST   | `/:id/receipt` | Bearer | Upload card-to-card receipt image |

### Wishlist — `/api/wishlist`

| Method | Path                 | Auth   | Description  |
| ------ | -------------------- | ------ | ------------ |
| GET    | `/`                  | Bearer | Get wishlist |
| POST   | `/add`               | Bearer | Add item     |
| DELETE | `/remove/:productId` | Bearer | Remove item  |

### Addresses — `/api/addresses`

| Method | Path           | Auth   | Description    |
| ------ | -------------- | ------ | -------------- |
| GET    | `/`            | Bearer | List addresses |
| POST   | `/`            | Bearer | Create         |
| PUT    | `/:id`         | Bearer | Update         |
| DELETE | `/:id`         | Bearer | Delete         |
| PATCH  | `/:id/default` | Bearer | Set as default |

### Reviews (Comments) — `/api/products/:id/comments`

| Method | Path                         | Auth   | Description          |
| ------ | ---------------------------- | ------ | -------------------- |
| GET    | `/api/products/:id/comments` | Public | Approved reviews     |
| POST   | `/api/products/:id/comments` | Bearer | Submit review        |
| GET    | `/api/courses/:id/comments`  | Public | Course reviews       |
| POST   | `/api/courses/:id/comments`  | Bearer | Submit course review |

### Quotes — `/api/quotes`

| Method | Path     | Auth   | Description   |
| ------ | -------- | ------ | ------------- |
| GET    | `/today` | Public | Today's quote |
| GET    | `/`      | Admin  | All quotes    |
| POST   | `/`      | Admin  | Create quote  |
| PUT    | `/:id`   | Admin  | Update quote  |

### Editorial (تحریریه) — `/api/editorial`

| Method | Path                 | Auth   | Description            |
| ------ | -------------------- | ------ | ---------------------- |
| GET    | `/educational`       | Public | List educational posts |
| GET    | `/educational/:slug` | Public | Post detail            |
| GET    | `/books`             | Public | List books             |
| GET    | `/books/:slug`       | Public | Book detail            |
| GET    | `/articles`          | Public | List articles          |
| GET    | `/articles/:slug`    | Public | Article detail         |
| GET    | `/poems`             | Public | List poems             |
| GET    | `/poems/:slug`       | Public | Poem detail            |
| POST   | `/educational`       | Admin  | Create post            |
| PUT    | `/educational/:id`   | Admin  | Update post            |
| POST   | `/books`             | Admin  | Create book            |
| POST   | `/articles`          | Admin  | Create article         |
| POST   | `/poems`             | Admin  | Create poem            |

### Forum — `/api/forum`

| Method | Path                  | Auth   | Description                     |
| ------ | --------------------- | ------ | ------------------------------- |
| GET    | `/topics`             | Public | List approved topics            |
| GET    | `/topics/:slug`       | Public | Topic with replies              |
| POST   | `/topics`             | Bearer | Create topic (pending approval) |
| POST   | `/topics/:id/replies` | Bearer | Add reply (pending approval)    |

### Notifications — `/api/notifications`

| Method | Path        | Auth   | Description        |
| ------ | ----------- | ------ | ------------------ |
| GET    | `/`         | Bearer | List notifications |
| PATCH  | `/:id/read` | Bearer | Mark read          |
| PATCH  | `/read-all` | Bearer | Mark all read      |

### Admin — `/api/admin`

| Method | Path                         | Auth  | Description                     |
| ------ | ---------------------------- | ----- | ------------------------------- |
| GET    | `/stats`                     | Admin | Dashboard stats                 |
| GET    | `/orders`                    | Admin | All orders paginated            |
| PUT    | `/orders/:id/status`         | Admin | Update order status             |
| GET    | `/receipts`                  | Admin | Pending card-to-card receipts   |
| PUT    | `/receipts/:id/approve`      | Admin | Approve receipt → confirm order |
| PUT    | `/receipts/:id/reject`       | Admin | Reject with reason              |
| GET    | `/enquiries`                 | Admin | Tour enquiries                  |
| PUT    | `/enquiries/:id/status`      | Admin | Update enquiry status           |
| GET    | `/comments`                  | Admin | Moderation queue                |
| PUT    | `/comments/:id/approve`      | Admin | Approve comment                 |
| POST   | `/comments/:id/reply`        | Admin | Admin reply                     |
| GET    | `/forum`                     | Admin | Forum moderation queue          |
| PUT    | `/forum/topics/:id/approve`  | Admin | Approve forum topic             |
| PUT    | `/forum/replies/:id/approve` | Admin | Approve forum reply             |
| GET    | `/users`                     | Admin | List users                      |
| PUT    | `/products/:id`              | Admin | Update product                  |
| POST   | `/products`                  | Admin | Create product                  |
| DELETE | `/products/:id`              | Admin | Soft-delete product             |

---

## 💳 Payment Flows

### IR Gateway (درگاه پرداخت)

```
1. POST /api/orders → create order (status: PENDING, paymentStatus: PENDING)
2. Backend calls gateway API (ZarinPal/IDPay) → gets payment URL
3. Return { orderId, paymentUrl } to frontend
4. Frontend redirects user to payment URL
5. Gateway redirects to: GET /api/payments/callback?status=OK&authority=xxx
6. Backend verifies with gateway
7. Update: paymentStatus=CONFIRMED, orderStatus=PROCESSING
8. Redirect to: {FRONTEND_URL}/payment/success?orderId=xxx
```

### Card-to-Card (کارت به کارت)

```
1. POST /api/orders → create order (paymentMethod: CARD_TO_CARD)
2. Frontend shows bank card number from env (CARD_TO_CARD_NUMBER)
3. User transfers money via banking app
4. POST /api/orders/:id/receipt → upload screenshot (multipart/form-data)
5. Backend uploads image to Object Storage at receipts/{orderId}/{filename}
6. Create PaymentReceipt record (status: PENDING)
7. Update order paymentStatus: AWAITING_CONFIRMATION
8. Admin sees in /api/admin/receipts
9. Admin approves → paymentStatus=CONFIRMED, orderStatus=PROCESSING
   Admin rejects → paymentStatus=FAILED, send notification with reason
10. User sees status in profile orders page
```

---

## 🔐 Auth Flows

### Phone OTP (primary)

```
POST /api/auth/send-otp   { phone: "09123456789" }
  → generate 5-digit OTP, SHA-256 hash, store with 2-min expiry
  → send via Kavenegar SMS
  → return { success: true }

POST /api/auth/verify-otp  { phone, code }
  → validate hash + expiry + not used
  → find or create User record
  → generate accessToken (15m) + refreshToken (30d, stored as hash)
  → return { accessToken, refreshToken, user }
```

### Email + Password (secondary)

```
POST /api/auth/register  { nameFA, email, password }
  → hash password with bcrypt (rounds: 12)
  → create User
  → generate tokens
  → return { accessToken, refreshToken, user }

POST /api/auth/login  { email, password }
  → find user, verify bcrypt hash
  → generate tokens
  → return { accessToken, refreshToken, user }
```

---

## 🗂️ File Storage Structure

```
Object Storage bucket: fared-media
├── products/
│   ├── clothes/
│   ├── stones/
│   ├── candles/
│   └── accessories/
├── courses/
├── mentors/
├── tours/
├── hero-backgrounds/
├── editorial/
│   ├── educational/
│   ├── books/
│   └── articles/
├── receipts/          ← PRIVATE — payment receipt photos
└── avatars/
```

---

## 🌍 Environment Variables

```env
# Server
NODE_ENV=production
PORT=4000

# Database
DATABASE_URL=postgresql://user:password@host:5432/fared_db

# JWT
JWT_ACCESS_SECRET=minimum_32_chars_random_string
JWT_REFRESH_SECRET=different_minimum_32_chars_string
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d

# SMS (Kavenegar)
KAVENEGAR_API_KEY=your_kavenegar_key
KAVENEGAR_SENDER=your_sender_number

# Object Storage (Liara S3-compatible)
STORAGE_ENDPOINT=https://storage.iran.liara.space
STORAGE_BUCKET=fared-media
STORAGE_ACCESS_KEY=your_access_key
STORAGE_SECRET_KEY=your_secret_key
STORAGE_REGION=iran

# Payment Gateway
ZARINPAL_MERCHANT_ID=your_merchant_id
PAYMENT_CALLBACK_URL=https://api.faredvibe.ir/api/payments/callback
FRONTEND_PAYMENT_SUCCESS_URL=https://faredvibe.ir/payment/success
FRONTEND_PAYMENT_FAIL_URL=https://faredvibe.ir/payment/fail

# Card-to-Card
CARD_TO_CARD_NUMBER=6037-XXXX-XXXX-XXXX
CARD_OWNER_NAME=نام صاحب حساب

# CORS
ALLOWED_ORIGINS=https://faredvibe.ir,https://admin.faredvibe.ir

# Admin panel
ADMIN_PANEL_URL=https://admin.faredvibe.ir
```

---

## 📏 Coding Rules

1. **Standard response shape — always:**

   ```typescript
   // Success
   { success: true, data: T, message?: string }
   // Error
   { success: false, error: string, details?: unknown }
   // Paginated
   { success: true, data: T[], pagination: { total, page, limit, totalPages } }
   ```

2. **Controllers handle HTTP only.** All business logic lives in services.

3. **All inputs validated with Zod** in `*.schema.ts` files before reaching service.

4. **Never return** `passwordHash`, OTP codes, or raw refresh tokens in any response.

5. **Admin routes** require both `authenticate` + `requireAdmin` middleware. No exceptions.

6. **Soft-delete only** for products, users. Never hard-delete customer-facing data.

7. **Prices are always integers** (Toman). No floats. No rounding bugs.

8. **Farsi fields end in `FA`**, English in `EN` (optional unless specified).

9. **Prisma transactions** for any operation touching multiple tables: create order, confirm payment, book session.

10. **`npx tsc --noEmit` must pass** at all times. No `any` types.

11. **Cart sync rule:** On login, merge anonymous localStorage cart with server cart. If same item exists, take the higher quantity.

---

## 🚀 Setup Commands

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts
npm run dev
```
