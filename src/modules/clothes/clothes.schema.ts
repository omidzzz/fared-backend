// clothes.schema.ts
import { z } from "zod";

export const queryClothesSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  search: z.string().optional(),
  featured: z.enum(["true", "false"]).optional(),
  bestseller: z.enum(["true", "false"]).optional(),
});
