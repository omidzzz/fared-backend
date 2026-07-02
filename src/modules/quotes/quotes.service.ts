import prisma from "../../config/database";
import { AppError } from "../../middleware/errorHandler";

export async function getTodayQuote() {
  const now = new Date();
  const today = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tehran" }));
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const scheduled = await prisma.quote.findFirst({
    where: {
      scheduledDate: { gte: today, lt: tomorrow },
      isActive: true,
    },
  });

  if (scheduled) return scheduled;

  const random: any[] = await prisma.$queryRaw`
    SELECT * FROM "Quote"
    WHERE "isActive" = true
      AND "scheduledDate" IS NULL
    ORDER BY RANDOM()
    LIMIT 1
  `;

  return random[0] ?? null;
}

export async function getAllQuotes() {
  return prisma.quote.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createQuote(data: {
  textFA: string;
  textEN?: string;
  sourceFA: string;
  sourceEN?: string;
  scheduledDate?: string;
  isActive?: boolean;
}) {
  return prisma.quote.create({
    data: {
      textFA: data.textFA,
      textEN: data.textEN ?? null,
      sourceFA: data.sourceFA,
      sourceEN: data.sourceEN ?? null,
      scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
      isActive: data.isActive ?? true,
    },
  });
}

export async function updateQuote(
  id: string,
  data: Record<string, unknown> & { scheduledDate?: string }
) {
  return prisma.quote.update({
    where: { id },
    data: {
      ...data,
      ...(data.scheduledDate !== undefined
        ? { scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null }
        : {}),
    },
  });
}
