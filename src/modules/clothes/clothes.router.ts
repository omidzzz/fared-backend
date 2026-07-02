import { Router } from "express";
import { getClothesHandler, getClothesBySlugHandler } from "./clothes.controller";

const router = Router();

router.get("/", getClothesHandler);
router.get("/:slug", getClothesBySlugHandler);

export default router;
