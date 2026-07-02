import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/response";
import * as stonesService from "./stones.service";

export async function getStonesHandler(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const products = await stonesService.getStones();
    sendSuccess(res, products);
  } catch (error) {
    next(error);
  }
}

export async function getStoneBySlugHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const product = await stonesService.getStoneBySlug(req.params.slug as string);
    if (!product) {
      sendSuccess(res, null, 404, "Stone not found");
      return;
    }
    sendSuccess(res, product);
  } catch (error) {
    next(error);
  }
}
