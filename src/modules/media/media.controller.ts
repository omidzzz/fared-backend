import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/response";
import { uploadMediaSchema } from "./media.schema";
import * as mediaService from "./media.service";

export async function uploadMediaHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { folder } = uploadMediaSchema.parse(req.body);
    const mediaFile = await mediaService.uploadMedia(req.user!.id, req.file!, folder!);
    sendSuccess(
      res,
      { url: mediaFile.url, key: mediaFile.key },
      201,
      "File uploaded"
    );
  } catch (error) {
    next(error);
  }
}

export async function deleteMediaHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await mediaService.deleteMedia(req.params.id as string);
    sendSuccess(res, null, 200, "File deleted");
  } catch (error) {
    next(error);
  }
}
