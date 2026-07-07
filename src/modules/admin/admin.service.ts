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

// ── Products (list) ──────────────────────────────

export async function getProducts(page: number, limit: number, search?: string, category?: string, featured?: boolean) {
  const where: any = { isActive: true };
  if (search) where.OR = [{ nameFA: { contains: search } }, { nameEN: { contains: search } }];
  if (category) where.category = { slug: category };
  if (featured !== undefined) where.isFeatured = featured;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  // Normalize fields for the admin frontend (nameFA, category as slug string)
  const normalized = products.map((p) => ({
    ...p,
    nameFa: p.nameFA,
    category: p.category?.slug ?? null,
  }));

  return { products: normalized, total };
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({ where: { id }, include: { images: true, attributes: true, variants: true, colorOptions: true, category: true } });
  if (!product) throw new AppError("Product not found", 404);
  return product;
}

// ── Orders (single) ──────────────────────────────

export async function getOrderById(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { user: { select: { id: true, nameFA: true, phone: true, email: true } }, items: true, receipt: true },
  });
  if (!order) throw new AppError("Order not found", 404);
  return order;
}

// ── Messages / Enquiries ─────────────────────────

export async function getMessages(page: number, limit: number, read?: boolean) {
  const where: any = {};
  if (read !== undefined) where.isRead = read;

  const [messages, total] = await Promise.all([
    prisma.tourEnquiry.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
    prisma.tourEnquiry.count({ where }),
  ]);
  return { messages, total };
}

export async function getMessageById(id: string) {
  const message = await prisma.tourEnquiry.findUnique({ where: { id }, include: { tour: { select: { titleFA: true, destination: true } } } });
  if (!message) throw new AppError("Message not found", 404);
  return message;
}

export async function markMessageAsRead(id: string) {
  return prisma.tourEnquiry.update({ where: { id }, data: { status: TourEnquiryStatus.CONTACTED } });
}

// ── CMS ─────────────────────────────────────────────

export async function getArticles(page: number, limit: number, category?: string, published?: boolean) {
  const where: any = {};
  if (category) where.categoryFA = category;
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
  
  // Transform field names to match frontend expectations
  return { 
    articles: articles.map(a => ({
      ...a,
      title: a.titleFA,
      category: a.categoryFA,
      excerpt: a.excerptFA,
      body: a.bodyFA,
      author: a.authorFA,
    })),
    total 
  };
}

export async function getArticleById(id: string) {
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) throw new AppError("Article not found", 404);
  return {
    ...article,
    title: article.titleFA,
    category: article.categoryFA,
    excerpt: article.excerptFA,
    body: article.bodyFA,
    author: article.authorFA,
  };
}

export async function createArticle(data: any) {
  const { generateSlug } = await import("../../utils/slug");
  const articleData: any = {};
  
  // Map frontend field names to database field names
  if (data.title) articleData.titleFA = data.title;
  if (data.titleFA) articleData.titleFA = data.titleFA;
  if (data.excerpt) articleData.excerptFA = data.excerpt;
  if (data.excerptFA) articleData.excerptFA = data.excerptFA;
  if (data.body) articleData.bodyFA = data.body;
  if (data.bodyFA) articleData.bodyFA = data.bodyFA;
  if (data.author) articleData.authorFA = data.author;
  if (data.authorFA) articleData.authorFA = data.authorFA;
  if (data.category) articleData.categoryFA = data.category;
  if (data.categoryFA) articleData.categoryFA = data.categoryFA;
  if (data.image !== undefined) articleData.image = data.image;
  if (data.readMinutes !== undefined) articleData.readMinutes = data.readMinutes;
  if (data.isFeatured !== undefined) articleData.isFeatured = data.isFeatured;
  if (data.isPublished !== undefined) articleData.isPublished = data.isPublished;
  if (data.publishedAt !== undefined) articleData.publishedAt = data.publishedAt;
  
  articleData.slug = data.slug || generateSlug(articleData.titleFA || data.titleFA);
  
  const article = await prisma.article.create({ data: articleData });
  return {
    ...article,
    title: article.titleFA,
    category: article.categoryFA,
    excerpt: article.excerptFA,
    body: article.bodyFA,
    author: article.authorFA,
  };
}

