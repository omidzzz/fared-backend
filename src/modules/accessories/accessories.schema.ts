import { z } from "zod";

export const queryAccessorySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().optional(),
  featured: z.enum(["true", "false"]).optional(),
});
