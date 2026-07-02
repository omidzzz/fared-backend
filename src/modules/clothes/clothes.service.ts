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

export async function getClothes() {
  const products = await prisma.product.findMany({
    where: { type: "clothes", isActive: true },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      attributes: { orderBy: { sortOrder: "asc" } },
      variants: true,
      colorOptions: true,
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return products.map(formatProduct);
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
