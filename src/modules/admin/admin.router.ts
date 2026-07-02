import { Router } from "express";
import { authenticate, requireAdmin } from "../../middleware/auth";
import {
  getStatsHandler, getAdminOrdersHandler, updateOrderStatusHandler,
  getReceiptsHandler, approveReceiptHandler, rejectReceiptHandler,
  getEnquiriesHandler, updateEnquiryStatusHandler,
  getPendingCommentsHandler, approveCommentHandler, replyToCommentHandler,
  getPendingForumHandler, approveTopicHandler, approveReplyHandler,
  getUsersHandler, createProductHandler, updateProductHandler, deleteProductHandler,
  scheduleSessionHandler,
} from "./admin.controller";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/stats", getStatsHandler);
router.get("/orders", getAdminOrdersHandler);
router.put("/orders/:id/status", updateOrderStatusHandler);
router.get("/receipts", getReceiptsHandler);
router.put("/receipts/:id/approve", approveReceiptHandler);
router.put("/receipts/:id/reject", rejectReceiptHandler);
router.get("/enquiries", getEnquiriesHandler);
router.put("/enquiries/:id/status", updateEnquiryStatusHandler);
router.get("/comments", getPendingCommentsHandler);
router.put("/comments/:id/approve", approveCommentHandler);
router.post("/comments/:id/reply", replyToCommentHandler);
router.get("/forum", getPendingForumHandler);
router.put("/forum/topics/:id/approve", approveTopicHandler);
router.put("/forum/replies/:id/approve", approveReplyHandler);
router.get("/users", getUsersHandler);
router.post("/products", createProductHandler);
router.put("/products/:id", updateProductHandler);
router.delete("/products/:id", deleteProductHandler);
router.patch("/mentorship/sessions/:id/schedule", scheduleSessionHandler);

export default router;
