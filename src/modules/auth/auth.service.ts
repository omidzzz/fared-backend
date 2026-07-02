import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../config/database";
import { env } from "../../config/env";
import { AppError } from "../../middleware/errorHandler";
import { generateOTP, hashOTP, verifyOTPHash } from "../../utils/otp";
import { sendOTPMessage } from "../../utils/sms";
import { Role } from "../../generated/prisma";

// ── OTP ──────────────────────────────────────────────────

export async function sendOTP(phone: string): Promise<void> {
  const code = generateOTP();
  const hashedCode = hashOTP(code);

  // Invalidate previous OTPs for this phone
  await prisma.oTP.updateMany({
    where: { phone, used: false },
    data: { used: true },
  });

  // Create new OTP (2-minute expiry)
  await prisma.oTP.create({
    data: {
      phone,
      code: hashedCode,
      expiresAt: new Date(Date.now() + 2 * 60 * 1000),
    },
  });

  // Send SMS (or log in dev)
  await sendOTPMessage(phone, code);
}

export async function verifyOTP(
  phone: string,
  code: string
): Promise<{
  accessToken: string;
  refreshToken: string;
  user: { id: string; phone: string; role: string; nameFA: string | null; email: string | null };
}> {
  // Find valid OTP
  const otpRecord = await prisma.oTP.findFirst({
    where: {
      phone,
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord || !verifyOTPHash(code, otpRecord.code)) {
    throw new AppError("Invalid or expired OTP", 401);
  }

  // Mark OTP as used
  await prisma.oTP.update({
    where: { id: otpRecord.id },
    data: { used: true },
  });

  // Find or create user
  let user = await prisma.user.findUnique({ where: { phone } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        phone,
        isVerified: true,
      },
    });
  } else if (!user.isVerified) {
    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    });
  }

  // Generate tokens
  const tokens = await generateTokenPair(user.id);

  return {
    ...tokens,
    user: {
      id: user.id,
      phone: user.phone!,
      role: user.role,
      nameFA: user.nameFA,
      email: user.email,
    },
  };
}

// ── Email/Password ───────────────────────────────────────

export async function registerWithEmail(input: {
  nameFA: string;
  email: string;
  password: string;
}): Promise<{
  accessToken: string;
  refreshToken: string;
  user: { id: string; phone: string | null; role: string; nameFA: string; email: string };
}> {
  // Check if email is taken
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new AppError("Email already registered", 409);
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      nameFA: input.nameFA,
      email: input.email,
      passwordHash,
      isVerified: true,
    },
  });

  const tokens = await generateTokenPair(user.id);

  return {
    ...tokens,
    user: {
      id: user.id,
      phone: user.phone,
      role: user.role,
      nameFA: user.nameFA!,
      email: user.email!,
    },
  };
}

export async function loginWithEmail(input: {
  email: string;
  password: string;
}): Promise<{
  accessToken: string;
  refreshToken: string;
  user: { id: string; phone: string | null; role: string; nameFA: string | null; email: string };
}> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user || !user.passwordHash || !user.isActive) {
    throw new AppError("Invalid credentials", 401);
  }

  const isValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValid) {
    throw new AppError("Invalid credentials", 401);
  }

  const tokens = await generateTokenPair(user.id);

  return {
    ...tokens,
    user: {
      id: user.id,
      phone: user.phone,
      role: user.role,
      nameFA: user.nameFA,
      email: user.email!,
    },
  };
}

// ── Token Management ─────────────────────────────────────

export async function generateTokenPair(
  userId: string
): Promise<{ accessToken: string; refreshToken: string }> {
  // Get user role for JWT payload
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Access token (short-lived JWT)
  const accessToken = jwt.sign(
    { userId, role: user.role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES as any }
  );

  // Refresh token (random, stored as hash)
  const rawRefreshToken = crypto.randomBytes(40).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawRefreshToken)
    .digest("hex");

  // Parse expiry duration (e.g., "30d")
  const expiryMs = parseDuration(env.JWT_REFRESH_EXPIRES);

  await prisma.refreshToken.create({
    data: {
      token: hashedToken,
      userId,
      expiresAt: new Date(Date.now() + expiryMs),
    },
  });

  return { accessToken, refreshToken: rawRefreshToken };
}

export async function refreshAccessToken(
  rawRefreshToken: string
): Promise<{ accessToken: string }> {
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawRefreshToken)
    .digest("hex");

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: hashedToken },
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    if (storedToken) {
      // Clean up expired token
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    }
    throw new AppError("Invalid or expired refresh token", 401);
  }

  // Get user for role
  const user = await prisma.user.findUnique({
    where: { id: storedToken.userId },
    select: { id: true, role: true },
  });

  if (!user) {
    throw new AppError("User not found", 401);
  }

  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES as any }
  );

  return { accessToken };
}

export async function logout(rawRefreshToken: string): Promise<void> {
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawRefreshToken)
    .digest("hex");

  await prisma.refreshToken.deleteMany({
    where: { token: hashedToken },
  });
}

// ── Helpers ──────────────────────────────────────────────

function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([dhms])$/);
  if (!match) return 30 * 24 * 60 * 60 * 1000; // default 30 days

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case "d":
      return value * 24 * 60 * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "m":
      return value * 60 * 1000;
    case "s":
      return value * 1000;
    default:
      return 30 * 24 * 60 * 60 * 1000;
  }
}

// ── Cart Merge on Login ──────────────────────────────────

export async function mergeAnonymousCart(
  userId: string,
  anonymousItems: Array<{
    productId?: string;
    courseId?: string;
    mentorId?: string;
    variantId?: string;
    quantity: number;
  }>
): Promise<void> {
  if (!anonymousItems || anonymousItems.length === 0) return;

  for (const item of anonymousItems) {
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId,
        productId: item.productId ?? null,
        courseId: item.courseId ?? null,
        mentorId: item.mentorId ?? null,
        variantId: item.variantId ?? null,
      },
    });

    if (existingItem) {
      // Take the higher quantity
      const newQty = Math.max(existingItem.quantity, item.quantity);
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          userId,
          productId: item.productId ?? null,
          courseId: item.courseId ?? null,
          mentorId: item.mentorId ?? null,
          variantId: item.variantId ?? null,
          quantity: item.quantity,
        },
      });
    }
  }
}
