import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/response";
import { createCategorySchema, updateCategorySchema } from "./categories.schema";
import * as categoriesService from "./categories.service";

export async function getCategoriesHandler(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const categories = await categoriesService.getCategories();
    sendSuccess(res, categories);
  } catch (error) {
    next(error);
  }
}

export async function getCategoryBySlugHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const category = await categoriesService.getCategoryBySlug(req.params.slug as string);
    if (!category) {
      sendSuccess(res, null, 404, "Category not found");
      return;
    }
    sendSuccess(res, category);
  } catch (error) {
    next(error);
  }
}

export async function createCategoryHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = createCategorySchema.parse(req.body) as any;
    const category = await categoriesService.createCategory(data);
    sendSuccess(res, category, 201);
  } catch (error) {
    next(error);
  }
}

export async function updateCategoryHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = updateCategorySchema.parse(req.body) as any;
    const category = await categoriesService.updateCategory(req.params.id as string, data);
    sendSuccess(res, category);
  } catch (error) {
    next(error);
  }
}

export async function toggleCategoryHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const category = await categoriesService.toggleCategoryActive(req.params.id as string);
    if (!category) {
      sendSuccess(res, null, 404, "Category not found");
      return;
    }
    sendSuccess(res, category);
  } catch (error) {
    next(error);
  }
}
