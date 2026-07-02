import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/response";
import * as notificationsService from "./notifications.service";

export async function getNotificationsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const notifications = await notificationsService.getNotifications(req.user!.id);
    sendSuccess(res, notifications);
  } catch (error) {
    next(error);
  }
}

export async function markReadHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const updated = await notificationsService.markAsRead(
      req.user!.id,
      req.params.id as string
    );
    if (!updated) {
      sendSuccess(res, null, 404, "Notification not found");
      return;
    }
    sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
}

export async function markAllReadHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await notificationsService.markAllAsRead(req.user!.id);
    sendSuccess(res, null, 200, "All notifications marked as read");
  } catch (error) {
    next(error);
  }
}
