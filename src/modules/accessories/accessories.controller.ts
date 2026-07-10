import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/response";
import * as accessoriesService from "./accessories.service";
import { queryAccessorySchema } from "./accessories.schema";

export async function getAccessoriesHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = queryAccessorySchema.parse(req.query);
    const result = await accessoriesService.getAccessories({
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
