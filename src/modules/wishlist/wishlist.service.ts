import prisma from "../../config/database";
import { AppError } from "../../middleware/errorHandler";

export async function getWishlist(userId: string) {
  return prisma.wishlistItem.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
          category: true,
        },
      },
      course: {
        include: { instructor: { select: { nameFA: true } } },
      },
    },
    orderBy: { addedAt: "desc" },
  });
}

export async function addToWishlist(
  userId: string,
  productId?: string,
  courseId?: string
) {
  if (!productId && !courseId) {
    throw new AppError("Must provide productId or courseId", 400);
  }

  if (productId) {
    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) {
      throw new AppError("Already in wishlist", 409);
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new AppError("Product not found", 404);

    return prisma.wishlistItem.create({
      data: { userId, productId, productType: product.type },
    });
  }

  if (courseId) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new AppError("Course not found", 404);

    return prisma.wishlistItem.create({
      data: { userId, courseId, productType: "course" },
    });
  }

  throw new AppError("Must provide productId or courseId", 400);
}

export async function removeFromWishlist(userId: string, productId: string) {
  const item = await prisma.wishlistItem.findFirst({
    where: { userId, productId },
  });

  if (!item) {
    throw new AppError("Wishlist item not found", 404);
  }

  await prisma.wishlistItem.delete({ where: { id: item.id } });
}
