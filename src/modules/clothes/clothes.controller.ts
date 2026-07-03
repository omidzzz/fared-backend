// clothes.controller.ts
import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/response";
import * as clothesService from "./clothes.service";
import { queryClothesSchema } from "./clothes.schema";

export async function getClothesHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Parse and validate query parameters
    const query = queryClothesSchema.parse(req.query);

    // Get products with pagination
    const result = await clothesService.getClothes({
      page: query.page,
      offset: query.offset,
      limit: query.limit,
      search: query.search,
      featured: query.featured,
      bestseller: query.bestseller,
    });

    // Return with pagination info
    sendSuccess(res, {
      products: result.products,
      count: result.total,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function getClothesBySlugHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const product = await clothesService.getClothesBySlug(
      req.params.slug as string,
    );
    if (!product) {
      sendSuccess(res, null, 404, "Clothes item not found");
      return;
    }
    sendSuccess(res, product);
  } catch (error) {
    next(error);
  }
}
