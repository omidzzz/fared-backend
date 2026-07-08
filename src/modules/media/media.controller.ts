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
    // Get folder from query params (since body is used by multer for file)
    const folder = (req.query.folder as string) || "products";

    console.log("[media.controller] uploadMediaHandler called", {
      userId: req.user?.id,
      folder,
      hasFile: !!req.file,
      fileName: req.file?.originalname,
      fileSize: req.file?.size,
      fileMimeType: req.file?.mimetype,
    });

    const mediaFile = await mediaService.uploadMedia(req.user!.id, req.file!, folder);

    console.log("[media.controller] Upload successful", {
      url: mediaFile.url,
      key: mediaFile.key,
    });

    sendSuccess(
      res,
      { url: mediaFile.url, key: mediaFile.key },
      201,
      "File uploaded"
    );
  } catch (error) {
    console.error("[media.controller] Upload failed:", error);
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