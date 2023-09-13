import { jsonb, pgTable, serial } from "drizzle-orm/pg-core";

export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  state: jsonb("state").notNull(),
});

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  state: jsonb("state").notNull(),
});
