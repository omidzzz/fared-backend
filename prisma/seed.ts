import { PrismaClient } from '@prisma/client';
import { env } from '../src/config/env';

const prisma = new PrismaClient();

async function main() {
  // Seeding logic here
}

main()
  .catch((e) => {
    process.exit(1);
  });