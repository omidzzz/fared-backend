import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/response";
import * as candlesService from "./candles.service";

export async function getCandlesHandler(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const products = await candlesService.getCandles();
    sendSuccess(res, products);
  } catch (error) {
    next(error);
  }
}

export async function getCandleBySlugHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const product = await candlesService.getCandleBySlug(req.params.slug as string);
    if (!product) {
      sendSuccess(res, null, 404, "Candle not found");
      return;
    }
    sendSuccess(res, product);
  } catch (error) {
    next(error);
  }
}
