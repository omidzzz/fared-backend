import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import {
  getProductReviewsHandler,
  postProductReviewHandler,
  getCourseReviewsHandler,
  postCourseReviewHandler,
  getCommentsHandler,
  postCommentHandler,
} from "./reviews.controller";

const router = Router();

// Legacy routes
router.get("/products/:productId", getProductReviewsHandler);
router.post("/products/:productId", authenticate, postProductReviewHandler);
router.get("/courses/:courseId", getCourseReviewsHandler);
router.post("/courses/:courseId", authenticate, postCourseReviewHandler);

// New spec-compliant routes
router.get("/:id/comments", getCommentsHandler);
router.post("/:id/comments", authenticate, postCommentHandler);

export default router;
