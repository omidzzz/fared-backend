import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/response";
import { addToCartSchema, updateCartItemSchema } from "./cart.schema";
import * as cartService from "./cart.service";

export async function getCartHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const cart = await cartService.getCart(req.user!.id);
    sendSuccess(res, cart);
  } catch (error) {
    next(error);
  }
}

export async function addToCartHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = addToCartSchema.parse(req.body);
    const item = await cartService.addToCart(req.user!.id, data);
    const isNew = !req.body.itemId; // simplified
    sendSuccess(res, item, isNew ? 201 : 200, isNew ? "Added to cart" : "Cart updated");
  } catch (error) {
    next(error);
  }
}

export async function updateCartItemHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { itemId, quantity } = updateCartItemSchema.parse(req.body);
    const updated = await cartService.updateCartItem(req.user!.id, itemId, quantity);
    if (!updated) {
      sendSuccess(res, null, 200, "Item removed from cart");
      return;
    }
    sendSuccess(res, updated, 200, "Cart updated");
  } catch (error) {
    next(error);
  }
}

export async function removeCartItemHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await cartService.removeCartItem(req.user!.id, req.params.itemId as string);
    sendSuccess(res, null, 200, "Item removed from cart");
  } catch (error) {
    next(error);
  }
}

export async function clearCartHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await cartService.clearCart(req.user!.id);
    sendSuccess(res, null, 200, "Cart cleared");
  } catch (error) {
    next(error);
  }
}
