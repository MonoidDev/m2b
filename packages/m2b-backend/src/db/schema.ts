import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { UserRole } from "m2b-models";
import { pgEnum } from "./columns";

export const userRoleEnum = pgEnum('role', UserRole)

export const usersTable = pgTable("users_table", {
  id: serial("id").primaryKey(),
  name: text("name"),
  age: integer("age"),
  email: text("email").notNull().unique(),
  role: userRoleEnum().notNull(),
  encryptedPassword: text("encrypted_password").notNull(),
  activated: boolean("activated").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

export const passwordsTable = pgTable("passwords_table", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export type InsertPassword = typeof passwordsTable.$inferInsert;
export type SelectPassword = typeof passwordsTable.$inferSelect;

export const sessionsTable = pgTable("sessions_table", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  refreshToken: text("refresh_token").notNull(),

  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export type InsertSession = typeof sessionsTable.$inferInsert;
export type SelectSession = typeof sessionsTable.$inferSelect;
