import prisma from "../../config/database";
import { AppError } from "../../middleware/errorHandler";
import { uploadToStorage, deleteFromStorage } from "../../config/storage";

export async function uploadMedia(
  userId: string,
  file: Express.Multer.File,
  folder?: string
) {
  if (!file) throw new AppError("File is required", 400);

  const folderPath = folder || "general";
  const timestamp = Date.now();
  const key = `${folderPath}/${userId}/${timestamp}-${file.originalname}`;

  let url: string;
  try {
    url = await uploadToStorage(key, file.buffer, file.mimetype);
  } catch {
    url = `local://${key}`;
    console.log(`[STORAGE STUB] File would be uploaded to: ${key}`);
  }

  return prisma.mediaFile.create({
    data: {
      url,
      key,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      uploadedBy: userId,
      folder: folderPath,
    },
  });
}

export async function deleteMedia(id: string) {
  const mediaFile = await prisma.mediaFile.findUnique({ where: { id } });
  if (!mediaFile) throw new AppError("Media file not found", 404);

  try {
    await deleteFromStorage(mediaFile.key);
  } catch {
    console.log(`[STORAGE STUB] Would delete: ${mediaFile.key}`);
  }

  await prisma.mediaFile.delete({ where: { id } });
}
