import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import {
  getCartHandler,
  addToCartHandler,
  updateCartItemHandler,
  removeCartItemHandler,
  clearCartHandler,
} from "./cart.controller";

const router = Router();

router.use(authenticate);

router.get("/", getCartHandler);
router.post("/add", addToCartHandler);
router.put("/update", updateCartItemHandler);
router.delete("/remove/:itemId", removeCartItemHandler);
router.delete("/clear", clearCartHandler);

export default router;
