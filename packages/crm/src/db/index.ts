import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://user:pass@localhost:5432/seldon_frame?sslmode=require";

// Self-hosted: a plain Postgres reached over a pooled TCP connection, so each
// query reuses an authenticated connection instead of opening a new one.
const pool = new Pool({ connectionString: databaseUrl });

export const db = drizzle(pool, { schema, casing: "snake_case" });

export type DbClient = typeof db;
