import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { envs } from "#config/envs.ts";

const client = postgres(envs.DATABASE_URL);
export const db = drizzle({ client });
