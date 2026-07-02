import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { optionalAuth } from "../../middleware/auth";
import {
  getTopicsHandler,
  getTopicBySlugHandler,
  createTopicHandler,
  createReplyHandler,
} from "./forum.controller";

const router = Router();

router.get("/topics", getTopicsHandler);
router.get("/topics/:slug", optionalAuth, getTopicBySlugHandler);
router.post("/topics", authenticate, createTopicHandler);
router.post("/topics/:id/replies", authenticate, createReplyHandler);

export default router;
