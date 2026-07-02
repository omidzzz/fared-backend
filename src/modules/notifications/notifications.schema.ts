import { z } from "zod";

// No body validation needed — routes use only URL params
export const markReadSchema = z.object({});
export const markAllReadSchema = z.object({});
