import { Router } from "express";
import { authenticate, optionalAuth } from "../../middleware/auth";
import {
  getCoursesHandler, getCourseBySlugHandler,
  getCurriculumHandler, enrollHandler,
} from "./courses.controller";

const router = Router();

router.get("/", getCoursesHandler);
router.get("/:slug", getCourseBySlugHandler);
router.get("/:id/curriculum", optionalAuth, getCurriculumHandler);
router.post("/:id/enroll", authenticate, enrollHandler);

export default router;
