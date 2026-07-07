import prisma from "../../config/database";
import { uploadToStorage } from "../../config/storage";

export async function createOrder(userId: string, paymentMethod: string, addressId: string, notes?: string) {
  // Implementation here
  const order = await prisma.order.create({
    data: { userId, paymentMethod, addressId, notes, status: "PENDING" },
  });
  return { order };
}

export async function getOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: { items: true, receipt: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true, receipt: true },
  });
  if (!order) throw new Error("Order not found");
  return order;
}

export async function uploadReceipt(userId: string, orderId: string, file: Express.Multer.File) {
  const key = `receipts/${orderId}/${Date.now()}-${file.originalname}`;
  const url = await uploadToStorage(key, file.buffer, file.mimetype);
  
  const receipt = await prisma.paymentReceipt.create({
    data: { orderId, userId, url, status: "PENDING" },
  });
  
  return receipt;
}
