# HANDOFF — fared-backend

**Aura Mystic** — backend API for a Persian-first spiritual/mystical e-commerce platform.
This document is the state-of-work snapshot delivered at the end of the engagement.

> ## ⚠️ PAYMENTS — READ FIRST
> **The online payment gateway (ZarinPal / IR gateway) is NOT functional end-to-end.**
> The gateway integration is not implemented in code: `POST /api/orders` with
> `IR_GATEWAY` returns a placeholder payment URL, and `GET /api/payments/callback`
> only logs and redirects — it does **not** call ZarinPal to request/verify a
> payment, and does **not** update the order/payment status in the database.
> Making it work requires both implementing the request/verify integration **and** a
> client-provisioned ZarinPal merchant account (`ZARINPAL_MERCHANT_ID`).
>
> **Card-to-card (کارت به کارت) is the ONLY working payment path** and is implemented
> end-to-end (receipt upload → admin approval → order confirmed + user notified).

> Scope note: this repo is **`fared-backend` only**. The platform also has
> `fared-frontend` and `fared-admin` (separate repos). Those were **not** part of
> this audit and need the same pass.

---

## 1. Stack

| Layer        | Choice                                            |
| ------------ | ------------------------------------------------- |
| Runtime      | Node.js 20 LTS                                    |
| Framework    | Express 5                                         |
| Language     | TypeScript (strict)                               |
| ORM          | Prisma 7 (via `@prisma/adapter-pg` + `pg` Pool)   |
| DB           | PostgreSQL                                        |
| Auth         | JWT access + refresh (refresh stored as SHA-256)  |
| OTP          | 5-digit, SHA-256 hashed, 2-min expiry             |
| SMS          | Kavenegar (stubs to console if no API key)        |
| Storage      | AWS SDK v3 → Liara S3 (stubs to `local://` if S3 fails) |
| Validation   | Zod                                               |
| Uploads      | Multer (memory storage, 5 MB)                     |
| Process mgr  | PM2 (`ecosystem.config.js`)                       |
| Deploy       | Liara (`liara.json`, Node platform)               |

**Entry point:** `src/index.ts` → connects Prisma, then `app.listen(PORT)`.
**App/routes:** `src/app.ts` mounts all routers under `/api/*` plus `GET /health`.

---

## 2. Install / Run / Build

```bash
npm install
npx prisma generate          # generates client into src/generated/prisma
npx prisma migrate deploy    # apply the single init migration (prod)
# or for local dev:  npx prisma migrate dev
npm run db:seed              # optional: load demo catalog + admin user

npm run dev                  # ts-node-dev, hot reload
npm run build                # tsc → dist/  (also copies src/generated → dist/generated)
npm start                    # node dist/index.js
npm run type-check           # tsc --noEmit
```

**Health of build at handoff:** `tsc --noEmit` passes with **0 errors**;
`npm run build` produces `dist/index.js`. No `any`-type or compile issues.

---

## 3. Required environment variables (names only)

Copy `.env.example` → `.env` and fill in. **Hard-required** (server exits on
startup without them): `DATABASE_URL`, `JWT_ACCESS_SECRET` (≥32 chars),
`JWT_REFRESH_SECRET` (≥32 chars). Everything else has a safe default and the
app will boot, but the related integration will be inert until set.

```
NODE_ENV  PORT
DATABASE_URL
JWT_ACCESS_SECRET  JWT_REFRESH_SECRET  JWT_ACCESS_EXPIRES  JWT_REFRESH_EXPIRES
KAVENEGAR_API_KEY  KAVENEGAR_SENDER
STORAGE_ENDPOINT  STORAGE_BUCKET  STORAGE_ACCESS_KEY  STORAGE_SECRET_KEY  STORAGE_REGION
ZARINPAL_MERCHANT_ID  PAYMENT_CALLBACK_URL  FRONTEND_PAYMENT_SUCCESS_URL  FRONTEND_PAYMENT_FAIL_URL
CARD_TO_CARD_NUMBER  CARD_OWNER_NAME
ALLOWED_ORIGINS
ADMIN_PANEL_URL
```

---

## 4. Implemented vs NOT implemented (summary)

