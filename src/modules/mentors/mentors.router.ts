import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import {
  getMentorsHandler, getMentorHandler, getAvailabilityHandler,
  bookSessionHandler, getUserSessionsHandler,
} from "./mentors.controller";

const router = Router();

router.get("/", getMentorsHandler);
router.get("/sessions/my", authenticate, getUserSessionsHandler);
router.get("/:id", getMentorHandler);
router.get("/:id/availability", getAvailabilityHandler);
router.post("/:id/book", authenticate, bookSessionHandler);

export default router;
