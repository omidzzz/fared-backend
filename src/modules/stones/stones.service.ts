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

export async function getStones() {
  const products = await prisma.product.findMany({
    where: { type: "stones", isActive: true },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      attributes: { orderBy: { sortOrder: "asc" } },
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return products.map(formatProduct);
}

export async function getStoneBySlug(slugOrId: string) {
  const product = await prisma.product.findFirst({
    where: {
      type: "stones",
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
