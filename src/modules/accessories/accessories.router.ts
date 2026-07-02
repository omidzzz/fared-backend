import { Router } from "express";
import { getAccessoriesHandler, getAccessoryBySlugHandler } from "./accessories.controller";

const router = Router();

router.get("/", getAccessoriesHandler);
router.get("/:slug", getAccessoryBySlugHandler);

export default router;