export async function updateArticle(id: string, data: any) {
  const articleData: any = {};
  
  // Map frontend field names to database field names
  if (data.title !== undefined) articleData.titleFA = data.title;
  if (data.titleFA !== undefined) articleData.titleFA = data.titleFA;
  if (data.excerpt !== undefined) articleData.excerptFA = data.excerpt;
  if (data.excerptFA !== undefined) articleData.excerptFA = data.excerptFA;
  if (data.body !== undefined) articleData.bodyFA = data.body;
  if (data.bodyFA !== undefined) articleData.bodyFA = data.bodyFA;
  if (data.author !== undefined) articleData.authorFA = data.author;
  if (data.authorFA !== undefined) articleData.authorFA = data.authorFA;
  if (data.category !== undefined) articleData.categoryFA = data.category;
  if (data.categoryFA !== undefined) articleData.categoryFA = data.categoryFA;
  if (data.image !== undefined) articleData.image = data.image;
  if (data.readMinutes !== undefined) articleData.readMinutes = data.readMinutes;
  if (data.isFeatured !== undefined) articleData.isFeatured = data.isFeatured;
  if (data.isPublished !== undefined) articleData.isPublished = data.isPublished;
  if (data.publishedAt !== undefined) articleData.publishedAt = data.publishedAt;
  
  const article = await prisma.article.update({ where: { id }, data: articleData });
  return {
    ...article,
    title: article.titleFA,
    category: article.categoryFA,
    excerpt: article.excerptFA,
    body: article.bodyFA,
    author: article.authorFA,
  };
}

export async function deleteArticle(id: string) {
  return prisma.article.delete({ where: { id } });
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
  return { 
    books: books.map(b => ({
      ...b,
      title: b.titleFA,
      author: b.authorFA,
      description: b.descriptionFA,
      category: b.categoryFA,
      image: b.coverImage,
    })),
    total 
  };
}

export async function getBookById(id: string) {
  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) throw new AppError("Book not found", 404);
  return {
    ...book,
    title: book.titleFA,
    author: book.authorFA,
    description: book.descriptionFA,
    category: book.categoryFA,
    image: book.coverImage,
  };
}

export async function createBook(data: any) {
  const { generateSlug } = await import("../../utils/slug");
  const bookData: any = {};
  
  if (data.title) bookData.titleFA = data.title;
  if (data.titleFA) bookData.titleFA = data.titleFA;
  if (data.titleEN) bookData.titleEN = data.titleEN;
  if (data.author) bookData.authorFA = data.author;
  if (data.authorFA) bookData.authorFA = data.authorFA;
  if (data.authorEN) bookData.authorEN = data.authorEN;
  if (data.description) bookData.descriptionFA = data.description;
  if (data.descriptionFA) bookData.descriptionFA = data.descriptionFA;
  if (data.category) bookData.categoryFA = data.category;
  if (data.categoryFA) bookData.categoryFA = data.categoryFA;
  if (data.image) bookData.coverImage = data.image;
  if (data.coverImage) bookData.coverImage = data.coverImage;
  if (data.year !== undefined) bookData.year = data.year;
  if (data.pages !== undefined) bookData.pages = data.pages;
  if (data.rating !== undefined) bookData.rating = data.rating;
  if (data.isPublished !== undefined) bookData.isPublished = data.isPublished;
  
  bookData.slug = data.slug || generateSlug(bookData.titleFA || data.titleFA);
  
  const book = await prisma.book.create({ data: bookData });
  return {
    ...book,
    title: book.titleFA,
    author: book.authorFA,
    description: book.descriptionFA,
    category: book.categoryFA,
    image: book.coverImage,
  };
}

export async function updateBook(id: string, data: any) {
  const bookData: any = {};
  
  if (data.title !== undefined) bookData.titleFA = data.title;
  if (data.titleFA !== undefined) bookData.titleFA = data.titleFA;
  if (data.titleEN !== undefined) bookData.titleEN = data.titleEN;
  if (data.author !== undefined) bookData.authorFA = data.author;
  if (data.authorFA !== undefined) bookData.authorFA = data.authorFA;
  if (data.authorEN !== undefined) bookData.authorEN = data.authorEN;
  if (data.description !== undefined) bookData.descriptionFA = data.description;
  if (data.descriptionFA !== undefined) bookData.descriptionFA = data.descriptionFA;
  if (data.category !== undefined) bookData.categoryFA = data.category;
  if (data.categoryFA !== undefined) bookData.categoryFA = data.categoryFA;
  if (data.image !== undefined) bookData.coverImage = data.image;
  if (data.coverImage !== undefined) bookData.coverImage = data.coverImage;
  if (data.year !== undefined) bookData.year = data.year;
  if (data.pages !== undefined) bookData.pages = data.pages;
  if (data.rating !== undefined) bookData.rating = data.rating;
  if (data.isPublished !== undefined) bookData.isPublished = data.isPublished;
  
  const book = await prisma.book.update({ where: { id }, data: bookData });
  return {
    ...book,
    title: book.titleFA,
    author: book.authorFA,
    description: book.descriptionFA,
    category: book.categoryFA,
    image: book.coverImage,
  };
}

