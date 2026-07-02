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
    sendPaginated(res, result.orders, result.total, page, limit);
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
    sendPaginated(res, result.users, result.total, page, limit);
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
