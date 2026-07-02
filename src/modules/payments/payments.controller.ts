import { Request, Response, NextFunction } from "express";
import { paymentCallbackQuerySchema } from "./payments.schema";
import * as paymentsService from "./payments.service";

export async function callbackHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, authority, orderId } = paymentCallbackQuerySchema.parse(req.query);
    const { redirectUrl } = paymentsService.handleCallback(status, authority, orderId);
    res.redirect(redirectUrl);
  } catch (e) {
    next(e);
  }
}
