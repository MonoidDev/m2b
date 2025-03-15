import { defineConfig } from "drizzle-kit";

import { envs } from "#config/envs.ts";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: envs.DATABASE_URL,
  },
});
