import { Request, Response, NextFunction } from "express";
import { sendSuccess, sendPaginated } from "../../utils/response";
import { parsePagination } from "../../utils/pagination";
import {
  updateOrderStatusSchema, rejectReceiptSchema,
  updateEnquiryStatusSchema, adminReplySchema, scheduleSessionSchema,
} from "./admin.schema";
import * as adminService from "./admin.service";

export async function getStatsHandler(_req: Request, res: Response, next: NextFunction) {
  try { const stats = await adminService.getStats(); sendSuccess(res, stats); } catch (e) { next(e); }
}

export async function getAdminOrdersHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = parsePagination(req.query as any);
    const { status } = req.query;
    const result = await adminService.getAdminOrders(page, limit, status as string | undefined);
    sendPaginated(res, result.orders, result.total, page, limit, "orders");
  } catch (e) { next(e); }
}

export async function updateOrderStatusHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, trackingCode } = updateOrderStatusSchema.parse(req.body);
    const updated = await adminService.updateOrderStatus(
      req.params.id as string, status, trackingCode, req.user!.id
    );
    sendSuccess(res, updated, 200, "Order status updated");
  } catch (e) { next(e); }
}

export async function getReceiptsHandler(_req: Request, res: Response, next: NextFunction) {
  try { const receipts = await adminService.getPendingReceipts(); sendSuccess(res, receipts); } catch (e) { next(e); }
}

export async function approveReceiptHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminService.approveReceipt(req.params.id as string, req.user!.id);
    sendSuccess(res, result, 200, "Receipt approved and payment confirmed");
  } catch (e) { next(e); }
}

export async function rejectReceiptHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { rejectReason } = rejectReceiptSchema.parse(req.body);
    const result = await adminService.rejectReceipt(req.params.id as string, rejectReason, req.user!.id);
    sendSuccess(res, result, 200, "Receipt rejected");
  } catch (e) { next(e); }
}

export async function getEnquiriesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.query;
    const enquiries = await adminService.getEnquiries(status as string | undefined);
    sendSuccess(res, enquiries);
  } catch (e) { next(e); }
}

export async function updateEnquiryStatusHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, adminNotes } = updateEnquiryStatusSchema.parse(req.body);
    const enquiry = await adminService.updateEnquiryStatus(req.params.id as string, status, adminNotes);
    sendSuccess(res, enquiry, 200, "Enquiry status updated");
  } catch (e) { next(e); }
}

export async function getPendingCommentsHandler(_req: Request, res: Response, next: NextFunction) {
  try { const reviews = await adminService.getPendingComments(); sendSuccess(res, reviews); } catch (e) { next(e); }
}

export async function approveCommentHandler(req: Request, res: Response, next: NextFunction) {
  try { const review = await adminService.approveComment(req.params.id as string); sendSuccess(res, review, 200, "Comment approved"); } catch (e) { next(e); }
}

export async function replyToCommentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { reply } = adminReplySchema.parse(req.body);
    const review = await adminService.replyToComment(req.params.id as string, reply);
    sendSuccess(res, review, 200, "Reply added");
  } catch (e) { next(e); }
}

export async function getPendingForumHandler(_req: Request, res: Response, next: NextFunction) {
  try { const result = await adminService.getPendingForum(); sendSuccess(res, result); } catch (e) { next(e); }
}

export async function approveTopicHandler(req: Request, res: Response, next: NextFunction) {
  try { const topic = await adminService.approveTopic(req.params.id as string); sendSuccess(res, topic, 200, "Topic approved"); } catch (e) { next(e); }
}

export async function approveReplyHandler(req: Request, res: Response, next: NextFunction) {
  try { const reply = await adminService.approveReply(req.params.id as string); sendSuccess(res, reply, 200, "Reply approved"); } catch (e) { next(e); }
}

export async function getUsersHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = parsePagination(req.query as any);
    const result = await adminService.getUsers(page, limit);
    sendPaginated(res, result.users, result.total, page, limit, "users");
  } catch (e) { next(e); }
}

export async function createProductHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await adminService.createProduct(req.body);
    sendSuccess(res, product, 201, "Product created");
  } catch (e) { next(e); }
}

export async function updateProductHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await adminService.updateProduct(req.params.id as string, req.body);
    sendSuccess(res, product, 200, "Product updated");
  } catch (e) { next(e); }
}

