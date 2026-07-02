# fared-backend

REST API for **Aura Mystic** (`faredvibe.ir`) — a Persian-first spiritual/mystical
e-commerce platform selling stones, candles, clothes, accessories, courses,
mentorship sessions and tours, with a forum, editorial content, reviews, and an
admin/moderation surface. Built with Express 5, TypeScript (strict), Prisma 7, and
PostgreSQL; deployed on Liara. This repo is the backend only — the platform also has
`fared-frontend` and `fared-admin` (separate repos).

## Stack

Node.js 20 · Express 5 · TypeScript (strict) · Prisma 7 (`@prisma/adapter-pg` + `pg`)
· PostgreSQL · JWT auth (access + refresh) · Zod validation · Multer uploads · AWS
SDK v3 → Liara Object Storage · Kavenegar SMS (OTP) · PM2.

## Quick start

```bash
# 1. Install deps
npm install

# 2. Configure environment
cp .env.example .env          # then fill in the values (see "Environment" below)

# 3. Generate the Prisma client (outputs to src/generated/prisma)
npx prisma generate

# 4. Apply the database schema
npx prisma migrate dev        # local dev (creates/updates the DB)
# in production use:  npx prisma migrate deploy

# 5. (optional) Seed demo data — catalog, courses, mentors, tours, an admin user
npm run db:seed

# 6. Run
npm run dev                   # ts-node-dev with hot reload
# or build + start:
npm run build                 # tsc → dist/
npm start                     # node dist/index.js
```

Server starts on `PORT` (default `4000`); health check at `GET /health`.

## Useful scripts

| Script               | Does                                  |
| -------------------- | ------------------------------------- |
| `npm run dev`        | Dev server, hot reload                |
| `npm run build`      | Compile TypeScript to `dist/`         |
| `npm start`          | Run the compiled server               |
| `npm run type-check` | `tsc --noEmit` (no output, types only)|
| `npm run db:generate`| `prisma generate`                     |
| `npm run db:migrate` | `prisma migrate dev`                  |
| `npm run db:seed`    | Seed demo data                        |
| `npm run db:studio`  | Open Prisma Studio                    |

## Environment

All configuration is via environment variables. **Copy `.env.example` to `.env`
and fill it in** — that file is the authoritative list of variable **names**.
Only three are strictly required for the server to boot: `DATABASE_URL`,
`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`. The rest have safe defaults; the related
integration stays inert until its variables are set. (See [HANDOFF.md](HANDOFF.md)
§3 for which integration each group enables.)

## API response shape

All endpoints return a consistent envelope:

```jsonc
// Success
{ "success": true, "data": <T>, "message": "optional" }

// Error
{ "success": false, "error": "message", "details": <optional> }

// Paginated
{ "success": true, "data": [<T>], "pagination": { "total": 0, "page": 1, "limit": 20, "totalPages": 0 } }
```

Routes are mounted under `/api/*` (auth, products, cart, orders, payments, courses,
mentors, tours, reviews, wishlist, addresses, notifications, quotes, editorial,
forum, media, admin, …). Most write endpoints require a `Bearer` access token;
admin endpoints additionally require an admin role.

## Documentation

- **[PROJECT.md](PROJECT.md)** — full technical reference: complete Prisma schema
  (34 models), every API route table, payment/auth flows, storage layout, and
  coding conventions.
- **[HANDOFF.md](HANDOFF.md)** — current delivery status: what's implemented vs not,
  known gaps, and the external services the client must provision.

> ⚠️ **Payments:** the online gateway (ZarinPal) is **not implemented** —
> **card-to-card is the only working payment path** today. See the banner in
> [HANDOFF.md](HANDOFF.md) before working on checkout.
