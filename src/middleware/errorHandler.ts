import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export function notFound(_req: Request, res: Response, next: NextFunction) {
  const error = new Error("Route not found") as any;
  error.statusCode = 404;
  next(error);
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let statusCode = 500;
  
  if (err instanceof AppError) {
    statusCode = err.statusCode;
  } else if (res.statusCode !== 200) {
    statusCode = res.statusCode;
  }

  res.status(statusCode).json({
    success: false,
    error: err.message || "Internal server error",
  });
}
