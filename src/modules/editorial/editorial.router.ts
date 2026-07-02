import { Router } from "express";
import { authenticate, requireAdmin } from "../../middleware/auth";
import {
  getEducationalPostsHandler, getEducationalPostHandler,
  createEducationalPostHandler, updateEducationalPostHandler,
  getBooksHandler, getBookHandler, createBookHandler, updateBookHandler,
  getArticlesHandler, getArticleHandler, createArticleHandler, updateArticleHandler,
  getPoemsHandler, getPoemHandler, createPoemHandler, updatePoemHandler,
} from "./editorial.controller";

const router = Router();

router.get("/educational", getEducationalPostsHandler);
router.get("/educational/:slug", getEducationalPostHandler);
router.post("/educational", authenticate, requireAdmin, createEducationalPostHandler);
router.put("/educational/:id", authenticate, requireAdmin, updateEducationalPostHandler);

router.get("/books", getBooksHandler);
router.get("/books/:slug", getBookHandler);
router.post("/books", authenticate, requireAdmin, createBookHandler);
router.put("/books/:id", authenticate, requireAdmin, updateBookHandler);

router.get("/articles", getArticlesHandler);
router.get("/articles/:slug", getArticleHandler);
router.post("/articles", authenticate, requireAdmin, createArticleHandler);
router.put("/articles/:id", authenticate, requireAdmin, updateArticleHandler);

router.get("/poems", getPoemsHandler);
router.get("/poems/:slug", getPoemHandler);
router.post("/poems", authenticate, requireAdmin, createPoemHandler);
router.put("/poems/:id", authenticate, requireAdmin, updatePoemHandler);

export default router;
