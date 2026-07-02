import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES: z.string().default("15m"),
  JWT_REFRESH_EXPIRES: z.string().default("30d"),
  KAVENEGAR_API_KEY: z.string().optional(),
  KAVENEGAR_SENDER: z.string().optional(),
  STORAGE_ENDPOINT: z.string().default("https://storage.iran.liara.space"),
  STORAGE_BUCKET: z.string().default("fared-media"),
  STORAGE_ACCESS_KEY: z.string().default("dev-access-key"),
  STORAGE_SECRET_KEY: z.string().default("dev-secret-key"),
  STORAGE_REGION: z.string().default("iran"),
  ZARINPAL_MERCHANT_ID: z.string().optional(),
  PAYMENT_CALLBACK_URL: z.string().default("https://api.faredvibe.ir/api/payments/callback"),
  FRONTEND_PAYMENT_SUCCESS_URL: z.string().default("https://faredvibe.ir/payment/success"),
  FRONTEND_PAYMENT_FAIL_URL: z.string().default("https://faredvibe.ir/payment/fail"),
  CARD_TO_CARD_NUMBER: z.string().default("6037-XXXX-XXXX-XXXX"),
  CARD_OWNER_NAME: z.string().default("نام صاحب حساب"),
  ALLOWED_ORIGINS: z.string().default("https://faredvibe.ir,https://admin.faredvibe.ir"),
  ADMIN_PANEL_URL: z.string().default("https://admin.faredvibe.ir"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
