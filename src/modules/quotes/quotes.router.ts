import { Router } from "express";
import { authenticate, requireAdmin } from "../../middleware/auth";
import {
  getTodayQuoteHandler,
  getAllQuotesHandler,
  createQuoteHandler,
  updateQuoteHandler,
} from "./quotes.controller";

const router = Router();

router.get("/today", getTodayQuoteHandler);
router.get("/", authenticate, requireAdmin, getAllQuotesHandler);
router.post("/", authenticate, requireAdmin, createQuoteHandler);
router.put("/:id", authenticate, requireAdmin, updateQuoteHandler);

export default router;
