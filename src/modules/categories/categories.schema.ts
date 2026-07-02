import { z } from "zod";

export const createCategorySchema = z.object({
  slug: z.string().optional(),
  nameFA: z.string().min(1),
  nameEN: z.string().optional(),
  chakraColor: z.string().optional(),
  chakraHex: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const updateCategorySchema = z.object({
  slug: z.string().optional(),
  nameFA: z.string().min(1).optional(),
  nameEN: z.string().optional(),
  chakraColor: z.string().optional(),
  chakraHex: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});
