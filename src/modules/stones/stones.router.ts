import { Router } from "express";
import { getStonesHandler, getStoneBySlugHandler } from "./stones.controller";

const router = Router();

router.get("/", getStonesHandler);
router.get("/:slug", getStoneBySlugHandler);

export default router;
