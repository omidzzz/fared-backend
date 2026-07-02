import { z } from "zod";

export const uploadMediaSchema = z.object({
  folder: z.string().optional(),
});

export const mediaQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
