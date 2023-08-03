import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name"),
  phone: varchar("phone", { length: 256 }),
});

export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 256 }),
  players: text("players"),
});
