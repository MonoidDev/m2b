import { envs } from "#config/envs.ts";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(envs.DATABASE_URL);
export const db = drizzle({ client });
