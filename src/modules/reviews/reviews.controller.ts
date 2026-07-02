import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/response";
import { AppError } from "../../middleware/errorHandler";
import { createReviewSchema } from "./reviews.schema";
import * as reviewsService from "./reviews.service";

function detectTarget(req: Request): "product" | "course" {
  if (req.baseUrl.includes("/products")) return "product";
  if (req.baseUrl.includes("/courses")) return "course";
  throw new AppError("Cannot determine review target from mount path", 400);
}

// ── Legacy handlers ─────────────────────────────────────────

export async function getProductReviewsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const reviews = await reviewsService.getProductReviews(req.params.productId as string);
    sendSuccess(res, reviews);
  } catch (error) {
    next(error);
  }
}

export async function postProductReviewHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = createReviewSchema.parse(req.body);
    const review = await reviewsService.createProductReview(
      req.user!.id,
      req.params.productId as string,
      data
    );
    sendSuccess(res, review, 201, "Review submitted. It will appear after admin approval.");
  } catch (error) {
    next(error);
  }
}

export async function getCourseReviewsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const reviews = await reviewsService.getCourseReviews(req.params.courseId as string);
    sendSuccess(res, reviews);
  } catch (error) {
    next(error);
  }
}

export async function postCourseReviewHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = createReviewSchema.parse(req.body);
    const review = await reviewsService.createCourseReview(
      req.user!.id,
      req.params.courseId as string,
      data
    );
    sendSuccess(res, review, 201, "Review submitted. It will appear after admin approval.");
  } catch (error) {
    next(error);
  }
}

// ── New generic handlers ────────────────────────────────────

export async function getCommentsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const target = detectTarget(req);
    const reviews =
      target === "product"
        ? await reviewsService.getProductReviews(req.params.id as string)
        : await reviewsService.getCourseReviews(req.params.id as string);
    sendSuccess(res, reviews);
  } catch (error) {
    next(error);
  }
}

export async function postCommentHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const target = detectTarget(req);
    const data = createReviewSchema.parse(req.body);
    const review =
      target === "product"
        ? await reviewsService.createProductReview(req.user!.id, req.params.id as string, data)
        : await reviewsService.createCourseReview(req.user!.id, req.params.id as string, data);
    sendSuccess(res, review, 201, "Review submitted. It will appear after admin approval.");
  } catch (error) {
    next(error);
  }
}
