import { z } from "zod";

export const adminOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  status: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.string().min(1, "Status is required"),
  trackingCode: z.string().optional(),
});

export const rejectReceiptSchema = z.object({
  rejectReason: z.string().min(1, "Reject reason is required"),
});

export const updateEnquiryStatusSchema = z.object({
  status: z.string().min(1, "Status is required"),
  adminNotes: z.string().optional(),
});

export const adminReplySchema = z.object({
  reply: z.string().min(1, "Reply text is required"),
});

export const scheduleSessionSchema = z.object({
  scheduledAt: z.string().min(1, "scheduledAt is required"),
});

export const adminUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