export async function deleteBook(id: string) {
  return prisma.book.delete({ where: { id } });
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
  return { 
    poems: poems.map(p => ({
      ...p,
      title: p.titleFA,
      poet: p.poetFA,
      lines: p.linesFA,
    })),
    total 
  };
}

export async function getPoemById(id: string) {
  const poem = await prisma.poem.findUnique({ where: { id } });
  if (!poem) throw new AppError("Poem not found", 404);
  return {
    ...poem,
    title: poem.titleFA,
    poet: poem.poetFA,
    lines: poem.linesFA,
  };
}

export async function createPoem(data: any) {
  const { generateSlug } = await import("../../utils/slug");
  const poemData: any = {};
  
  if (data.title) poemData.titleFA = data.title;
  if (data.titleFA) poemData.titleFA = data.titleFA;
  if (data.poet) poemData.poetFA = data.poet;
  if (data.poetFA) poemData.poetFA = data.poetFA;
  if (data.poetEN) poemData.poetEN = data.poetEN;
  if (data.era) poemData.era = data.era;
  if (data.lines) poemData.linesFA = data.lines;
  if (data.linesFA) poemData.linesFA = data.linesFA;
  if (data.theme) poemData.theme = data.theme;
  if (data.backgroundGradient) poemData.backgroundGradient = data.backgroundGradient;
  if (data.isPublished !== undefined) poemData.isPublished = data.isPublished;
  
  poemData.slug = data.slug || generateSlug(poemData.titleFA || data.titleFA);
  
  const poem = await prisma.poem.create({ data: poemData });
  return {
    ...poem,
    title: poem.titleFA,
    poet: poem.poetFA,
    lines: poem.linesFA,
  };
}

export async function updatePoem(id: string, data: any) {
  const poemData: any = {};
  
  if (data.title !== undefined) poemData.titleFA = data.title;
  if (data.titleFA !== undefined) poemData.titleFA = data.titleFA;
  if (data.poet !== undefined) poemData.poetFA = data.poet;
  if (data.poetFA !== undefined) poemData.poetFA = data.poetFA;
  if (data.poetEN !== undefined) poemData.poetEN = data.poetEN;
  if (data.era !== undefined) poemData.era = data.era;
  if (data.lines !== undefined) poemData.linesFA = data.lines;
  if (data.linesFA !== undefined) poemData.linesFA = data.linesFA;
  if (data.theme !== undefined) poemData.theme = data.theme;
  if (data.backgroundGradient !== undefined) poemData.backgroundGradient = data.backgroundGradient;
  if (data.isPublished !== undefined) poemData.isPublished = data.isPublished;
  
  const poem = await prisma.poem.update({ where: { id }, data: poemData });
  return {
    ...poem,
    title: poem.titleFA,
    poet: poem.poetFA,
    lines: poem.linesFA,
  };
}

export async function deletePoem(id: string) {
  return prisma.poem.delete({ where: { id } });
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
  return { 
    posts: posts.map(p => ({
      ...p,
      title: p.titleFA,
      category: p.categoryFA,
      body: p.bodyFA,
      excerpt: p.excerptFA,
      tags: p.tagsFA,
    })),
    total 
  };
}

export async function getEducationalPostById(id: string) {
  const post = await prisma.educationalPost.findUnique({ where: { id } });
  if (!post) throw new AppError("Educational post not found", 404);
  return {
    ...post,
    title: post.titleFA,
    category: post.categoryFA,
    body: post.bodyFA,
    excerpt: post.excerptFA,
    tags: post.tagsFA,
  };
}

