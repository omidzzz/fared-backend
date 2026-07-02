import prisma from "../../config/database";
import { AppError } from "../../middleware/errorHandler";

export async function getTours() {
  return prisma.tour.findMany({
    where: { isActive: true },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      category: true,
      _count: { select: { enquiries: true } },
    },
    orderBy: { startDate: "asc" },
  });
}

export async function getTourBySlug(slug: string) {
  const tour = await prisma.tour.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      itinerary: { orderBy: { day: "asc" } },
      category: true,
    },
  });
  if (!tour) throw new AppError("Tour not found", 404);
  return tour;
}

export async function submitEnquiry(data: {
  fullName: string;
  email: string;
  phone?: string;
  tourId: string;
  arrivalDate?: string;
  message?: string;
}) {
  const tour = await prisma.tour.findUnique({ where: { id: data.tourId } });
  if (!tour) throw new AppError("Tour not found", 404);

  return prisma.tourEnquiry.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone ?? null,
      tourId: data.tourId,
      arrivalDate: data.arrivalDate ? new Date(data.arrivalDate) : null,
      message: data.message ?? null,
    },
  });
}
