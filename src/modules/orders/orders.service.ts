import prisma from "../../config/database";
import { AppError } from "../../middleware/errorHandler";
import { generateOrderNumber } from "../../utils/slug";
import { env } from "../../config/env";
import { PaymentStatus, OrderStatus, NotificationType } from "../../generated/prisma";
import { uploadToStorage } from "../../config/storage";

export async function getOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: true,
      receipt: { select: { status: true, imageUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true, receipt: true, address: true },
  });
  if (!order) throw new AppError("Order not found", 404);
  return order;
}

export async function createOrder(
  userId: string,
  paymentMethod: string,
  addressId?: string,
  notes?: string
) {
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } },
    },
  });

  if (cartItems.length === 0) throw new AppError("Cart is empty", 400);

  // Validate each item
  const validationErrors: string[] = [];
  for (const item of cartItems) {
    if (item.product) {
      if (!item.product.isActive) {
        validationErrors.push(`${item.product.nameFA} is no longer available`);
      }
      if (item.product.stock < item.quantity) {
        validationErrors.push(
          `${item.product.nameFA}: only ${item.product.stock} in stock (requested ${item.quantity})`
        );
      }
    }
  }
  if (validationErrors.length > 0) {
    throw new AppError("Order validation failed", 400, validationErrors);
  }

  let subtotal = 0;
  for (const item of cartItems) {
    subtotal += (item.product?.price ?? 0) * item.quantity;
  }

  const total = subtotal;
  const orderNumber = generateOrderNumber();

  const order = await prisma.$transaction(async (tx: any) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        userId,
        status: OrderStatus.PENDING,
        paymentMethod: paymentMethod as any,
        paymentStatus: PaymentStatus.PENDING,
        subtotal,
        shippingAmount: 0,
        discountAmount: 0,
        total,
        currency: "IRT",
        addressId: addressId ?? null,
        notes: notes ?? null,
      },
    });

    for (const item of cartItems) {
      await tx.orderItem.create({
        data: {
          orderId: newOrder.id,
          productType: item.product?.type ?? "course",
          refId: item.productId ?? item.courseId ?? item.mentorId ?? "",
          nameFA: item.product?.nameFA ?? "Item",
          nameEN: item.product?.nameEN,
          price: item.product?.price ?? 0,
          quantity: item.quantity,
          variant: item.variantId,
          image: item.product?.images[0]?.url,
        },
      });

      if (item.product && item.productId) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    for (const item of cartItems) {
      if (item.courseId) {
        await tx.courseEnrollment.upsert({
          where: { userId_courseId: { userId, courseId: item.courseId } },
          create: { userId, courseId: item.courseId, orderId: newOrder.id },
          update: { orderId: newOrder.id },
        });
      }
    }

    await tx.cartItem.deleteMany({ where: { userId } });

    return newOrder;
  });

  return { order, paymentMethod };
}

export async function uploadReceipt(
  userId: string,
  orderId: string,
  file: Express.Multer.File
) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
  });
  if (!order) throw new AppError("Order not found", 404);
  if (order.paymentMethod !== "CARD_TO_CARD") {
    throw new AppError("Receipt upload only valid for card-to-card payments", 400);
  }

  const key = `receipts/${order.id}/${Date.now()}-${file.originalname}`;
  let imageUrl: string;
  try {
    imageUrl = await uploadToStorage(key, file.buffer, file.mimetype);
  } catch {
    imageUrl = `local://receipts/${order.id}/${Date.now()}.jpg`;
    console.log(`[STORAGE STUB] Receipt would be uploaded to: ${key}`);
  }

  const result = await prisma.$transaction(async (tx: any) => {
    const receipt = await tx.paymentReceipt.create({
      data: { orderId: order.id, userId, imageUrl, amount: order.total },
    });

    await tx.order.update({
      where: { id: order.id },
      data: { paymentStatus: PaymentStatus.AWAITING_CONFIRMATION },
    });

    return receipt;
  });

  return result;
}
