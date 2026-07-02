import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/response";
import * as coursesService from "./courses.service";

export async function getCoursesHandler(_req: Request, res: Response, next: NextFunction) {
  try { const courses = await coursesService.getCourses(); sendSuccess(res, courses); } catch (e) { next(e); }
}
export async function getCourseBySlugHandler(req: Request, res: Response, next: NextFunction) {
  try { const course = await coursesService.getCourseBySlug(req.params.slug as string); sendSuccess(res, course); } catch (e) { next(e); }
}
export async function getCurriculumHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const lessons = await coursesService.getCurriculum(req.params.id as string, req.user?.id);
    sendSuccess(res, lessons);
  } catch (e) { next(e); }
}
export async function enrollHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await coursesService.enrollUser(req.user!.id, req.params.id as string);
    sendSuccess(res, { order }, 201, "Enrollment order created. Complete payment to access the course.");
  } catch (e) { next(e); }
}
