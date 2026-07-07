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
  getProductsHandler, getProductByIdHandler,
  getOrderByIdHandler,
  getMessagesHandler, getMessageByIdHandler, markMessageAsReadHandler,
  getArticlesHandler, getArticleByIdHandler, createArticleHandler, updateArticleHandler, deleteArticleHandler,
  getBooksHandler, getBookByIdHandler, createBookHandler, updateBookHandler, deleteBookHandler,
  getPoemsHandler, getPoemByIdHandler, createPoemHandler, updatePoemHandler, deletePoemHandler,
  getEducationalPostsHandler, getEducationalPostByIdHandler, createEducationalPostHandler, updateEducationalPostHandler, deleteEducationalPostHandler,
} from "./admin.controller";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/stats", getStatsHandler);
router.get("/orders", getAdminOrdersHandler);
router.get("/orders/:id", getOrderByIdHandler);
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
router.get("/products", getProductsHandler);
router.get("/products/:id", getProductByIdHandler);
router.post("/products", createProductHandler);
router.put("/products/:id", updateProductHandler);
router.delete("/products/:id", deleteProductHandler);
router.patch("/mentorship/sessions/:id/schedule", scheduleSessionHandler);
router.get("/messages", getMessagesHandler);
router.get("/messages/:id", getMessageByIdHandler);
router.put("/messages/:id/read", markMessageAsReadHandler);

// ── CMS ─────────────────────────────────────────────
router.get("/articles", getArticlesHandler);
router.get("/articles/:id", getArticleByIdHandler);
router.post("/articles", createArticleHandler);
router.put("/articles/:id", updateArticleHandler);
router.delete("/articles/:id", deleteArticleHandler);

router.get("/books", getBooksHandler);
router.get("/books/:id", getBookByIdHandler);
router.post("/books", createBookHandler);
router.put("/books/:id", updateBookHandler);
router.delete("/books/:id", deleteBookHandler);

router.get("/poems", getPoemsHandler);
router.get("/poems/:id", getPoemByIdHandler);
router.post("/poems", createPoemHandler);
router.put("/poems/:id", updatePoemHandler);
router.delete("/poems/:id", deletePoemHandler);

router.get("/educational", getEducationalPostsHandler);
router.get("/educational/:id", getEducationalPostByIdHandler);
router.post("/educational", createEducationalPostHandler);
router.put("/educational/:id", updateEducationalPostHandler);
router.delete("/educational/:id", deleteEducationalPostHandler);

export default router;