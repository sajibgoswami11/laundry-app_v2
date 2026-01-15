import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

import path from "path";

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: "file:" + path.join(process.cwd(), "prisma/dev.db"),
      },
    },
  });
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
} 