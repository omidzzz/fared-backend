import { z } from "zod";

export const addToWishlistSchema = z.object({
  productId: z.string().optional(),
  courseId: z.string().optional(),
});

export type AddToWishlistInput = z.infer<typeof addToWishlistSchema>;
