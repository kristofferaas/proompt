import { pgTable, serial, text, varchar, jsonb } from "drizzle-orm/pg-core";

export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  state: jsonb("state").notNull(),
});
