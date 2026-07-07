import { uploadToStorage, deleteFromStorage } from "../../config/storage";

export async function uploadMedia(userId: string, file: Express.Multer.File, folder: string) {
  const key = `${folder}/${userId}/${Date.now()}-${file.originalname}`;
  const url = await uploadToStorage(key, file.buffer, file.mimetype);
  return { url, key };
}

export async function deleteMedia(id: string) {
  // Delete logic here
  await deleteFromStorage(id);
}
