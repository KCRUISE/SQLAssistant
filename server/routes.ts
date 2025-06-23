import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { openaiService } from "./services/openai";
import { sqlParser } from "./services/sqlParser";
import { 
  insertSqlQuerySchema,
  insertSharedQuerySchema,
  type GenerateSqlRequest,
  type TransformSqlRequest,
  type ExplainSqlRequest
} from "@shared/schema";
import { z } from "zod";
import { nanoid } from "nanoid";

export async function registerRoutes(app: Express): Promise<Server> {
  // Default user ID for demo purposes
  const DEFAULT_USER_ID = 1;

  // SQL Generation endpoint
  app.post("/api/sql/generate", async (req, res) => {
    try {
      const request: GenerateSqlRequest = req.body;
      
      if (!request.naturalLanguageQuery?.trim()) {
        return res.status(400).json({ error: "Natural language query is required" });
      }

      const result = await openaiService.generateSql(request);
      
      // Save query to storage
      const savedQuery = await storage.createSqlQuery({
        userId: DEFAULT_USER_ID,
        naturalLanguageQuery: request.naturalLanguageQuery,
        generatedSql: result.sql,
        queryType: 'generate',
        database: request.database || 'MySQL',
        complexity: result.complexity,
        executionTime: result.estimatedExecutionTime,
        metadata: {
          explanation: result.explanation,
          suggestions: result.suggestions,
          usedTables: result.usedTables,
          subject: request.subject,
          analysisType: request.analysisType,
          options: request.options
        }
      });

      res.json({
        ...result,
        queryId: savedQuery.id
      });
    } catch (error) {
      console.error("SQL generation error:", error);
      res.status(500).json({ error: (error as Error).message || "Failed to generate SQL" });
    }
  });

  // SQL Transformation endpoint
  app.post("/api/sql/transform", async (req, res) => {
    try {
      const request: TransformSqlRequest = req.body;
      
      if (!request.originalSql?.trim()) {
        return res.status(400).json({ error: "Original SQL is required" });
      }

      const result = await openaiService.transformSql(request);
      
      // Save transformed query
      const savedQuery = await storage.createSqlQuery({
        userId: DEFAULT_USER_ID,
        naturalLanguageQuery: `Transform to ${request.targetDatabase}`,
        generatedSql: result.sql,
        queryType: 'transform',
        database: request.targetDatabase,
        complexity: result.complexity,
        executionTime: result.estimatedExecutionTime,
        metadata: {
          originalSql: request.originalSql,
          explanation: result.explanation,
          suggestions: result.suggestions,
          usedTables: result.usedTables,
          optimizationLevel: request.optimizationLevel
        }
      });

      res.json({
        ...result,
        queryId: savedQuery.id
      });
    } catch (error) {
      console.error("SQL transformation error:", error);
      res.status(500).json({ error: (error as Error).message || "Failed to transform SQL" });
    }
  });

  // SQL Explanation endpoint
  app.post("/api/sql/explain", async (req, res) => {
    try {
      const request: ExplainSqlRequest = req.body;
      
      if (!request.sql?.trim()) {
        return res.status(400).json({ error: "SQL query is required" });
      }

      const result = await openaiService.explainSql(request);
      
      // Save explanation query
      await storage.createSqlQuery({
        userId: DEFAULT_USER_ID,
        naturalLanguageQuery: "Explain SQL query",
        generatedSql: request.sql,
        queryType: 'explain',
        database: 'General',
        complexity: result.complexity,
        metadata: {
          explanation: result.explanation,
          breakdown: result.breakdown,
          performance: result.performance
        }
      });

      res.json(result);
    } catch (error) {
      console.error("SQL explanation error:", error);
      res.status(500).json({ error: (error as Error).message || "Failed to explain SQL" });
    }
  });

  // SQL Parsing and formatting endpoints
  app.post("/api/sql/format", async (req, res) => {
    try {
      const { sql } = req.body;
      
      if (!sql?.trim()) {
        return res.status(400).json({ error: "SQL query is required" });
      }

      const formatted = sqlParser.formatSql(sql);
      const highlighted = sqlParser.highlightSql(formatted);
      const tables = sqlParser.extractTables(sql);
      const validation = sqlParser.validateSql(sql);

      res.json({
        formatted,
        highlighted,
        tables,
        validation
      });
    } catch (error) {
      console.error("SQL formatting error:", error);
      res.status(500).json({ error: "Failed to format SQL" });
    }
  });

  // Query history endpoints
  app.get("/api/queries", async (req, res) => {
    try {
      const queries = await storage.getSqlQueriesByUser(DEFAULT_USER_ID);
      res.json(queries);
    } catch (error) {
      console.error("Query history error:", error);
      res.status(500).json({ error: "Failed to fetch query history" });
    }
  });

  app.get("/api/queries/favorites", async (req, res) => {
    try {
      const favorites = await storage.getFavoriteQueries(DEFAULT_USER_ID);
      res.json(favorites);
    } catch (error) {
      console.error("Favorites error:", error);
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });

  app.patch("/api/queries/:id/favorite", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isFavorite } = req.body;
      
      const updated = await storage.updateSqlQuery(id, { isFavorite });
      
      if (!updated) {
        return res.status(404).json({ error: "Query not found" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Favorite update error:", error);
      res.status(500).json({ error: "Failed to update favorite status" });
    }
  });

  app.delete("/api/queries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSqlQuery(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Query not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Query deletion error:", error);
      res.status(500).json({ error: "Failed to delete query" });
    }
  });

  // Sharing endpoints
  app.post("/api/queries/:id/share", async (req, res) => {
    try {
      const queryId = parseInt(req.params.id);
      const { isPublic, expiresIn } = req.body;
      
      const query = await storage.getSqlQuery(queryId);
      if (!query) {
        return res.status(404).json({ error: "Query not found" });
      }

      const shareToken = nanoid(12);
      const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined;

      const sharedQuery = await storage.createSharedQuery({
        queryId,
        shareToken,
        isPublic: !!isPublic,
        expiresAt
      });

      res.json({
        shareToken,
        shareUrl: `${req.protocol}://${req.get('host')}/shared/${shareToken}`,
        expiresAt: sharedQuery.expiresAt
      });
    } catch (error) {
      console.error("Sharing error:", error);
      res.status(500).json({ error: "Failed to create share link" });
    }
  });

  app.get("/api/shared/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      const sharedQuery = await storage.getSharedQuery(token);
      if (!sharedQuery) {
        return res.status(404).json({ error: "Shared query not found" });
      }

      if (sharedQuery.expiresAt && sharedQuery.expiresAt < new Date()) {
        return res.status(410).json({ error: "Shared query has expired" });
      }

      const query = await storage.getSqlQuery(sharedQuery.queryId);
      if (!query) {
        return res.status(404).json({ error: "Original query not found" });
      }

      res.json({
        query,
        sharedAt: sharedQuery.createdAt,
        isPublic: sharedQuery.isPublic
      });
    } catch (error) {
      console.error("Shared query error:", error);
      res.status(500).json({ error: "Failed to fetch shared query" });
    }
  });

  // Schema management endpoints
  app.get("/api/schemas", async (req, res) => {
    try {
      const schemas = await storage.getSchemasByUser(DEFAULT_USER_ID);
      res.json(schemas);
    } catch (error) {
      console.error("Schema fetch error:", error);
      res.status(500).json({ error: "Failed to fetch schemas" });
    }
  });

  app.post("/api/schemas", async (req, res) => {
    try {
      const { name, database, schemaData } = req.body;
      
      if (!name || !database || !schemaData) {
        return res.status(400).json({ error: "Name, database, and schema data are required" });
      }

      const schema = await storage.createSchema({
        userId: DEFAULT_USER_ID,
        name,
        database,
        schemaData
      });

      res.json(schema);
    } catch (error) {
      console.error("Schema creation error:", error);
      res.status(500).json({ error: "Failed to create schema" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