export async function createEducationalPost(data: any) {
  const { generateSlug } = await import("../../utils/slug");
  const postData: any = {};
  
  if (data.title) postData.titleFA = data.title;
  if (data.titleFA) postData.titleFA = data.titleFA;
  if (data.titleEN) postData.titleEN = data.titleEN;
  if (data.category) postData.categoryFA = data.category;
  if (data.categoryFA) postData.categoryFA = data.categoryFA;
  if (data.categoryEN) postData.categoryEN = data.categoryEN;
  if (data.body) postData.bodyFA = data.body;
  if (data.bodyFA) postData.bodyFA = data.bodyFA;
  if (data.bodyEN) postData.bodyEN = data.bodyEN;
  if (data.excerpt) postData.excerptFA = data.excerpt;
  if (data.excerptFA) postData.excerptFA = data.excerptFA;
  if (data.tags) postData.tagsFA = data.tags;
  if (data.tagsFA) postData.tagsFA = data.tagsFA;
  if (data.readMinutes !== undefined) postData.readMinutes = data.readMinutes;
  if (data.isPublished !== undefined) postData.isPublished = data.isPublished;
  if (data.publishedAt !== undefined) postData.publishedAt = data.publishedAt;
  if (data.authorId) postData.authorId = data.authorId;
  
  postData.slug = data.slug || generateSlug(postData.titleFA || data.titleFA);
  
  // If authorId is not provided, use a default admin
  if (!postData.authorId) {
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    postData.authorId = admin?.id || '';
  }
  
  const post = await prisma.educationalPost.create({ data: postData });
  return {
    ...post,
    title: post.titleFA,
    category: post.categoryFA,
    body: post.bodyFA,
    excerpt: post.excerptFA,
    tags: post.tagsFA,
  };
}

export async function updateEducationalPost(id: string, data: any) {
  const postData: any = {};
  
  if (data.title !== undefined) postData.titleFA = data.title;
  if (data.titleFA !== undefined) postData.titleFA = data.titleFA;
  if (data.titleEN !== undefined) postData.titleEN = data.titleEN;
  if (data.category !== undefined) postData.categoryFA = data.category;
  if (data.categoryFA !== undefined) postData.categoryFA = data.categoryFA;
  if (data.categoryEN !== undefined) postData.categoryEN = data.categoryEN;
  if (data.body !== undefined) postData.bodyFA = data.body;
  if (data.bodyFA !== undefined) postData.bodyFA = data.bodyFA;
  if (data.bodyEN !== undefined) postData.bodyEN = data.bodyEN;
  if (data.excerpt !== undefined) postData.excerptFA = data.excerpt;
  if (data.excerptFA !== undefined) postData.excerptFA = data.excerptFA;
  if (data.tags !== undefined) postData.tagsFA = data.tags;
  if (data.tagsFA !== undefined) postData.tagsFA = data.tagsFA;
  if (data.readMinutes !== undefined) postData.readMinutes = data.readMinutes;
  if (data.isPublished !== undefined) postData.isPublished = data.isPublished;
  if (data.publishedAt !== undefined) postData.publishedAt = data.publishedAt;
  
  const post = await prisma.educationalPost.update({ where: { id }, data: postData });
  return {
    ...post,
    title: post.titleFA,
    category: post.categoryFA,
    body: post.bodyFA,
    excerpt: post.excerptFA,
    tags: post.tagsFA,
  };
}

export async function deleteEducationalPost(id: string) {
  return prisma.educationalPost.delete({ where: { id } });
}

// ── Courses (admin) ──────────────────────────────

