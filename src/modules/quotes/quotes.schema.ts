import { z } from "zod";

export const createQuoteSchema = z.object({
  textFA: z.string().min(1, "textFA is required"),
  textEN: z.string().optional(),
  sourceFA: z.string().min(1, "sourceFA is required"),
  sourceEN: z.string().optional(),
  scheduledDate: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updateQuoteSchema = z.object({
  textFA: z.string().min(1).optional(),
  textEN: z.string().optional(),
  sourceFA: z.string().optional(),
  sourceEN: z.string().optional(),
  scheduledDate: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>;
