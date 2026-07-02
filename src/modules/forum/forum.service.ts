import prisma from "../../config/database";
import { AppError } from "../../middleware/errorHandler";
import { generateSlug } from "../../utils/slug";
import { nanoid } from "nanoid";

export async function getTopics(page: number, limit: number) {
  const [topics, total] = await Promise.all([
    prisma.forumTopic.findMany({
      where: { isApproved: true },
      include: {
        author: { select: { id: true, nameFA: true, avatar: true } },
        _count: { select: { replies: true } },
      },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.forumTopic.count({ where: { isApproved: true } }),
  ]);
  return { topics, total };
}

export async function getTopicBySlug(slug: string, userId?: string) {
  const topic = await prisma.forumTopic.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, nameFA: true, avatar: true, name: true } },
      replies: {
        where: { isApproved: true },
        include: { author: { select: { id: true, nameFA: true, avatar: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!topic || (!topic.isApproved && topic.authorId !== userId)) {
    throw new AppError("Topic not found", 404);
  }

  // Increment view count asynchronously
  prisma.forumTopic
    .update({
      where: { id: topic.id },
      data: { viewCount: { increment: 1 } },
    })
    .catch(() => {});

  return topic;
}

export async function createTopic(
  userId: string,
  data: { titleFA: string; bodyFA: string; category: string; tags?: string[] }
) {
  const slug = `${generateSlug(data.titleFA)}-${nanoid(6)}`;

  return prisma.forumTopic.create({
    data: {
      slug,
      titleFA: data.titleFA,
      bodyFA: data.bodyFA,
      category: data.category,
      tags: data.tags ?? [],
      authorId: userId,
      isApproved: false,
    },
  });
}

export async function createReply(
  userId: string,
  topicId: string,
  data: { bodyFA: string; bodyEN?: string }
) {
  const topic = await prisma.forumTopic.findUnique({ where: { id: topicId } });
  if (!topic) throw new AppError("Topic not found", 404);
  if (!topic.isApproved) throw new AppError("Cannot reply to a topic that is not yet approved", 400);
  if (topic.isLocked) throw new AppError("This topic is locked", 400);

  return prisma.forumReply.create({
    data: {
      topicId,
      authorId: userId,
      bodyFA: data.bodyFA,
      bodyEN: data.bodyEN ?? null,
      isApproved: false,
    },
  });
}
