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

// clothes.service.ts
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
    bestseller
  } = params || {};

  let skip = offset || 0;
  if (page && !offset) {
    skip = (page - 1) * limit;
  }

  console.log('🔍 Service params:', { limit, offset, page, skip });

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
