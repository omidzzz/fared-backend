import { z } from "zod";

export const updateProfileSchema = z.object({
  nameFA: z.string().min(2, "Name must be at least 2 characters").max(100).optional(),
  name: z.string().min(2, "Name must be at least 2 characters").max(100).optional(),
  email: z.string().email("Invalid email").optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
