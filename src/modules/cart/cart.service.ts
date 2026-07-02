import prisma from "../../config/database";
import { AppError } from "../../middleware/errorHandler";

export async function getCart(userId: string) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  let subtotal = 0;
  const enriched = items.map((item) => {
    const price = item.product?.price ?? 0;
    subtotal += price * item.quantity;
    return { ...item, unitPrice: price, lineTotal: price * item.quantity };
  });

  return { items: enriched, itemCount: items.length, subtotal, currency: "IRT" };
}

export async function addToCart(
  userId: string,
  data: {
    productId?: string;
    courseId?: string;
    mentorId?: string;
    variantId?: string;
    quantity?: number;
  }
) {
  if (!data.productId && !data.courseId && !data.mentorId) {
    throw new AppError("Must specify productId, courseId, or mentorId", 400);
  }

  const quantity = data.quantity ?? 1;

  const existing = await prisma.cartItem.findFirst({
    where: {
      userId,
      productId: data.productId ?? null,
      courseId: data.courseId ?? null,
      mentorId: data.mentorId ?? null,
      variantId: data.variantId ?? null,
    },
  });

  if (existing) {
    return prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  }

  return prisma.cartItem.create({
    data: {
      userId,
      productId: data.productId ?? null,
      courseId: data.courseId ?? null,
      mentorId: data.mentorId ?? null,
      variantId: data.variantId ?? null,
      quantity,
    },
  });
}

export async function updateCartItem(
  userId: string,
  itemId: string,
  quantity: number
) {
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, userId },
  });
  if (!item) throw new AppError("Cart item not found", 404);

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: itemId } });
    return null;
  }

  return prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
}

export async function removeCartItem(userId: string, itemId: string) {
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, userId },
  });
  if (!item) throw new AppError("Cart item not found", 404);

  await prisma.cartItem.delete({ where: { id: item.id } });
}

export async function clearCart(userId: string) {
  await prisma.cartItem.deleteMany({ where: { userId } });
}
