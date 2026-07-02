import { Request, Response, NextFunction } from "express";
import { sendSuccess, sendPaginated } from "../../utils/response";
import { parsePagination } from "../../utils/pagination";
import { queryProductSchema, searchProductSchema } from "./products.schema";
import * as productsService from "./products.service";

export async function getProductsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page, limit } = parsePagination(req.query as any);
    const filters = queryProductSchema.parse(req.query);
    const result = await productsService.getProducts({ page, limit, ...filters });
    sendPaginated(res, result.products, result.total, page, limit);
  } catch (error) {
    next(error);
  }
}

export async function getFeaturedHandler(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const products = await productsService.getFeaturedProducts();
    sendSuccess(res, products);
  } catch (error) {
    next(error);
  }
}

export async function searchHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { q } = searchProductSchema.parse(req.query);
    if (!q) {
      sendSuccess(res, []);
      return;
    }
    const products = await productsService.searchProducts(q);
    sendSuccess(res, products);
  } catch (error) {
    next(error);
  }
}

export async function getByCategoryHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const products = await productsService.getProductsByCategory(req.params.cat as string);
    sendSuccess(res, products);
  } catch (error) {
    next(error);
  }
}

export async function getProductByIdHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const product = await productsService.getProductById(req.params.id as string);
    sendSuccess(res, product);
  } catch (error) {
    next(error);
  }
}
