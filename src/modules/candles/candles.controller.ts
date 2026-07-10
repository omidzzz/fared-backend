import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/response";
import * as candlesService from "./candles.service";
import { queryCandleSchema } from "./candles.schema";

export async function getCandlesHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = queryCandleSchema.parse(req.query);
    const result = await candlesService.getCandles({
      page: query.page,
      limit: query.limit,
      search: query.search,
      featured: query.featured === "true",
    });
    sendSuccess(res, result);
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
