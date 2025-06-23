import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sqlQueries = pgTable("sql_queries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  naturalLanguageQuery: text("natural_language_query").notNull(),
  generatedSql: text("generated_sql").notNull(),
  queryType: text("query_type").notNull(), // 'generate', 'transform', 'explain'
  database: text("database").notNull(),
  complexity: text("complexity"), // 'simple', 'medium', 'complex'
  executionTime: integer("execution_time"), // in milliseconds
  isFavorite: boolean("is_favorite").default(false),
  metadata: jsonb("metadata"), // analysis data, suggestions, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const schemas = pgTable("schemas", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  database: text("database").notNull(),
  schemaData: jsonb("schema_data").notNull(), // table definitions
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sharedQueries = pgTable("shared_queries", {
  id: serial("id").primaryKey(),
  queryId: integer("query_id").references(() => sqlQueries.id).notNull(),
  shareToken: text("share_token").notNull().unique(),
  isPublic: boolean("is_public").default(false),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertSqlQuerySchema = createInsertSchema(sqlQueries).omit({
  id: true,
  createdAt: true,
});

export const insertSchemaSchema = createInsertSchema(schemas).omit({
  id: true,
  createdAt: true,
});

export const insertSharedQuerySchema = createInsertSchema(sharedQueries).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type SqlQuery = typeof sqlQueries.$inferSelect;
export type InsertSqlQuery = z.infer<typeof insertSqlQuerySchema>;

export type Schema = typeof schemas.$inferSelect;
export type InsertSchema = z.infer<typeof insertSchemaSchema>;

export type SharedQuery = typeof sharedQueries.$inferSelect;
export type InsertSharedQuery = z.infer<typeof insertSharedQuerySchema>;

// API request/response types
export interface GenerateSqlRequest {
  naturalLanguageQuery: string;
  database: string;
  subject?: string;
  analysisType?: string;
  options?: {
    limit?: number;
    sortOrder?: 'auto' | 'asc' | 'desc';
    optimizationLevel?: 'standard' | 'performance' | 'readability';
  };
}

export interface GenerateSqlResponse {
  sql: string;
  explanation: string;
  complexity: 'simple' | 'medium' | 'complex';
  estimatedExecutionTime: number;
  suggestions: string[];
  usedTables: string[];
}

export interface TransformSqlRequest {
  originalSql: string;
  targetDatabase: string;
  optimizationLevel?: 'standard' | 'performance' | 'readability';
}

export interface ExplainSqlRequest {
  sql: string;
}

export interface ExplainSqlResponse {
  explanation: string;
  breakdown: {
    section: string;
    description: string;
  }[];
  complexity: 'simple' | 'medium' | 'complex';
  performance: {
    rating: number;
    suggestions: string[];
  };
}
