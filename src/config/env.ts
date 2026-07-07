import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES: z.string().default("15m"),
  JWT_REFRESH_EXPIRES: z.string().default("30d"),
  KAVENEGAR_API_KEY: z.string().optional(),
  KAVENEGAR_SENDER: z.string().optional(),
  STORAGE_ENDPOINT: z.string().optional(),
  STORAGE_BUCKET: z.string().optional(),
  STORAGE_ACCESS_KEY: z.string().optional(),
  STORAGE_SECRET_KEY: z.string().optional(),
  STORAGE_REGION: z.string().default("iran"),
  ZARINPAL_MERCHANT_ID: z.string().optional(),
  PAYMENT_CALLBACK_URL: z.string().optional(),
  FRONTEND_PAYMENT_SUCCESS_URL: z.string().optional(),
  FRONTEND_PAYMENT_FAIL_URL: z.string().optional(),
  CARD_TO_CARD_NUMBER: z.string().optional(),
  CARD_OWNER_NAME: z.string().optional(),
  ALLOWED_ORIGINS: z.string().default("*"),
  ADMIN_PANEL_URL: z.string().url().default("http://localhost:3002"),
});

export const env = envSchema.parse(process.env);
