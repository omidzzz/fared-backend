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

export async function getStones(filters?: { page?: number; limit?: number; search?: string; featured?: boolean; property?: string; }) {
  const where: any = { type: "stones", isActive: true };

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

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        attributes: { orderBy: { sortOrder: "asc" } },
        category: true,
      },
      orderBy: { createdAt: "desc" },
      skip: ((filters?.page || 1) - 1) * (filters?.limit || 12),
      take: filters?.limit || 12,
    }),
    prisma.product.count({ where }),
  ]);

  console.log('🔍 Backend Stones Query:', {
    where,
    total,
    count: products.length,
    sampleTypes: products.slice(0, 3).map(p => ({ id: p.id, type: p.type, isActive: p.isActive, name: p.nameFA }))
  });

  return {
    products: products.map(formatProduct),
    total,
    page: filters?.page || 1,
    limit: filters?.limit || 12,
    totalPages: Math.ceil(total / (filters?.limit || 12)),
  };
}

