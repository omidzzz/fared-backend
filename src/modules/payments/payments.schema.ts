import { z } from "zod";

export const paymentCallbackQuerySchema = z.object({
  status: z.string().optional(),
  authority: z.string().optional(),
  orderId: z.string().optional(),
});
