import prisma from "../../config/database";
import { AppError } from "../../middleware/errorHandler";
import { uploadToStorage, deleteFromStorage, BUCKET_NAME } from "../../config/storage";
import type { UpdateProfileInput } from "./users.schema";

// ── User select (excludes sensitive fields) ─────────────────

const userSelect = {
  id: true,
  nameFA: true,
  name: true,
  phone: true,
  email: true,
  avatar: true,
  role: true,
  isVerified: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

// ── Helpers ─────────────────────────────────────────────────

/**
 * Extract the storage key from a full Object Storage URL.
 * URL format: {endpoint}/{bucket}/avatars/userId/timestamp-file.jpg
 */
function extractKeyFromUrl(url: string): string | null {
  try {
    const bucketIndex = url.indexOf(`${BUCKET_NAME}/`);
    if (bucketIndex === -1) return null;
    return url.slice(bucketIndex + BUCKET_NAME.length + 1);
  } catch {
    return null;
  }
}

// ── Profile ─────────────────────────────────────────────────

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userSelect,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}

export async function updateProfile(userId: string, data: UpdateProfileInput) {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: userSelect,
  });

  return user;
}

// ── Avatar ──────────────────────────────────────────────────

export async function updateAvatar(
  userId: string,
  file: Express.Multer.File
) {
  const timestamp = Date.now();
  const key = `avatars/${userId}/${timestamp}-${file.originalname}`;

  let url: string;
  try {
    url = await uploadToStorage(key, file.buffer, file.mimetype);
  } catch {
    // Fallback for dev without S3
    url = `local://${key}`;
    console.log(`[STORAGE STUB] Avatar would be uploaded to: ${key}`);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatar: url },
    select: userSelect,
  });

  return user;
}

export async function deleteAvatar(userId: string) {
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatar: true },
  });

  if (!currentUser) {
    throw new AppError("User not found", 404);
  }

  // Delete existing avatar from Object Storage if present
  if (currentUser.avatar) {
    const key = extractKeyFromUrl(currentUser.avatar);
    if (key) {
      try {
        await deleteFromStorage(key);
      } catch {
        console.log(`[STORAGE STUB] Would delete avatar: ${key}`);
      }
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatar: null },
    select: userSelect,
  });

  return user;
}
