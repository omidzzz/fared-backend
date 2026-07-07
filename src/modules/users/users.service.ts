import prisma from "../../config/database";
import { uploadToStorage, deleteFromStorage } from "../../config/storage";

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, nameFA: true, name: true, phone: true, email: true,
      role: true, isVerified: true, avatar: true, createdAt: true,
    },
  });
  if (!user) throw new Error("User not found");
  return user;
}

export async function updateProfile(userId: string, data: any) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { nameFA: data.nameFA, name: data.name, phone: data.phone, email: data.email },
  });
  return user;
}

export async function updateAvatar(userId: string, file: Express.Multer.File) {
  const key = `avatars/${userId}/${Date.now()}-${file.originalname}`;
  const url = await uploadToStorage(key, file.buffer, file.mimetype);
  
  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatar: url },
  });
  
  return { url, user };
}

export async function deleteAvatar(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.avatar) return;
  
  await deleteFromStorage(user.avatar);
  await prisma.user.update({ where: { id: userId }, data: { avatar: null } });
}
