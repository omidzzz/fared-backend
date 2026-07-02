import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  bodyFA: z.string().min(1, "Review body (bodyFA) is required"),
  bodyEN: z.string().optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