**Fully implemented & DB-backed (✅):**
- Auth: phone OTP, email/password register+login, JWT refresh/rotation, logout, `/me`, profile, anonymous-cart merge on login.
- Catalog: products (list/filter/search/featured/by-category/detail), the 4 typed views (stones / candles / clothes / accessories), categories (+admin CRUD).
- Cart (product/course/mentor + variant), Wishlist, Addresses (default-address logic), Notifications.
- Orders: creation is a real Prisma transaction (validates stock, snapshots items into `OrderItem`, decrements stock, upserts course enrollments, clears cart).
- **Card-to-card payment: end-to-end** — receipt upload → S3 → admin approve/reject → order confirmed/failed → user notification.
- Courses (list/detail/curriculum w/ lesson-locking, enroll-creates-order), Mentors (list/detail/book-creates-session), Tours (list/detail + **enquiry, not purchase**).
- Reviews/comments (product + course, admin moderation gate), Forum (topics/replies, approval gate), Quotes (scheduled + random "today"), Editorial (educational posts / books / articles / poems CRUD), Media upload.
- **Admin: complete** — real dashboard stats (aggregation), order management, receipt approval, enquiry/comment/forum moderation, user list, product CRUD (**soft-delete**), mentorship scheduling. Every admin route is guarded by `authenticate + requireAdmin`.
- DB schema (34 models) and the single migration are **in sync** — a fresh `migrate deploy` produces a complete database. Seed script is comprehensive and field-accurate.

**Stub / placeholder (⛔ — present but not functional):**
- **IR online payment gateway (ZarinPal)** — NOT integrated. `POST /api/orders` with `IR_GATEWAY` returns a fake `paymentUrl` pointing at the FAIL page (`?stub=true`), and `GET /api/payments/callback` only console-logs + redirects — **it does not verify the payment or update the order in the DB.** Card-to-card is the only working payment path today. (See banner at top.)
- **Mentor availability** (`GET /api/mentors/:id/availability`) returns **hardcoded** slots (next 7 days, fixed times) — no real calendar.
- **SMS (Kavenegar) / Storage (Liara S3)** — integration code **is fully written**; these are not unfinished work. They log and no-op when credentials are absent and switch to the real Kavenegar/S3 calls automatically once the env vars are set. Pending **client-provisioned** accounts/keys, not development. (Making the app runnable without secrets is intentional.)

**Known partial / bugs (🟡 — work, but incomplete; left as-is, not fixed):**
- **Wishlist course items can't be removed:** schema has `@@unique([userId, productId])` only and `DELETE /api/wishlist/remove/:productId` keys off `productId`, so course-type wishlist entries are addable but not removable via the API.
- Editorial **detail-by-slug** endpoints don't re-check `isPublished`, so an unpublished item is fetchable if its slug is known (list endpoints correctly filter). Minor moderation leak, not a crash.
- `Dockerfile` build is **broken**: `RUN npm ci --only=production` omits `typescript` and `prisma` (devDeps), so the subsequent `npm run build` / `prisma generate` fail. **Liara deploys via `liara.json` buildpacks, not this Dockerfile**, so it does not block the actual deploy — but `docker build` will fail until fixed (use `npm ci` or a multi-stage build). Left unchanged at client's direction.

**Tests:** none in the repo.

---

## 5. External services the client must own to run in production

- **PostgreSQL** database (`DATABASE_URL`).
- **Liara** account: Node app (this backend) + **Object Storage** bucket `fared-media` (avatars, receipts, media). Storage keys → `STORAGE_*`.
- **Kavenegar** account for SMS OTP (`KAVENEGAR_API_KEY`, `KAVENEGAR_SENDER`).
- **ZarinPal** merchant (`ZARINPAL_MERCHANT_ID`) — *only needed once the IR gateway is actually built; not functional today.*
- A bank card/owner for card-to-card (`CARD_TO_CARD_NUMBER`, `CARD_OWNER_NAME`).

---

## 6. API surface (high level)

`/api/auth · /api/users · /api/categories · /api/products · /api/stones ·
/api/candles · /api/clothes · /api/accessories · /api/courses · /api/mentors ·
/api/tours · /api/cart · /api/orders · /api/payments · /api/reviews ·
/api/wishlist · /api/addresses · /api/notifications · /api/quotes ·
/api/editorial · /api/forum · /api/media · /api/admin` plus `GET /health`.
Standard response shape: `{ success, data, message? }` / `{ success, error, details? }`
/ paginated `{ success, data, pagination }`. See [PROJECT.md](PROJECT.md) for the full route table.

---

## 7. Stabilization changes made during handoff

**None.** The project already builds and type-checks cleanly and boots without
crashing on its main routes, so no code changes were required. The one build
defect found (Dockerfile devDependency omission) was **documented, not modified**,
at the client's direction (see §4). All findings above are reported, not altered —
the source is delivered exactly as authored.
