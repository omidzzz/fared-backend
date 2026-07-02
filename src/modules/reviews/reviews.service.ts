import prisma from "../../config/database";
import { AppError } from "../../middleware/errorHandler";

export async function getProductReviews(productId: string) {
  return prisma.review.findMany({
    where: { productId, isApproved: true },
    include: { user: { select: { id: true, nameFA: true, avatar: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCourseReviews(courseId: string) {
  return prisma.review.findMany({
    where: { courseId, isApproved: true },
    include: { user: { select: { id: true, nameFA: true, avatar: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createProductReview(
  userId: string,
  productId: string,
  data: { rating: number; bodyFA: string; bodyEN?: string }
) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError("Product not found", 404);

  return prisma.review.create({
    data: {
      userId,
      productId,
      productType: product.type,
      rating: data.rating,
      bodyFA: data.bodyFA,
      bodyEN: data.bodyEN ?? null,
      isApproved: false,
    },
  });
}

export async function createCourseReview(
  userId: string,
  courseId: string,
  data: { rating: number; bodyFA: string; bodyEN?: string }
) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new AppError("Course not found", 404);

  return prisma.review.create({
    data: {
      userId,
      courseId,
      rating: data.rating,
      bodyFA: data.bodyFA,
      bodyEN: data.bodyEN ?? null,
      isApproved: false,
    },
  });
}
