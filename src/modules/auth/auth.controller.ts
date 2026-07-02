import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/response";
import * as authService from "./auth.service";
import {
  sendOTPSchema,
  verifyOTPSchema,
  registerSchema,
  loginSchema,
  refreshSchema,
} from "./auth.schema";

export async function sendOTPHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { phone } = sendOTPSchema.parse(req.body);
    await authService.sendOTP(phone);
    sendSuccess(res, null, 200, "OTP sent successfully");
  } catch (error) {
    next(error);
  }
}

export async function verifyOTPHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { phone, code } = verifyOTPSchema.parse(req.body);
    const result = await authService.verifyOTP(phone, code);
    sendSuccess(res, result, 200, "OTP verified successfully");
  } catch (error) {
    next(error);
  }
}

export async function registerHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = registerSchema.parse(req.body);
    const result = await authService.registerWithEmail(input);
    sendSuccess(res, result, 201, "Account created successfully");
  } catch (error) {
    next(error);
  }
}

export async function loginHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = loginSchema.parse(req.body);
    const result = await authService.loginWithEmail(input);
    sendSuccess(res, result, 200, "Login successful");
  } catch (error) {
    next(error);
  }
}

export async function refreshHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    const result = await authService.refreshAccessToken(refreshToken);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function logoutHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    await authService.logout(refreshToken);
    sendSuccess(res, null, 200, "Logged out successfully");
  } catch (error) {
    next(error);
  }
}

export async function getMeHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { default: prisma } = await import("../../config/database");
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        nameFA: true,
        name: true,
        phone: true,
        email: true,
        avatar: true,
        role: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      sendSuccess(res, null, 404, "User not found");
      return;
    }

    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
}
