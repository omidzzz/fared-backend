import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().optional(),
  courseId: z.string().optional(),
  mentorId: z.string().optional(),
  variantId: z.string().optional(),
  quantity: z.coerce.number().int().min(1).optional(),
});

export const updateCartItemSchema = z.object({
  itemId: z.string().min(1, "itemId is required"),
  quantity: z.number().int(),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
