import prisma from "../../config/database";
import { AppError } from "../../middleware/errorHandler";
import { generateSlug } from "../../utils/slug";

// ── Educational Posts ───────────────────────────────

export async function getEducationalPosts() {
  return prisma.educationalPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getEducationalPostBySlug(slug: string) {
  const post = await prisma.educationalPost.findUnique({ where: { slug } });
  if (!post) throw new AppError("Post not found", 404);
  return {
    ...post,
    titleFA: post.titleFA,
    categoryFA: post.categoryFA,
    bodyFA: post.bodyFA,
    excerptFA: post.excerptFA,
    tagsFA: post.tagsFA,
    published: post.isPublished,
  };
}

export async function createEducationalPost(data: any) {
  return prisma.educationalPost.create({
    data: { ...data, slug: data.slug || generateSlug(data.titleFA) },
  });
}

export async function updateEducationalPost(id: string, data: any) {
  return prisma.educationalPost.update({ where: { id }, data });
}

// ── Books ──────────────────────────────────────────

export async function getBooks() {
  return prisma.book.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBookBySlug(slug: string) {
  const book = await prisma.book.findUnique({ where: { slug } });
  if (!book) throw new AppError("Book not found", 404);
  return {
    ...book,
    titleFA: book.titleFA,
    authorFA: book.authorFA,
    descriptionFA: book.descriptionFA,
    categoryFA: book.categoryFA,
    image: book.coverImage,
    published: book.isPublished,
  };
}

export async function createBook(data: any) {
  return prisma.book.create({
    data: { ...data, slug: data.slug || generateSlug(data.titleFA) },
  });
}

export async function updateBook(id: string, data: any) {
  return prisma.book.update({ where: { id }, data });
}

// ── Articles ───────────────────────────────────────

export async function getArticles() {
  return prisma.article.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getArticleBySlug(slug: string) {
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article) throw new AppError("Article not found", 404);
  return {
    ...article,
    titleFA: article.titleFA,
    categoryFA: article.categoryFA,
    excerptFA: article.excerptFA,
    bodyFA: article.bodyFA,
    authorFA: article.authorFA,
    published: article.isPublished,
  };
}

export async function createArticle(data: any) {
  return prisma.article.create({
    data: { ...data, slug: data.slug || generateSlug(data.titleFA) },
  });
}

export async function updateArticle(id: string, data: any) {
  return prisma.article.update({ where: { id }, data });
}

// ── Poems ──────────────────────────────────────────

export async function getPoems() {
  return prisma.poem.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPoemBySlug(slug: string) {
  const poem = await prisma.poem.findUnique({ where: { slug } });
  if (!poem) throw new AppError("Poem not found", 404);
  return {
    ...poem,
    titleFA: poem.titleFA,
    poetFA: poem.poetFA,
    linesFA: poem.linesFA,
    theme: poem.theme,
    backgroundGradient: poem.backgroundGradient,
    published: poem.isPublished,
  };
}

export async function createPoem(data: any) {
  return prisma.poem.create({
    data: { ...data, slug: data.slug || generateSlug(data.titleFA) },
  });
}

export async function updatePoem(id: string, data: any) {
  return prisma.poem.update({ where: { id }, data });
}
