import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/response";
import * as accessoriesService from "./accessories.service";

export async function getAccessoriesHandler(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const products = await accessoriesService.getAccessories();
    sendSuccess(res, products);
  } catch (error) {
    next(error);
  }
}

export async function getAccessoryBySlugHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const product = await accessoriesService.getAccessoryBySlug(req.params.slug as string);
    if (!product) {
      sendSuccess(res, null, 404, "Accessory not found");
      return;
    }
    sendSuccess(res, product);
  } catch (error) {
    next(error);
  }
}
