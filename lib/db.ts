import { sql } from "@vercel/postgres";
import { drizzle as drizzleVercel } from "drizzle-orm/vercel-postgres";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import postgres from "postgres";

export const db = process.env.VERCEL
  ? drizzleVercel(sql, { schema })
  : drizzlePostgres(postgres(process.env.POSTGRES_URL!), { schema });
