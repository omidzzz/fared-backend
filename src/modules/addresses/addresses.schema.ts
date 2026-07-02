import { z } from "zod";

export const createAddressSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().min(1, "Phone is required"),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  address1: z.string().min(1, "Address is required"),
  address2: z.string().optional(),
  postalCode: z.string().min(1, "Postal code is required"),
  notes: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export const updateAddressSchema = z.object({
  fullName: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  address1: z.string().min(1).optional(),
  address2: z.string().optional(),
  postalCode: z.string().min(1).optional(),
  notes: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
