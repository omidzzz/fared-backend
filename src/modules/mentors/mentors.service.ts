import prisma from "../../config/database";
import { AppError } from "../../middleware/errorHandler";
import { generateOrderNumber } from "../../utils/slug";

export async function getMentors() {
  return prisma.mentor.findMany({
    where: { isAvailable: true },
    include: {
      user: { select: { id: true, avatar: true } },
      _count: { select: { sessions: true } },
    },
  });
}

export async function getMentorById(id: string) {
  const mentor = await prisma.mentor.findUnique({
    where: { id },
    include: { user: { select: { id: true, avatar: true, nameFA: true } } },
  });
  if (!mentor) throw new AppError("Mentor not found", 404);
  return mentor;
}

export async function getMentorAvailability(id: string) {
  const mentor = await prisma.mentor.findUnique({ where: { id } });
  if (!mentor || !mentor.isAvailable) {
    throw new AppError("Mentor not found or not available", 404);
  }

  const slots: { date: string; slots: string[] }[] = [];
  for (let i = 1; i <= 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    slots.push({
      date: date.toISOString().split("T")[0],
      slots: ["10:00", "11:00", "14:00", "15:00", "16:00"],
    });
  }

  return {
    mentorId: mentor.id,
    sessionDuration: mentor.sessionDuration,
    timezone: "Asia/Tehran",
    availableSlots: slots,
  };
}

export async function bookSession(userId: string, mentorId: string, notes?: string) {
  const mentor = await prisma.mentor.findUnique({ where: { id: mentorId } });
  if (!mentor || !mentor.isAvailable) {
    throw new AppError("Mentor not found or not available", 404);
  }

  const { OrderStatus, PaymentStatus, BookingStatus } = await import("../../generated/prisma");

  const order = await prisma.$transaction(async (tx: any) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        status: OrderStatus.PENDING,
        paymentMethod: "IR_GATEWAY",
        paymentStatus: PaymentStatus.PENDING,
        subtotal: mentor.sessionPrice,
        total: mentor.sessionPrice,
        currency: mentor.currency,
      },
    });

    await tx.orderItem.create({
      data: {
        orderId: newOrder.id,
        productType: "mentorship",
        refId: mentor.id,
        nameFA: `جلسه منتورشیپ با ${mentor.nameFA}`,
        nameEN: `Mentorship Session with ${mentor.nameEN ?? mentor.nameFA}`,
        price: mentor.sessionPrice,
        quantity: 1,
      },
    });

    await tx.mentorshipSession.create({
      data: {
        userId,
        mentorId: mentor.id,
        status: BookingStatus.PENDING,
        orderId: newOrder.id,
        notes: notes ?? null,
      },
    });

    return newOrder;
  });

  return order;
}

export async function getUserSessions(userId: string) {
  return prisma.mentorshipSession.findMany({
    where: { userId },
    include: {
      mentor: true,
      order: { select: { orderNumber: true, paymentStatus: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