export async function deleteProductHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await adminService.deactivateProduct(req.params.id as string);
    sendSuccess(res, product, 200, "Product deactivated");
  } catch (e) { next(e); }
}

export async function scheduleSessionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { scheduledAt } = scheduleSessionSchema.parse(req.body);
    const session = await adminService.scheduleSession(req.params.id as string, scheduledAt);
    sendSuccess(res, session, 200, "Session scheduled");
  } catch (e) { next(e); }
}

// ── CMS ─────────────────────────────────────────────

export async function getArticlesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = parsePagination(req.query as any);
    const { category, published } = req.query;
    const result = await adminService.getArticles(page, limit, category as string | undefined, published === undefined ? undefined : published === 'true');
    sendPaginated(res, result.articles, result.total, page, limit, "articles");
  } catch (e) { next(e); }
}

export async function getArticleByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const article = await adminService.getArticleById(req.params.id as string);
    sendSuccess(res, article);
  } catch (e) { next(e); }
}

export async function createArticleHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const article = await adminService.createArticle(req.body);
    sendSuccess(res, article, 201, "Article created");
  } catch (e) { next(e); }
}

export async function updateArticleHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const article = await adminService.updateArticle(req.params.id as string, req.body);
    sendSuccess(res, article, 200, "Article updated");
  } catch (e) { next(e); }
}

export async function deleteArticleHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const article = await adminService.deleteArticle(req.params.id as string);
    sendSuccess(res, article, 200, "Article deleted");
  } catch (e) { next(e); }
}

export async function getBooksHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = parsePagination(req.query as any);
    const result = await adminService.getBooks(page, limit);
    sendPaginated(res, result.books, result.total, page, limit, "books");
  } catch (e) { next(e); }
}

export async function getBookByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const book = await adminService.getBookById(req.params.id as string);
    sendSuccess(res, book);
  } catch (e) { next(e); }
}

export async function createBookHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const book = await adminService.createBook(req.body);
    sendSuccess(res, book, 201, "Book created");
  } catch (e) { next(e); }
}

export async function updateBookHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const book = await adminService.updateBook(req.params.id as string, req.body);
    sendSuccess(res, book, 200, "Book updated");
  } catch (e) { next(e); }
}

export async function deleteBookHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const book = await adminService.deleteBook(req.params.id as string);
    sendSuccess(res, book, 200, "Book deleted");
  } catch (e) { next(e); }
}

export async function getPoemsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = parsePagination(req.query as any);
    const result = await adminService.getPoems(page, limit);
    sendPaginated(res, result.poems, result.total, page, limit, "poems");
  } catch (e) { next(e); }
}

export async function getPoemByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const poem = await adminService.getPoemById(req.params.id as string);
    sendSuccess(res, poem);
  } catch (e) { next(e); }
}

export async function createPoemHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const poem = await adminService.createPoem(req.body);
    sendSuccess(res, poem, 201, "Poem created");
  } catch (e) { next(e); }
}

export async function updatePoemHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const poem = await adminService.updatePoem(req.params.id as string, req.body);
    sendSuccess(res, poem, 200, "Poem updated");
  } catch (e) { next(e); }
}

export async function deletePoemHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const poem = await adminService.deletePoem(req.params.id as string);
    sendSuccess(res, poem, 200, "Poem deleted");
  } catch (e) { next(e); }
}

export async function getEducationalPostsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = parsePagination(req.query as any);
    const result = await adminService.getEducationalPosts(page, limit);
    sendPaginated(res, result.posts, result.total, page, limit, "posts");
  } catch (e) { next(e); }
}

export async function getEducationalPostByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await adminService.getEducationalPostById(req.params.id as string);
    sendSuccess(res, post);
  } catch (e) { next(e); }
}

export async function createEducationalPostHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await adminService.createEducationalPost(req.body);
    sendSuccess(res, post, 201, "Educational post created");
  } catch (e) { next(e); }
}

export async function updateEducationalPostHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await adminService.updateEducationalPost(req.params.id as string, req.body);
    sendSuccess(res, post, 200, "Educational post updated");
  } catch (e) { next(e); }
}

export async function deleteEducationalPostHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await adminService.deleteEducationalPost(req.params.id as string);
    sendSuccess(res, post, 200, "Educational post deleted");
  } catch (e) { next(e); }
}
