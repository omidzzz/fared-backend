import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/response";
import { bookSessionSchema } from "./mentors.schema";
import * as mentorsService from "./mentors.service";

export async function getMentorsHandler(_req: Request, res: Response, next: NextFunction) {
  try { const mentors = await mentorsService.getMentors(); sendSuccess(res, mentors); } catch (e) { next(e); }
}
export async function getMentorHandler(req: Request, res: Response, next: NextFunction) {
  try { const mentor = await mentorsService.getMentorById(req.params.id as string); sendSuccess(res, mentor); } catch (e) { next(e); }
}
export async function getAvailabilityHandler(req: Request, res: Response, next: NextFunction) {
  try { const result = await mentorsService.getMentorAvailability(req.params.id as string); sendSuccess(res, result); } catch (e) { next(e); }
}
export async function bookSessionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { notes } = bookSessionSchema.parse(req.body);
    const order = await mentorsService.bookSession(req.user!.id, req.params.id as string, notes);
    sendSuccess(res, { order }, 201, "Session booking order created. Complete payment to confirm.");
  } catch (e) { next(e); }
}
export async function getUserSessionsHandler(req: Request, res: Response, next: NextFunction) {
  try { const sessions = await mentorsService.getUserSessions(req.user!.id); sendSuccess(res, sessions); } catch (e) { next(e); }
}
