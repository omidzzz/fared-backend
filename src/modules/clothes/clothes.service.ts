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
  const { attributes, images, ...rest } = product;
  // Ensure variants and colorOptions are preserved
  return { 
    ...rest, 
    images: (images || []).map((img: any) => ({
      id: img.id,
      url: img.url,
      altFA: img.altFA || "",
      sortOrder: img.sortOrder || 0,
    })),
    attributes: groupAttributes(product),
    variants: product.variants || [],
    colorOptions: product.colorOptions || [],
    isFeatured: product.isFeatured ?? false,
    isBestSeller: product.isBestSeller ?? false,
  };
}

export async function getClothes(params?: {
  limit?: number;
  offset?: number;
  page?: number;
  search?: string;
  featured?: string;
  bestseller?: string;
}) {
  const {
    limit = 12,
    offset,
    page,
    search,
    featured,
    bestseller,
  } = params || {};

  // Calculate skip from offset or page
  let skip = offset || 0;
  if (page && !offset) {
    skip = (page - 1) * limit;
  }

  // Build where clause
  const where: any = {
    type: "clothes",
    isActive: true,
  };

  if (search) {
    where.OR = [
      { nameFA: { contains: search, mode: "insensitive" } },
      { nameEN: { contains: search, mode: "insensitive" } },
      { descriptionFA: { contains: search, mode: "insensitive" } },
      { descriptionEN: { contains: search, mode: "insensitive" } },
    ];
  }

  if (featured === "true") {
    where.isFeatured = true;
  }

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
    total,
    pagination: {
      limit,
      offset: skip,
      page: page || Math.floor(skip / limit) + 1,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + products.length < total,
    },
  };
}

export async function getClothesBySlug(slugOrId: string) {
  // Try by slug first, then by id as fallback
  const product = await prisma.product.findFirst({
    where: {
      type: "clothes",
      isActive: true,
      OR: [
        { slug: slugOrId },
        { id: slugOrId },
      ],
    },
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
