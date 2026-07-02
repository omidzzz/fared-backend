import { Router } from "express";
import { getCandlesHandler, getCandleBySlugHandler } from "./candles.controller";

const router = Router();

router.get("/", getCandlesHandler);
router.get("/:slug", getCandleBySlugHandler);

export default router;
