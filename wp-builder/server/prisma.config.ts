import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(rootDir, ".env") });

export default defineConfig({
  schema: path.join(rootDir, "prisma", "schema.prisma"),
  migrations: {
    path: path.join(rootDir, "prisma", "migrations"),
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
