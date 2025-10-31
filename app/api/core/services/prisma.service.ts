import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Enhanced Prisma client configuration for Vercel
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.APP_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    // Add engine configuration for better Vercel compatibility
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Connect on initialization in production
if (process.env.APP_ENV === "production") {
  prisma.$connect().catch((error: any) => {
    console.error("❌ Failed to connect to database:", error);
  });
}

if (process.env.APP_ENV !== "production") globalForPrisma.prisma = prisma;
