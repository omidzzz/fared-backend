import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/response";
import { env } from "../../config/env";
import { createOrderSchema } from "./orders.schema";
import * as ordersService from "./orders.service";

export async function createOrderHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { paymentMethod, addressId, notes } = createOrderSchema.parse(req.body);
    const { order } = await ordersService.createOrder(req.user!.id, paymentMethod, addressId, notes);

    if (paymentMethod === "CARD_TO_CARD") {
      sendSuccess(res, {
        order,
        cardNumber: env.CARD_TO_CARD_NUMBER,
        cardOwner: env.CARD_OWNER_NAME,
      }, 201, "Order created. Please transfer the amount and upload the receipt.");
    } else {
      const paymentUrl = `${env.FRONTEND_PAYMENT_FAIL_URL}?stub=true&orderId=${order.id}`;
      sendSuccess(res, { order, paymentUrl }, 201, "Order created. Redirecting to payment gateway.");
    }
  } catch (e) { next(e); }
}

export async function getOrdersHandler(req: Request, res: Response, next: NextFunction) {
  try { const orders = await ordersService.getOrders(req.user!.id); sendSuccess(res, orders); } catch (e) { next(e); }
}

export async function getOrderByIdHandler(req: Request, res: Response, next: NextFunction) {
  try { const order = await ordersService.getOrderById(req.user!.id, req.params.id as string); sendSuccess(res, order); } catch (e) { next(e); }
}

export async function uploadReceiptHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const receipt = await ordersService.uploadReceipt(req.user!.id, req.params.id as string, req.file!);
    sendSuccess(res, receipt, 201, "Receipt uploaded. Awaiting admin confirmation.");
  } catch (e) { next(e); }
}
