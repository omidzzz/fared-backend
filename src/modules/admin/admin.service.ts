import prisma from "../../config/database";
import { AppError } from "../../middleware/errorHandler";
import { PaymentStatus, ReceiptStatus, NotificationType, TourEnquiryStatus, BookingStatus } from "../../generated/prisma";
import { OrderStatus } from "../../generated/prisma";

// ── Dashboard Stats ──────────────────────────────

export async function getStats() {
  const [
    totalOrders, pendingPayments, totalRevenue, totalUsers, totalProducts,
    recentOrders, lowStockProducts, pendingComments, pendingForumTopics, newEnquiries,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { paymentStatus: PaymentStatus.AWAITING_CONFIRMATION } }),
    prisma.order.aggregate({
      where: { paymentStatus: PaymentStatus.CONFIRMED },
      _sum: { total: true },
    }),
    prisma.user.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.findMany({
      include: { user: { select: { id: true, nameFA: true, phone: true } } },
      orderBy: { createdAt: "desc" }, take: 10,
    }),
    prisma.product.findMany({
      where: { isActive: true, stock: { lt: 5 } },
      include: { images: { take: 1 } }, take: 10,
    }),
    prisma.review.count({ where: { isApproved: false } }),
    prisma.forumTopic.count({ where: { isApproved: false } }),
    prisma.tourEnquiry.count({ where: { status: TourEnquiryStatus.NEW } }),
  ]);

  return {
    totalOrders, pendingPayments, totalRevenue: totalRevenue._sum.total ?? 0,
    totalUsers, totalProducts, recentOrders, lowStockProducts,
    pendingComments, pendingForumTopics, newEnquiries,
  };
}

// ── Orders ───────────────────────────────────────

export async function getAdminOrders(page: number, limit: number, status?: string) {
  const where: any = {};
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, nameFA: true, phone: true, email: true } },
        items: true, receipt: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);
  return { orders, total };
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  trackingCode?: string,
  adminId?: string
) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError("Order not found", 404);

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: status as OrderStatus,
      trackingCode: trackingCode ?? undefined,
      ...(status === "DELIVERED" ? { paymentConfirmedBy: adminId, paymentConfirmedAt: new Date() } : {}),
    },
  });

  await prisma.notification.create({
    data: {
      userId: order.userId,
      type: NotificationType.ORDER_UPDATE,
      titleFA: "بروزرسانی سفارش",
      bodyFA: `وضعیت سفارش ${order.orderNumber} به "${status}" تغییر کرد.`,
      data: { orderId: order.id },
    },
  });

  return updated;
}

// ── Receipts ─────────────────────────────────────

export async function getPendingReceipts() {
  return prisma.paymentReceipt.findMany({
    where: { status: ReceiptStatus.PENDING },
    include: {
      order: { include: { items: true } },
      user: { select: { id: true, nameFA: true, phone: true } },
    },
    orderBy: { uploadedAt: "asc" },
  });
}

export async function approveReceipt(receiptId: string, adminId: string) {
  const receipt = await prisma.paymentReceipt.findUnique({
    where: { id: receiptId }, include: { order: true },
  });
  if (!receipt) throw new AppError("Receipt not found", 404);

  const result = await prisma.$transaction(async (tx: any) => {
    await tx.paymentReceipt.update({
      where: { id: receipt.id },
      data: { status: ReceiptStatus.APPROVED, reviewedBy: adminId, reviewedAt: new Date() },
    });

    const order = await tx.order.update({
      where: { id: receipt.orderId },
      data: {
        paymentStatus: PaymentStatus.CONFIRMED,
        status: OrderStatus.PROCESSING,
        paymentConfirmedBy: adminId,
        paymentConfirmedAt: new Date(),
      },
    });

    await tx.mentorshipSession.updateMany({
      where: { orderId: receipt.orderId },
      data: { status: BookingStatus.PENDING },
    });

    return order;
  });

  await prisma.notification.create({
    data: {
      userId: receipt.userId,
      type: NotificationType.PAYMENT_STATUS,
      titleFA: "پرداخت تایید شد",
      bodyFA: `پرداخت سفارش ${receipt.order.orderNumber} تایید شد. سفارش شما در حال پردازش است.`,
      data: { orderId: receipt.orderId },
    },
  });

  return result;
}

