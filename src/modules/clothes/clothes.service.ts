// clothes.service.ts
import prisma from "../../config/database";

function groupAttributes(product: any) {
  const attrs: Record<string, any> = {};
  for (const attr of product.attributes || []) {
    attrs[attr.key] = { valueFA: attr.valueFA, valueEN: attr.valueEN };
  }
  return attrs;
}

function formatProduct(product: any) {
  const { attributes, ...rest } = product;
  return { ...rest, attributes: groupAttributes(product) };
}

export async function getClothes(params?: {
  page?: number;
  offset?: number;
  limit?: number;
  search?: string;
  featured?: string;
  bestseller?: string;
}) {
  const {
    page,
    offset,
    limit = 12,
    search,
    featured,
    bestseller,
  } = params || {};

  // Calculate offset from page if provided
  let skip = offset || 0;
  if (page && !offset) {
    skip = (page - 1) * limit;
  }

  // Build where clause
  const where: any = {
    type: "clothes",
    isActive: true,
  };

  // Add search filter
  if (search) {
    where.OR = [
      { nameFA: { contains: search, mode: "insensitive" } },
      { nameEN: { contains: search, mode: "insensitive" } },
      { descriptionFA: { contains: search, mode: "insensitive" } },
      { descriptionEN: { contains: search, mode: "insensitive" } },
    ];
  }

  // Add featured filter
  if (featured === "true") {
    where.isFeatured = true;
  }

  // Add bestseller filter
  if (bestseller === "true") {
    where.isBestSeller = true;
  }

  // Get products and total count in parallel
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: skip,
      take: limit,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        attributes: { orderBy: { sortOrder: "asc" } },
        variants: true,
        colorOptions: true,
        category: true,
        _count: { select: { reviews: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map(formatProduct),
    total, // ✅ Return total count
    pagination: {
      limit,
      offset: skip,
      page: page || Math.floor(skip / limit) + 1,
      total,
      hasMore: products.length < total,
    },
  };
}

export async function getClothesBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, type: "clothes", isActive: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      attributes: { orderBy: { sortOrder: "asc" } },
      variants: true,
      colorOptions: true,
      category: true,
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { id: true, nameFA: true, avatar: true } } },
      },
    },
  });
  return product ? formatProduct(product) : null;
}
