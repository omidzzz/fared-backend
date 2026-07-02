import { Router } from "express";
import multer from "multer";
import { authenticate } from "../../middleware/auth";
import {
  createOrderHandler, getOrdersHandler,
  getOrderByIdHandler, uploadReceiptHandler,
} from "./orders.controller";

const router = Router();
const receiptUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.use(authenticate);

router.post("/", createOrderHandler);
router.get("/", getOrdersHandler);
router.get("/:id", getOrderByIdHandler);
router.post("/:id/receipt", receiptUpload.single("receipt"), uploadReceiptHandler);

export default router;
