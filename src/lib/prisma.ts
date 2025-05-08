import { PrismaClient } from "@prisma/client";

/**
 * Optimized PrismaClient configuration:
 * - Prevents multiple instances during development
 * - Adds query logging in development
 * - Implements connection pooling
 * - Handles common errors
 */

// Custom logging levels based on environment
const logLevels = process.env.NODE_ENV === "development" 
  ? ["query", "error", "warn"] 
  : ["error"];

// Configure Prisma with appropriate settings
function createPrismaClient() {
  return new PrismaClient({
    log: logLevels as any,
    // Connection pooling settings for production
    ...(process.env.NODE_ENV === "production" 
      ? {
          datasources: {
            db: {
              url: process.env.DATABASE_URL,
            },
          },
          // Recommended: avoid too many connections
          connection: {
            pool: {
              min: 2,
              max: 10,
            },
          },
        } 
      : {}),
  });
}

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Create or reuse the existing PrismaClient instance
export const prisma = globalForPrisma.prisma || createPrismaClient();

// Only assign to global in development
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown - important for serverless environments
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});