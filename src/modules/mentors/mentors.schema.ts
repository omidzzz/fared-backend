import { z } from "zod";

export const bookSessionSchema = z.object({
  notes: z.string().optional(),
});

export type BookSessionInput = z.infer<typeof bookSessionSchema>;