export async function rejectReceipt(receiptId: string, rejectReason: string, adminId: string) {
  const receipt = await prisma.paymentReceipt.findUnique({
    where: { id: receiptId }, include: { order: true },
  });
  if (!receipt) throw new AppError("Receipt not found", 404);

  const result = await prisma.$transaction(async (tx: any) => {
    await tx.paymentReceipt.update({
      where: { id: receipt.id },
      data: { status: ReceiptStatus.REJECTED, rejectReason, reviewedBy: adminId, reviewedAt: new Date() },
    });
    return tx.order.update({
      where: { id: receipt.orderId },
      data: { paymentStatus: PaymentStatus.FAILED },
    });
  });

  await prisma.notification.create({
    data: {
      userId: receipt.userId,
      type: NotificationType.PAYMENT_STATUS,
      titleFA: "پرداخت تایید نشد",
      bodyFA: `رسید پرداخت سفارش ${receipt.order.orderNumber} تایید نشد. دلیل: ${rejectReason}`,
      data: { orderId: receipt.orderId },
    },
  });

  return result;
}

// ── Enquiries ────────────────────────────────────

export async function getEnquiries(status?: string) {
  const where: any = {};
  if (status) where.status = status;
  return prisma.tourEnquiry.findMany({
    where,
    include: { tour: { select: { titleFA: true, destination: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateEnquiryStatus(id: string, status: string, adminNotes?: string) {
  return prisma.tourEnquiry.update({
    where: { id },
    data: { status: status as TourEnquiryStatus, adminNotes: adminNotes ?? undefined },
  });
}

// ── Comments Moderation ──────────────────────────

export async function getPendingComments() {
  return prisma.review.findMany({
    where: { isApproved: false },
    include: {
      user: { select: { id: true, nameFA: true, phone: true } },
      product: { select: { id: true, nameFA: true } },
      course: { select: { id: true, nameFA: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function approveComment(id: string) {
  return prisma.review.update({ where: { id }, data: { isApproved: true } });
}

export async function replyToComment(id: string, reply: string) {
  const review = await prisma.review.update({
    where: { id },
    data: { adminReply: reply, adminReplyAt: new Date() },
  });

  await prisma.notification.create({
    data: {
      userId: review.userId,
      type: NotificationType.REVIEW_REPLY,
      titleFA: "پاسخ به دیدگاه شما",
      bodyFA: `مدیر به دیدگاه شما پاسخ داده است.`,
      data: { reviewId: review.id },
    },
  });

  return review;
}

// ── Forum Moderation ─────────────────────────────

export async function getPendingForum() {
  const [topics, replies] = await Promise.all([
    prisma.forumTopic.findMany({
      where: { isApproved: false },
      include: { author: { select: { id: true, nameFA: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.forumReply.findMany({
      where: { isApproved: false },
      include: {
        author: { select: { id: true, nameFA: true } },
        topic: { select: { id: true, titleFA: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  return { topics, replies };
}

export async function approveTopic(id: string) {
  return prisma.forumTopic.update({ where: { id }, data: { isApproved: true } });
}

export async function approveReply(id: string) {
  return prisma.forumReply.update({ where: { id }, data: { isApproved: true } });
}

// ── Users ────────────────────────────────────────

export async function getUsers(page: number, limit: number) {
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true, nameFA: true, name: true, phone: true, email: true,
        role: true, isVerified: true, isActive: true,
        avatar: true, createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count(),
  ]);
  return { users, total };
}

// ── Products ─────────────────────────────────────

export async function createProduct(data: any) {
  const { generateSlug } = await import("../../utils/slug");
  return prisma.product.create({
    data: { ...data, slug: data.slug || generateSlug(data.nameFA) },
  });
}

export async function updateProduct(id: string, data: any) {
  return prisma.product.update({ where: { id }, data });
}

export async function deactivateProduct(id: string) {
  return prisma.product.update({ where: { id }, data: { isActive: false } });
}

// ── Mentorship ───────────────────────────────────

export async function scheduleSession(sessionId: string, scheduledAt: string) {
  const session = await prisma.mentorshipSession.update({
    where: { id: sessionId },
    data: { scheduledAt: new Date(scheduledAt), status: BookingStatus.SCHEDULED },
  });

  await prisma.notification.create({
    data: {
      userId: session.userId,
      type: NotificationType.MENTORSHIP_REMINDER,
      titleFA: "زمان جلسه منتورشیپ تعیین شد",
      bodyFA: `جلسه منتورشیپ شما برای ${new Date(scheduledAt).toLocaleString("fa-IR")} برنامه‌ریزی شد.`,
      data: { sessionId: session.id },
    },
  });

  return session;
}

// ── CMS ─────────────────────────────────────────────

export async function getArticles(page: number, limit: number, category?: string, published?: boolean) {
  const where: any = {};
  if (category) where.category = category;
  if (published !== undefined) where.isPublished = published;

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.article.count({ where }),
  ]);
  return { articles, total };
}

export async function getArticleById(id: string) {
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) throw new AppError("Article not found", 404);
  return article;
}

export async function createArticle(data: any) {
  const { generateSlug } = await import("../../utils/slug");
  return prisma.article.create({
    data: { ...data, slug: data.slug || generateSlug(data.titleFA) },
  });
}

export async function updateArticle(id: string, data: any) {
  return prisma.article.update({ where: { id }, data });
}

export async function deleteArticle(id: string) {
  return prisma.article.update({ where: { id }, data: { isActive: false } });
}

export async function getBooks(page: number, limit: number) {
  const [books, total] = await Promise.all([
    prisma.book.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.book.count(),
  ]);
  return { books, total };
}

export async function getBookById(id: string) {
  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) throw new AppError("Book not found", 404);
  return book;
}

export async function createBook(data: any) {
  const { generateSlug } = await import("../../utils/slug");
  return prisma.book.create({
    data: { ...data, slug: data.slug || generateSlug(data.titleFA) },
  });
}

export async function updateBook(id: string, data: any) {
  return prisma.book.update({ where: { id }, data });
}

export async function deleteBook(id: string) {
  return prisma.book.update({ where: { id }, data: { isActive: false } });
}

export async function getPoems(page: number, limit: number) {
  const [poems, total] = await Promise.all([
    prisma.poem.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.poem.count(),
  ]);
  return { poems, total };
}

export async function getPoemById(id: string) {
  const poem = await prisma.poem.findUnique({ where: { id } });
  if (!poem) throw new AppError("Poem not found", 404);
  return poem;
}

export async function createPoem(data: any) {
  const { generateSlug } = await import("../../utils/slug");
  return prisma.poem.create({
    data: { ...data, slug: data.slug || generateSlug(data.titleFA) },
  });
}

export async function updatePoem(id: string, data: any) {
  return prisma.poem.update({ where: { id }, data });
}

export async function deletePoem(id: string) {
  return prisma.poem.update({ where: { id }, data: { isActive: false } });
}

export async function getEducationalPosts(page: number, limit: number) {
  const [posts, total] = await Promise.all([
    prisma.educationalPost.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.educationalPost.count(),
  ]);
  return { posts, total };
}

export async function getEducationalPostById(id: string) {
  const post = await prisma.educationalPost.findUnique({ where: { id } });
  if (!post) throw new AppError("Educational post not found", 404);
  return post;
}

export async function createEducationalPost(data: any) {
  const { generateSlug } = await import("../../utils/slug");
  return prisma.educationalPost.create({
    data: { ...data, slug: data.slug || generateSlug(data.titleFA) },
  });
}

export async function updateEducationalPost(id: string, data: any) {
  return prisma.educationalPost.update({ where: { id }, data });
}

export async function deleteEducationalPost(id: string) {
  return prisma.educationalPost.update({ where: { id }, data: { isActive: false } });
}
