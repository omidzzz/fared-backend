import prisma from "../../config/database";
import { AppError } from "../../middleware/errorHandler";
import type { CreateAddressInput, UpdateAddressInput } from "./addresses.schema";

export async function getAddresses(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: { isDefault: "desc" },
  });
}

export async function createAddress(userId: string, data: CreateAddressInput) {
  const address = await prisma.$transaction(async (tx: any) => {
    if (data.isDefault) {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return tx.address.create({
      data: {
        userId,
        fullName: data.fullName,
        phone: data.phone,
        country: data.country,
        city: data.city,
        address1: data.address1,
        address2: data.address2 ?? null,
        postalCode: data.postalCode,
        notes: data.notes ?? null,
        isDefault: data.isDefault ?? false,
      },
    });
  });

  return address;
}

export async function updateAddress(
  userId: string,
  addressId: string,
  data: UpdateAddressInput
) {
  const existing = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  if (!existing) throw new AppError("Address not found", 404);

  const { isDefault, ...rest } = data;

  const address = await prisma.$transaction(async (tx: any) => {
    if (isDefault) {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return tx.address.update({
      where: { id: addressId },
      data: { ...rest, ...(isDefault !== undefined ? { isDefault } : {}) },
    });
  });

  return address;
}

export async function deleteAddress(userId: string, addressId: string) {
  const existing = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  if (!existing) throw new AppError("Address not found", 404);

  await prisma.address.delete({ where: { id: addressId } });
}

export async function setDefaultAddress(userId: string, addressId: string) {
  const existing = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  if (!existing) throw new AppError("Address not found", 404);

  const address = await prisma.$transaction(async (tx: any) => {
    await tx.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    return tx.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
  });

  return address;
}
