import { Router } from "express";
import { authenticate, requireAdmin } from "../../middleware/auth";
import {
  getCategoriesHandler,
  getCategoryBySlugHandler,
  createCategoryHandler,
  updateCategoryHandler,
  toggleCategoryHandler,
} from "./categories.controller";

const router = Router();

router.get("/", getCategoriesHandler);
router.get("/:slug", getCategoryBySlugHandler);
router.post("/", authenticate, requireAdmin, createCategoryHandler);
router.put("/:id", authenticate, requireAdmin, updateCategoryHandler);
router.patch("/:id/toggle", authenticate, requireAdmin, toggleCategoryHandler);

export default router;
