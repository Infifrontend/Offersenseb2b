import dotenv from "dotenv";
dotenv.config();

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";


// Use server-side environment variable, not VITE_ prefixed one for security
const databaseUrl = process.env.VITE_DATABASE_URL;
console.log(
  "Database connection status:",
  databaseUrl ? "Connected" : "Not configured",
);

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle(pool,{ schema });
