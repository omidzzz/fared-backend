import { z } from "zod";

const iranPhone = z
  .string()
  .regex(/^09\d{9}$/, "Invalid Iranian phone number");

export const sendOTPSchema = z.object({
  phone: iranPhone,
});

export const verifyOTPSchema = z.object({
  phone: iranPhone,
  code: z.string().length(5, "OTP must be 5 digits"),
});

export const registerSchema = z.object({
  nameFA: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const updateProfileSchema = z.object({
  nameFA: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email().optional(),
});

export type SendOTPInput = z.infer<typeof sendOTPSchema>;
export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
