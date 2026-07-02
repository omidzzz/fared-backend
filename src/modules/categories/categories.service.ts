import prisma from "../../config/database";

export async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true, courses: true, tours: true } } },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: { _count: { select: { products: true, courses: true, tours: true } } },
  });
}

export async function createCategory(data: any) {
  return prisma.category.create({ data });
}

export async function updateCategory(id: string, data: any) {
  return prisma.category.update({ where: { id }, data });
}

export async function toggleCategoryActive(id: string) {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return null;

  return prisma.category.update({
    where: { id },
    data: { isActive: !existing.isActive },
  });
}