export async function getAdminCourses(page: number, limit: number, search?: string) {
  const where: any = {};
  if (search) where.OR = [{ nameFA: { contains: search } }, { nameEN: { contains: search } }];

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      include: { category: true, instructor: { select: { id: true, nameFA: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.course.count({ where }),
  ]);

  const normalized = courses.map((c) => ({
    ...c,
    titleFa: c.nameFA,
    titleEn: c.nameEN,
    instructor: c.instructor?.nameFA ?? null,
    image: c.heroImage ?? null,
    active: c.isActive,
  }));

  return { courses: normalized, total };
}

export async function getAdminCourseById(id: string) {
  const course = await prisma.course.findUnique({
    where: { id },
    include: { category: true, instructor: { select: { id: true, nameFA: true } } },
  });
  if (!course) throw new AppError("Course not found", 404);
  return {
    ...course,
    titleFa: course.nameFA,
    titleEn: course.nameEN,
    instructor: course.instructor?.nameFA ?? null,
    image: course.heroImage ?? null,
    active: course.isActive,
  };
}

export async function createCourse(data: any) {
  const { generateSlug } = await import("../../utils/slug");
  const courseData: any = {
    nameFA: data.titleFa || data.nameFA,
    nameEN: data.titleEn || data.nameEN || null,
    descriptionFA: data.descriptionFa || data.descriptionFA || "",
    descriptionEN: data.descriptionEn || data.descriptionEN || null,
    price: Number(data.price) || 0,
    duration: data.duration || `${data.durationHours || 0} hours`,
    durationWeeks: Number(data.durationWeeks) || 0,
    lessons: Number(data.lessons) || 0,
    certificate: Boolean(data.certificate),
    isActive: data.active !== undefined ? Boolean(data.active) : true,
    isFeatured: Boolean(data.featured),
    heroImage: data.image || data.heroImage || null,
    categoryId: data.categoryId || (await getDefaultCategoryId()),
    instructorId: data.instructorId || (await getDefaultInstructorId()),
  };
  courseData.slug = data.slug || generateSlug(courseData.nameFA);

  const course = await prisma.course.create({ data: courseData });
  return {
    ...course,
    titleFa: course.nameFA,
    titleEn: course.nameEN,
    instructor: null,
    image: course.heroImage ?? null,
    active: course.isActive,
  };
}

export async function updateCourse(id: string, data: any) {
  const courseData: any = {};
  if (data.titleFa !== undefined) courseData.nameFA = data.titleFa;
  if (data.nameFA !== undefined) courseData.nameFA = data.nameFA;
  if (data.titleEn !== undefined) courseData.nameEN = data.titleEn;
  if (data.nameEN !== undefined) courseData.nameEN = data.nameEN;
  if (data.descriptionFa !== undefined) courseData.descriptionFA = data.descriptionFa;
  if (data.descriptionFA !== undefined) courseData.descriptionFA = data.descriptionFA;
  if (data.descriptionEn !== undefined) courseData.descriptionEN = data.descriptionEn;
  if (data.descriptionEN !== undefined) courseData.descriptionEN = data.descriptionEN;
  if (data.price !== undefined) courseData.price = Number(data.price);
  if (data.duration !== undefined) courseData.duration = data.duration;
  if (data.durationWeeks !== undefined) courseData.durationWeeks = Number(data.durationWeeks);
  if (data.lessons !== undefined) courseData.lessons = Number(data.lessons);
  if (data.certificate !== undefined) courseData.certificate = Boolean(data.certificate);
  if (data.active !== undefined) courseData.isActive = Boolean(data.active);
  if (data.featured !== undefined) courseData.isFeatured = Boolean(data.featured);
  if (data.image !== undefined) courseData.heroImage = data.image;
  if (data.heroImage !== undefined) courseData.heroImage = data.heroImage;
  if (data.categoryId !== undefined) courseData.categoryId = data.categoryId;
  if (data.instructorId !== undefined) courseData.instructorId = data.instructorId;

  const course = await prisma.course.update({ where: { id }, data: courseData });
  return {
    ...course,
    titleFa: course.nameFA,
    titleEn: course.nameEN,
    instructor: null,
    image: course.heroImage ?? null,
    active: course.isActive,
  };
}

export async function deleteCourse(id: string) {
  return prisma.course.delete({ where: { id } });
}

// ── Tours (admin) ────────────────────────────────

export async function getAdminTours(page: number, limit: number, search?: string) {
  const where: any = {};
  if (search) where.OR = [{ titleFA: { contains: search } }, { titleEN: { contains: search } }];

  const [tours, total] = await Promise.all([
    prisma.tour.findMany({
      where,
      include: { category: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      orderBy: { startDate: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.tour.count({ where }),
  ]);

  const normalized = tours.map((t) => ({
    ...t,
    image: t.images?.[0]?.url ?? t.heroImage ?? null,
    active: t.isActive,
    maxCapacity: t.spotsTotal,
  }));

  return { tours: normalized, total };
}

export async function getAdminTourById(id: string) {
  const tour = await prisma.tour.findUnique({
    where: { id },
    include: { category: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });
  if (!tour) throw new AppError("Tour not found", 404);
  return {
    ...tour,
    image: tour.images?.[0]?.url ?? tour.heroImage ?? null,
    active: tour.isActive,
    maxCapacity: tour.spotsTotal,
  };
}

export async function createTour(data: any) {
  const { generateSlug } = await import("../../utils/slug");
  const tourData: any = {
    titleFA: data.titleFa || data.nameFA,
    titleEN: data.titleEn || data.nameEN || null,
    descriptionFA: data.descriptionFa || data.descriptionFA || "",
    descriptionEN: data.descriptionEn || data.descriptionEN || null,
    price: Number(data.price) || 0,
    destination: data.destination || data.location || "Unknown",
    dateRange: data.dateRange || "",
    startDate: data.startDate ? new Date(data.startDate) : new Date(),
    endDate: data.endDate ? new Date(data.endDate) : new Date(),
    durationDays: Number(data.durationDays) || 0,
    spotsTotal: Number(data.maxCapacity) || 0,
    spotsLeft: Number(data.maxCapacity) || 0,
    instructor: data.instructor || "",
    isActive: data.active !== undefined ? Boolean(data.active) : true,
    isFeatured: Boolean(data.featured),
    heroImage: data.image || data.heroImage || null,
    categoryId: data.categoryId || (await getDefaultCategoryId()),
  };
  tourData.slug = data.slug || generateSlug(tourData.titleFA);

  const tour = await prisma.tour.create({ data: tourData });
  return {
    ...tour,
    image: tour.heroImage ?? null,
    active: tour.isActive,
    maxCapacity: tour.spotsTotal,
  };
}

export async function updateTour(id: string, data: any) {
  const tourData: any = {};
  if (data.titleFa !== undefined) tourData.titleFA = data.titleFa;
  if (data.nameFA !== undefined) tourData.titleFA = data.nameFA;
  if (data.titleEn !== undefined) tourData.titleEN = data.titleEn;
  if (data.nameEN !== undefined) tourData.titleEN = data.nameEN;
  if (data.descriptionFa !== undefined) tourData.descriptionFA = data.descriptionFa;
  if (data.descriptionFA !== undefined) tourData.descriptionFA = data.descriptionFA;
  if (data.descriptionEn !== undefined) tourData.descriptionEN = data.descriptionEn;
  if (data.descriptionEN !== undefined) tourData.descriptionEN = data.descriptionEN;
  if (data.price !== undefined) tourData.price = Number(data.price);
  if (data.destination !== undefined) tourData.destination = data.destination;
  if (data.location !== undefined) tourData.destination = data.location;
  if (data.dateRange !== undefined) tourData.dateRange = data.dateRange;
  if (data.startDate !== undefined) tourData.startDate = new Date(data.startDate);
  if (data.endDate !== undefined) tourData.endDate = new Date(data.endDate);
  if (data.durationDays !== undefined) tourData.durationDays = Number(data.durationDays);
  if (data.maxCapacity !== undefined) {
    tourData.spotsTotal = Number(data.maxCapacity);
    tourData.spotsLeft = Number(data.maxCapacity);
  }
  if (data.instructor !== undefined) tourData.instructor = data.instructor;
  if (data.active !== undefined) tourData.isActive = Boolean(data.active);
  if (data.featured !== undefined) tourData.isFeatured = Boolean(data.featured);
  if (data.image !== undefined) tourData.heroImage = data.image;
  if (data.heroImage !== undefined) tourData.heroImage = data.heroImage;
  if (data.categoryId !== undefined) tourData.categoryId = data.categoryId;

  const tour = await prisma.tour.update({ where: { id }, data: tourData });
  return {
    ...tour,
    image: tour.heroImage ?? null,
    active: tour.isActive,
    maxCapacity: tour.spotsTotal,
  };
}

export async function deleteTour(id: string) {
  return prisma.tour.delete({ where: { id } });
}

// ── Helpers ──────────────────────────────────────

async function getDefaultCategoryId(): Promise<string> {
  const cat = await prisma.category.findFirst();
  return cat?.id || "";
}

async function getDefaultInstructorId(): Promise<string> {
  const instructor = await prisma.user.findFirst({
    where: { role: { in: ["INSTRUCTOR", "ADMIN", "SUPER_ADMIN"] } },
  });
  return instructor?.id || "";
}
