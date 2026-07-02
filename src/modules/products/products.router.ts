import { Router } from "express";
import {
  getProductsHandler,
  getFeaturedHandler,
  searchHandler,
  getByCategoryHandler,
  getProductByIdHandler,
} from "./products.controller";

const router = Router();

router.get("/", getProductsHandler);
router.get("/featured", getFeaturedHandler);
router.get("/search", searchHandler);
router.get("/category/:cat", getByCategoryHandler);
router.get("/:id", getProductByIdHandler);

export default router;
