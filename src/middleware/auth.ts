import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/database";
import { env } from "../config/env";
import { AppError } from "./errorHandler";

interface JwtPayload {
  userId: string;
  role: string;
}

/**
 * Authenticate middleware — verifies JWT and attaches user to request.
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Authentication required", 401);
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new AppError("Authentication required", 401);
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        role: true,
        phone: true,
        email: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new AppError("User not found or inactive", 401);
    }

    req.user = {
      id: user.id,
      role: user.role,
      phone: user.phone ?? undefined,
      email: user.email ?? undefined,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError("Invalid or expired token", 401));
      return;
    }
    next(error);
  }
}

/**
 * Optional auth — attaches user if token present, but doesn't require it.
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        role: true,
        phone: true,
        email: true,
        isActive: true,
      },
    });

    if (user && user.isActive) {
      req.user = {
        id: user.id,
        role: user.role,
        phone: user.phone ?? undefined,
        email: user.email ?? undefined,
      };
    }
    next();
  } catch {
    // Token invalid — just continue without user
    next();
  }
}

/**
 * Require admin middleware — must be used after authenticate.
 */
export function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    next(new AppError("Authentication required", 401));
    return;
  }

  if (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN") {
    next(new AppError("Admin access required", 403));
    return;
  }

  next();
}
