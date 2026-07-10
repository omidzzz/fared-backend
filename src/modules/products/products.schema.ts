import { z } from "zod";

export const queryProductSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  category: z.string().optional(),
  type: z.string().optional(),
  featured: z.string().optional(),
  bestseller: z.string().optional(),
  search: z.string().optional(),
  property: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
});

export const searchProductSchema = z.object({
  q: z.string().optional(),
});
