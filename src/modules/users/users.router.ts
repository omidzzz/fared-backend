import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { upload } from "../../middleware/upload";
import {
  getProfileHandler,
  updateProfileHandler,
  updateAvatarHandler,
  deleteAvatarHandler,
} from "./users.controller";

const router = Router();

// All routes require authentication
router.get("/profile", authenticate, getProfileHandler);
router.put("/profile", authenticate, updateProfileHandler);
router.post("/avatar", authenticate, upload.single("avatar"), updateAvatarHandler);
router.delete("/avatar", authenticate, deleteAvatarHandler);

export default router;
