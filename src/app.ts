import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler, notFound } from "./middleware/errorHandler";

// Import routers
import authRouter from "./modules/auth/auth.router";
import categoriesRouter from "./modules/categories/categories.router";
import productsRouter from "./modules/products/products.router";
import stonesRouter from "./modules/stones/stones.router";
import candlesRouter from "./modules/candles/candles.router";
import clothesRouter from "./modules/clothes/clothes.router";
import accessoriesRouter from "./modules/accessories/accessories.router";
import coursesRouter from "./modules/courses/courses.router";
import mentorsRouter from "./modules/mentors/mentors.router";
import toursRouter from "./modules/tours/tours.router";
import cartRouter from "./modules/cart/cart.router";
import ordersRouter from "./modules/orders/orders.router";
import paymentsRouter from "./modules/payments/payments.router";
import reviewsRouter from "./modules/reviews/reviews.router";
import wishlistRouter from "./modules/wishlist/wishlist.router";
import addressesRouter from "./modules/addresses/addresses.router";
import notificationsRouter from "./modules/notifications/notifications.router";
import quotesRouter from "./modules/quotes/quotes.router";
import editorialRouter from "./modules/editorial/editorial.router";
import forumRouter from "./modules/forum/forum.router";
import mediaRouter from "./modules/media/media.router";
import adminRouter from "./modules/admin/admin.router";
import usersRouter from "./modules/users/users.router";

const app = express();

// ── Global Middleware ────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());
      
      // Allow all origins if wildcard is set
      if (allowedOrigins.includes("*")) {
        return callback(null, true);
      }
      
      // Check if origin is in allowed list
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));

// ── Health Check ─────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── API Routes ───────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/products", productsRouter);
app.use("/api/products", reviewsRouter); // /api/products/:id/comments
app.use("/api/stones", stonesRouter);
app.use("/api/candles", candlesRouter);
app.use("/api/clothes", clothesRouter);
app.use("/api/accessories", accessoriesRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/courses", reviewsRouter); // /api/courses/:id/comments
app.use("/api/mentors", mentorsRouter);
app.use("/api/tours", toursRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/addresses", addressesRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/quotes", quotesRouter);
app.use("/api/editorial", editorialRouter);
app.use("/api/forum", forumRouter);
app.use("/api/media", mediaRouter);
app.use("/api/admin", adminRouter);

// ── Error Handling ───────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
