import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

/**
 * Prisma client singleton. The HMR-friendly `globalThis` cache prevents
 * "too many connections" loops during `next dev` when modules reload.
 *
 * Uses the pg driver adapter (Prisma 7 + Postgres) — matches netmart's
 * backend so the operational story is identical.
 */
declare global {
  // eslint-disable-next-line no-var
  var __builderPrisma: PrismaClient | undefined;
}

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL env var is required");
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient = globalThis.__builderPrisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__builderPrisma = prisma;
}
