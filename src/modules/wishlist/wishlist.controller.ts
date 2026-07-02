import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/response";
import { addToWishlistSchema } from "./wishlist.schema";
import * as wishlistService from "./wishlist.service";

export async function getWishlistHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const items = await wishlistService.getWishlist(req.user!.id);
    sendSuccess(res, items);
  } catch (error) {
    next(error);
  }
}

export async function addToWishlistHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { productId, courseId } = addToWishlistSchema.parse(req.body);
    const item = await wishlistService.addToWishlist(req.user!.id, productId, courseId);
    sendSuccess(res, item, 201, "Added to wishlist");
  } catch (error) {
    next(error);
  }
}

export async function removeFromWishlistHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await wishlistService.removeFromWishlist(req.user!.id, req.params.productId as string);
    sendSuccess(res, null, 200, "Removed from wishlist");
  } catch (error) {
    next(error);
  }
}
