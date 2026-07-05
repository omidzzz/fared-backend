import prisma from "../../config/database";
import { AppError } from "../../middleware/errorHandler";

export async function getProducts(filters: {
  page: number;
  limit: number;
  category?: string;
  featured?: string;
  bestseller?: string;
  search?: string;
}) {
  const { page, limit, category, featured, bestseller, search } = filters;

  const where: any = { isActive: true };
  if (category) where.category = { slug: category };
  if (featured === "true") where.isFeatured = true;
  if (bestseller === "true") where.isBestSeller = true;
  if (search) {
    where.OR = [
      { nameFA: { contains: search, mode: "insensitive" } },
      { nameEN: { contains: search, mode: "insensitive" } },
      { descriptionFA: { contains: search, mode: "insensitive" } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        category: true,
        _count: { select: { reviews: true } },
        variants: true,
        colorOptions: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total };
}

export async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      category: true,
      variants: true,
      colorOptions: true,
    },
    take: 20,
  });
}

export async function searchProducts(q: string) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { nameFA: { contains: q, mode: "insensitive" } },
        { nameEN: { contains: q, mode: "insensitive" } },
        { tagsFA: { hasSome: [q] } },
        { tagsEN: { hasSome: [q.toLowerCase()] } },
      ],
    },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      category: true,
      variants: true,
      colorOptions: true,
    },
    take: 20,
  });
}

export async function getProductsByCategory(cat: string) {
  return prisma.product.findMany({
    where: { isActive: true, category: { slug: cat } },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      category: true,
      _count: { select: { reviews: true } },
      variants: true,
      colorOptions: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      attributes: { orderBy: { sortOrder: "asc" } },
      variants: true,
      colorOptions: true,
      category: true,
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { id: true, nameFA: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) throw new AppError("Product not found", 404);

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

  return { ...product, avgRating };
}
