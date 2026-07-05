import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/response";
import * as stonesService from "./stones.service";
import { queryStoneSchema } from "./stones.schema";

export async function getStonesHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = queryStoneSchema.parse(req.query);
    const result = await stonesService.getStones({
      page: query.page,
      limit: query.limit,
      search: query.search,
      featured: query.featured === "true",
      property: query.property,
    });
    sendSuccess(res, result);
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
