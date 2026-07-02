import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import {
  getNotificationsHandler,
  markReadHandler,
  markAllReadHandler,
} from "./notifications.controller";

const router = Router();

router.use(authenticate);

router.get("/", getNotificationsHandler);
router.patch("/:id/read", markReadHandler);
router.patch("/read-all", markAllReadHandler);

export default router;
