import { pgEnum, pgTable, serial, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import type { Step } from "@/lib/handson";

export const levelEnum = pgEnum("level", ["iniciante", "intermediario", "avancado"]);
export const statusEnum = pgEnum("status", ["draft", "published"]);

export const areas = pgTable("areas", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  topics: text("topics").array().notNull().default([]),
});

export const handsOns = pgTable("hands_ons", {
  id: serial("id").primaryKey(),
  areaId: integer("area_id").notNull().references(() => areas.id),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  level: levelEnum("level").notNull(),
  scenario: text("scenario").notNull(),
  prerequisites: text("prerequisites").array().notNull().default([]),
  tags: text("tags").array().notNull().default([]),
  steps: jsonb("steps").$type<Step[]>().notNull(),
  status: statusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  publishedAt: timestamp("published_at"),
});
