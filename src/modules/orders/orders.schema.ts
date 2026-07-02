import { z } from "zod";

export const createOrderSchema = z.object({
  paymentMethod: z.enum(["IR_GATEWAY", "CARD_TO_CARD"]),
  addressId: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
