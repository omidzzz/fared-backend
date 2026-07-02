import { z } from "zod";

export const createEducationalPostSchema = z.object({
  titleFA: z.string().min(1),
  titleEN: z.string().optional(),
  categoryFA: z.string().optional(),
  categoryEN: z.string().optional(),
  bodyFA: z.string().optional(),
  bodyEN: z.string().optional(),
  excerptFA: z.string().optional(),
  image: z.string().optional(),
  tagsFA: z.array(z.string()).optional(),
  readMinutes: z.number().int().optional(),
  isPublished: z.boolean().optional(),
  publishedAt: z.string().optional(),
  authorId: z.string().optional(),
  slug: z.string().optional(),
});

export const updateEducationalPostSchema = z.object({
  titleFA: z.string().min(1).optional(),
  titleEN: z.string().optional(),
  categoryFA: z.string().optional(),
  categoryEN: z.string().optional(),
  bodyFA: z.string().optional(),
  bodyEN: z.string().optional(),
  excerptFA: z.string().optional(),
  image: z.string().optional(),
  tagsFA: z.array(z.string()).optional(),
  readMinutes: z.number().int().optional(),
  isPublished: z.boolean().optional(),
  publishedAt: z.string().optional(),
  authorId: z.string().optional(),
  slug: z.string().optional(),
});

export const createBookSchema = z.object({
  titleFA: z.string().min(1),
  titleEN: z.string().optional(),
  authorFA: z.string().optional(),
  authorEN: z.string().optional(),
  descriptionFA: z.string().optional(),
  categoryFA: z.string().optional(),
  coverImage: z.string().optional(),
  year: z.number().int().optional(),
  pages: z.number().int().optional(),
  rating: z.number().optional(),
  isPublished: z.boolean().optional(),
  slug: z.string().optional(),
});

export const updateBookSchema = z.object({
  titleFA: z.string().min(1).optional(),
  titleEN: z.string().optional(),
  authorFA: z.string().optional(),
  authorEN: z.string().optional(),
  descriptionFA: z.string().optional(),
  categoryFA: z.string().optional(),
  coverImage: z.string().optional(),
  year: z.number().int().optional(),
  pages: z.number().int().optional(),
  rating: z.number().optional(),
  isPublished: z.boolean().optional(),
  slug: z.string().optional(),
});

export const createArticleSchema = z.object({
  titleFA: z.string().min(1),
  excerptFA: z.string().optional(),
  bodyFA: z.string().optional(),
  authorFA: z.string().optional(),
  categoryFA: z.string().optional(),
  image: z.string().optional(),
  readMinutes: z.number().int().optional(),
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  publishedAt: z.string().optional(),
  slug: z.string().optional(),
});

export const updateArticleSchema = z.object({
  titleFA: z.string().min(1).optional(),
  excerptFA: z.string().optional(),
  bodyFA: z.string().optional(),
  authorFA: z.string().optional(),
  categoryFA: z.string().optional(),
  image: z.string().optional(),
  readMinutes: z.number().int().optional(),
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  publishedAt: z.string().optional(),
  slug: z.string().optional(),
});

export const createPoemSchema = z.object({
  titleFA: z.string().min(1),
  poetFA: z.string().optional(),
  poetEN: z.string().optional(),
  era: z.string().optional(),
  linesFA: z.array(z.string()).optional(),
  theme: z.array(z.string()).optional(),
  backgroundGradient: z.string().optional(),
  isPublished: z.boolean().optional(),
  slug: z.string().optional(),
});

export const updatePoemSchema = z.object({
  titleFA: z.string().min(1).optional(),
  poetFA: z.string().optional(),
  poetEN: z.string().optional(),
  era: z.string().optional(),
  linesFA: z.array(z.string()).optional(),
  theme: z.array(z.string()).optional(),
  backgroundGradient: z.string().optional(),
  isPublished: z.boolean().optional(),
  slug: z.string().optional(),
});
