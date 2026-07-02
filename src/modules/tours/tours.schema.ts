import { z } from "zod";

export const tourEnquirySchema = z.object({
  fullName: z.string().min(1, "fullName is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  tourId: z.string().min(1, "tourId is required"),
  arrivalDate: z.string().optional(),
  message: z.string().optional(),
});

export type TourEnquiryInput = z.infer<typeof tourEnquirySchema>;
