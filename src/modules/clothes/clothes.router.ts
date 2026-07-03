// clothes.routes.ts
import { Router } from "express";
import {
  getClothesHandler,
  getClothesBySlugHandler,
} from "./clothes.controller";

const router = Router();

// This will handle pagination when query params are present
router.get("/", getClothesHandler);
router.get("/:slug", getClothesBySlugHandler);

export default router;
