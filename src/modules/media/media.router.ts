import { Router } from "express";
import { authenticate, requireAdmin } from "../../middleware/auth";
import { uploadSingle } from "../../middleware/upload";
import { uploadMediaHandler, deleteMediaHandler } from "./media.controller";

const router = Router();

router.use(authenticate, requireAdmin);

router.post("/upload", uploadSingle, uploadMediaHandler);
router.delete("/:id", deleteMediaHandler);

export default router;
