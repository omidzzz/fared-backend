import prisma from "../src/config/database";

const prismaClient = prisma;

async function main() {
  console.log("Starting to mark products as featured...\n");

  // Mark some stones as featured
  const stones = await prisma.product.findMany({
    where: { type: "stones", isActive: true },
    take: 4,
  });

  for (const stone of stones) {
    await prisma.product.update({
      where: { id: stone.id },
      data: { isFeatured: true },
    });
    console.log(`✓ Marked stone as featured: ${stone.nameEN || stone.nameFA || stone.id}`);
  }

  // Mark some candles as featured
  const candles = await prisma.product.findMany({
    where: { type: "candles", isActive: true },
    take: 4,
  });

  for (const candle of candles) {
    await prisma.product.update({
      where: { id: candle.id },
      data: { isFeatured: true },
    });
    console.log(`✓ Marked candle as featured: ${candle.nameEN || candle.nameFA || candle.id}`);
  }

  // Mark some accessories as featured
  const accessories = await prisma.product.findMany({
    where: { type: "accessories", isActive: true },
    take: 4,
  });

  for (const accessory of accessories) {
    await prisma.product.update({
      where: { id: accessory.id },
      data: { isFeatured: true },
    });
    console.log(`✓ Marked accessory as featured: ${accessory.nameEN || accessory.nameFA || accessory.id}`);
  }

  // Mark some clothes as featured
  const clothes = await prisma.product.findMany({
    where: { type: "clothes", isActive: true },
    take: 4,
  });

  for (const cloth of clothes) {
    await prisma.product.update({
      where: { id: cloth.id },
      data: { isFeatured: true },
    });
    console.log(`✓ Marked clothing as featured: ${cloth.nameEN || cloth.nameFA || cloth.id}`);
  }

  console.log("\n✅ Done! Featured products have been marked.");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
