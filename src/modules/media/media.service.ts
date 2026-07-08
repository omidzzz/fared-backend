import { uploadToStorage, deleteFromStorage } from "../../config/storage";

export async function uploadMedia(userId: string, file: Express.Multer.File, folder: string) {
  const key = `${folder}/${userId}/${Date.now()}-${file.originalname}`;
  console.log("[media.service] uploadMedia", {
    userId,
    folder,
    key,
    bufferSize: file.buffer?.length,
    mimeType: file.mimetype,
  });
  const url = await uploadToStorage(key, file.buffer, file.mimetype);
  console.log("[media.service] uploadMedia success", { url, key });
  return { url, key };
}

export async function deleteMedia(id: string) {
  // Delete logic here
  await deleteFromStorage(id);
}
