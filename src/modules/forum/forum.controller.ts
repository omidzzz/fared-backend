import { Request, Response, NextFunction } from "express";
import { sendSuccess, sendPaginated } from "../../utils/response";
import { parsePagination } from "../../utils/pagination";
import { createTopicSchema, createReplySchema } from "./forum.schema";
import * as forumService from "./forum.service";

export async function getTopicsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page, limit } = parsePagination(req.query as any);
    const { topics, total } = await forumService.getTopics(page, limit);
    sendPaginated(res, topics, total, page, limit, "topics");
  } catch (error) {
    next(error);
  }
}

export async function getTopicBySlugHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const topic = await forumService.getTopicBySlug(
      req.params.slug as string,
      req.user?.id
    );
    sendSuccess(res, topic);
  } catch (error) {
    next(error);
  }
}

export async function createTopicHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = createTopicSchema.parse(req.body);
    const topic = await forumService.createTopic(req.user!.id, data);
    sendSuccess(res, topic, 201, "Topic submitted. It will appear after admin approval.");
  } catch (error) {
    next(error);
  }
}

export async function createReplyHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = createReplySchema.parse(req.body);
    const reply = await forumService.createReply(
      req.user!.id,
      req.params.id as string,
      data
    );
    sendSuccess(res, reply, 201, "Reply submitted. It will appear after admin approval.");
  } catch (error) {
    next(error);
  }
}
