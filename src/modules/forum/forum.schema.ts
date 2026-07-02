import { z } from "zod";

export const createTopicSchema = z.object({
  titleFA: z.string().min(1, "titleFA is required"),
  bodyFA: z.string().min(1, "bodyFA is required"),
  category: z.string().min(1, "category is required"),
  tags: z.array(z.string()).optional(),
});

export const createReplySchema = z.object({
  bodyFA: z.string().min(1, "bodyFA is required"),
  bodyEN: z.string().optional(),
});

export const topicsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type CreateTopicInput = z.infer<typeof createTopicSchema>;
export type CreateReplyInput = z.infer<typeof createReplySchema>;
