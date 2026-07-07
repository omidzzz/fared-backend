import { env } from "./config/env";
import prisma from "./config/database";

async function main() {
  try {
    await prisma.$connect();
    
    const app = (await import("./app")).default;
    
    app.listen(env.PORT, () => {
      // Server started
    });
  } catch {
    process.exit(1);
  }
}

main();
