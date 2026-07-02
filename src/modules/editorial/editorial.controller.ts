import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/response";
import {
  createEducationalPostSchema,
  updateEducationalPostSchema,
  createBookSchema,
  updateBookSchema,
  createArticleSchema,
  updateArticleSchema,
  createPoemSchema,
  updatePoemSchema,
} from "./editorial.schema";
import * as editorialService from "./editorial.service";

// ── Educational Posts ──────────────────────────────

export async function getEducationalPostsHandler(_req: Request, res: Response, next: NextFunction) {
  try { const posts = await editorialService.getEducationalPosts(); sendSuccess(res, posts); } catch (e) { next(e); }
}
export async function getEducationalPostHandler(req: Request, res: Response, next: NextFunction) {
  try { const post = await editorialService.getEducationalPostBySlug(req.params.slug as string); sendSuccess(res, post); } catch (e) { next(e); }
}
export async function createEducationalPostHandler(req: Request, res: Response, next: NextFunction) {
  try { const data = createEducationalPostSchema.parse(req.body) as any; const post = await editorialService.createEducationalPost(data); sendSuccess(res, post, 201); } catch (e) { next(e); }
}
export async function updateEducationalPostHandler(req: Request, res: Response, next: NextFunction) {
  try { const data = updateEducationalPostSchema.parse(req.body) as any; const post = await editorialService.updateEducationalPost(req.params.id as string, data); sendSuccess(res, post); } catch (e) { next(e); }
}

// ── Books ──────────────────────────────────────────

export async function getBooksHandler(_req: Request, res: Response, next: NextFunction) {
  try { const books = await editorialService.getBooks(); sendSuccess(res, books); } catch (e) { next(e); }
}
export async function getBookHandler(req: Request, res: Response, next: NextFunction) {
  try { const book = await editorialService.getBookBySlug(req.params.slug as string); sendSuccess(res, book); } catch (e) { next(e); }
}
export async function createBookHandler(req: Request, res: Response, next: NextFunction) {
  try { const data = createBookSchema.parse(req.body) as any; const book = await editorialService.createBook(data); sendSuccess(res, book, 201); } catch (e) { next(e); }
}
export async function updateBookHandler(req: Request, res: Response, next: NextFunction) {
  try { const data = updateBookSchema.parse(req.body) as any; const book = await editorialService.updateBook(req.params.id as string, data); sendSuccess(res, book); } catch (e) { next(e); }
}

// ── Articles ───────────────────────────────────────

export async function getArticlesHandler(_req: Request, res: Response, next: NextFunction) {
  try { const articles = await editorialService.getArticles(); sendSuccess(res, articles); } catch (e) { next(e); }
}
export async function getArticleHandler(req: Request, res: Response, next: NextFunction) {
  try { const article = await editorialService.getArticleBySlug(req.params.slug as string); sendSuccess(res, article); } catch (e) { next(e); }
}
export async function createArticleHandler(req: Request, res: Response, next: NextFunction) {
  try { const data = createArticleSchema.parse(req.body) as any; const article = await editorialService.createArticle(data); sendSuccess(res, article, 201); } catch (e) { next(e); }
}
export async function updateArticleHandler(req: Request, res: Response, next: NextFunction) {
  try { const data = updateArticleSchema.parse(req.body) as any; const article = await editorialService.updateArticle(req.params.id as string, data); sendSuccess(res, article); } catch (e) { next(e); }
}

// ── Poems ──────────────────────────────────────────

export async function getPoemsHandler(_req: Request, res: Response, next: NextFunction) {
  try { const poems = await editorialService.getPoems(); sendSuccess(res, poems); } catch (e) { next(e); }
}
export async function getPoemHandler(req: Request, res: Response, next: NextFunction) {
  try { const poem = await editorialService.getPoemBySlug(req.params.slug as string); sendSuccess(res, poem); } catch (e) { next(e); }
}
export async function createPoemHandler(req: Request, res: Response, next: NextFunction) {
  try { const data = createPoemSchema.parse(req.body) as any; const poem = await editorialService.createPoem(data); sendSuccess(res, poem, 201); } catch (e) { next(e); }
}
export async function updatePoemHandler(req: Request, res: Response, next: NextFunction) {
  try { const data = updatePoemSchema.parse(req.body) as any; const poem = await editorialService.updatePoem(req.params.id as string, data); sendSuccess(res, poem); } catch (e) { next(e); }
}
