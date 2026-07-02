import crypto from "crypto";

/**
 * Generate a 5-digit OTP code.
 */
export function generateOTP(): string {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

/**
 * Hash an OTP code with SHA-256.
 */
export function hashOTP(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

/**
 * Verify an OTP code against its hash.
 */
export function verifyOTPHash(code: string, hash: string): boolean {
  return hashOTP(code) === hash;
}
