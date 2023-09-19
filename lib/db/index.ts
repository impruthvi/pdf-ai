import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/better-sqlite3";

neonConfig.fetchConnectionCache = true;

if(!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not found in environment variables");
}

const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql);