import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/response";
import { AppError } from "../../middleware/errorHandler";
import { updateProfileSchema } from "./users.schema";
import * as usersService from "./users.service";

export async function getProfileHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await usersService.getProfile(req.user!.id);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
}

export async function updateProfileHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = updateProfileSchema.parse(req.body);
    const user = await usersService.updateProfile(req.user!.id, data);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
}

export async function updateAvatarHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      throw new AppError("No file uploaded", 400);
    }
    const user = await usersService.updateAvatar(req.user!.id, req.file);
    sendSuccess(res, user, 200, "Avatar updated");
  } catch (error) {
    next(error);
  }
}

export async function deleteAvatarHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await usersService.deleteAvatar(req.user!.id);
    sendSuccess(res, user, 200, "Avatar deleted");
  } catch (error) {
    next(error);
  }
}
