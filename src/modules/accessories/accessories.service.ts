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
  return {
    ...rest,
    images: (images || []).map((img: any) => ({
      id: img.id,
      url: img.url,
      altFA: img.altFA || "",
      sortOrder: img.sortOrder || 0,
    })),
    attributes: groupAttributes(product),
    isFeatured: product.isFeatured ?? false,
    isBestSeller: product.isBestSeller ?? false,
  };
}

export async function getAccessories(filters?: {
  page?: number;
  limit?: number;
  search?: string;
  featured?: boolean;
  property?: string;
}) {
  const where: any = { type: "accessories", isActive: true };

  if (filters?.search) {
    where.OR = [
      { nameEN: { contains: filters.search, mode: "insensitive" } },
      { nameFA: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters?.featured !== undefined) {
    where.isFeatured = filters.featured;
  }

  if (filters?.property) {
    where.attributes = {
      some: {
        key: "tagsEN",
        valueEN: { contains: filters.property, mode: "insensitive" },
      },
    };
  }

  const page = filters?.page || 1;
  const limit = filters?.limit || 12;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        attributes: { orderBy: { sortOrder: "asc" } },
        category: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map(formatProduct),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getAccessoryBySlug(slugOrId: string) {
  const product = await prisma.product.findFirst({
    where: {
      type: "accessories",
      isActive: true,
      OR: [
        { slug: slugOrId },
        { id: slugOrId },
      ],
    },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      attributes: { orderBy: { sortOrder: "asc" } },
      category: true,
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { id: true, nameFA: true, avatar: true } } },
      },
    },
  });
  return product ? formatProduct(product) : null;
}