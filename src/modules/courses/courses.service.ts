import prisma from "../../config/database";
import { AppError } from "../../middleware/errorHandler";
import { generateOrderNumber } from "../../utils/slug";

export async function getCourses() {
  return prisma.course.findMany({
    where: { isActive: true },
    include: {
      instructor: { select: { id: true, nameFA: true, avatar: true } },
      category: true,
      _count: { select: { enrollments: true, reviews: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCourseBySlug(slug: string) {
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      instructor: { select: { id: true, nameFA: true, avatar: true, name: true } },
      curriculum: { orderBy: { order: "asc" } },
      category: true,
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { id: true, nameFA: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!course) throw new AppError("Course not found", 404);
  return course;
}

export async function getCurriculum(courseId: string, userId?: string) {
  const lessons = await prisma.courseLesson.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
  });

  const enrolled = userId
    ? !!(await prisma.courseEnrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
      }))
    : false;

  return lessons.map((lesson) => {
    if (lesson.isFree || enrolled) return lesson;
    return {
      id: lesson.id, order: lesson.order, titleFA: lesson.titleFA,
      titleEN: lesson.titleEN, isFree: false, locked: true,
    };
  });
}

export async function enrollUser(userId: string, courseId: string) {
  const existing = await prisma.courseEnrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (existing) throw new AppError("Already enrolled in this course", 409);

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || !course.isActive) throw new AppError("Course not found or inactive", 404);

  const { OrderStatus, PaymentStatus } = await import("../../generated/prisma");

  const order = await prisma.$transaction(async (tx: any) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        status: OrderStatus.PENDING,
        paymentMethod: "IR_GATEWAY",
        paymentStatus: PaymentStatus.PENDING,
        subtotal: course.price,
        total: course.price,
        currency: course.currency,
      },
    });

    await tx.orderItem.create({
      data: {
        orderId: newOrder.id,
        productType: "course",
        refId: course.id,
        nameFA: course.nameFA,
        nameEN: course.nameEN,
        price: course.price,
        quantity: 1,
        image: course.heroImage,
      },
    });

    return newOrder;
  });

  return order;
}
