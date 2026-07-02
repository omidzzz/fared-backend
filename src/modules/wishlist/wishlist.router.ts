import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import {
  getWishlistHandler,
  addToWishlistHandler,
  removeFromWishlistHandler,
} from "./wishlist.controller";

const router = Router();

router.use(authenticate);

router.get("/", getWishlistHandler);
router.post("/add", addToWishlistHandler);
router.delete("/remove/:productId", removeFromWishlistHandler);

export default router;
