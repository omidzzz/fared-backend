import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/response";
import * as clothesService from "./clothes.service";

export async function getClothesHandler(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const products = await clothesService.getClothes();
    sendSuccess(res, products);
  } catch (error) {
    next(error);
  }
}

export async function getClothesBySlugHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const product = await clothesService.getClothesBySlug(req.params.slug as string);
    if (!product) {
      sendSuccess(res, null, 404, "Clothes item not found");
      return;
    }
    sendSuccess(res, product);
  } catch (error) {
    next(error);
  }
}
