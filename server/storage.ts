import { 
  users, 
  sqlQueries, 
  schemas, 
  sharedQueries,
  type User, 
  type InsertUser,
  type SqlQuery,
  type InsertSqlQuery,
  type Schema,
  type InsertSchema,
  type SharedQuery,
  type InsertSharedQuery
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // SQL Query operations
  getSqlQuery(id: number): Promise<SqlQuery | undefined>;
  getSqlQueriesByUser(userId: number): Promise<SqlQuery[]>;
  getFavoriteQueries(userId: number): Promise<SqlQuery[]>;
  createSqlQuery(query: InsertSqlQuery): Promise<SqlQuery>;
  updateSqlQuery(id: number, updates: Partial<SqlQuery>): Promise<SqlQuery | undefined>;
  deleteSqlQuery(id: number): Promise<boolean>;

  // Schema operations
  getSchema(id: number): Promise<Schema | undefined>;
  getSchemasByUser(userId: number): Promise<Schema[]>;
  createSchema(schema: InsertSchema): Promise<Schema>;
  deleteSchema(id: number): Promise<boolean>;

  // Shared query operations
  getSharedQuery(shareToken: string): Promise<SharedQuery | undefined>;
  createSharedQuery(sharedQuery: InsertSharedQuery): Promise<SharedQuery>;
  deleteSharedQuery(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sqlQueries: Map<number, SqlQuery>;
  private schemas: Map<number, Schema>;
  private sharedQueries: Map<number, SharedQuery>;
  private currentUserId: number;
  private currentQueryId: number;
  private currentSchemaId: number;
  private currentSharedQueryId: number;

  constructor() {
    this.users = new Map();
    this.sqlQueries = new Map();
    this.schemas = new Map();
    this.sharedQueries = new Map();
    this.currentUserId = 1;
    this.currentQueryId = 1;
    this.currentSchemaId = 1;
    this.currentSharedQueryId = 1;

    // Create default user
    this.createUser({
      username: "developer",
      email: "dev@example.com",
      password: "password123"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // SQL Query operations
  async getSqlQuery(id: number): Promise<SqlQuery | undefined> {
    return this.sqlQueries.get(id);
  }

  async getSqlQueriesByUser(userId: number): Promise<SqlQuery[]> {
    return Array.from(this.sqlQueries.values())
      .filter(query => query.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getFavoriteQueries(userId: number): Promise<SqlQuery[]> {
    return Array.from(this.sqlQueries.values())
      .filter(query => query.userId === userId && query.isFavorite)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createSqlQuery(insertQuery: InsertSqlQuery): Promise<SqlQuery> {
    const id = this.currentQueryId++;
    const query: SqlQuery = {
      ...insertQuery,
      id,
      createdAt: new Date(),
      complexity: insertQuery.complexity || null,
      executionTime: insertQuery.executionTime || null,
      isFavorite: insertQuery.isFavorite || false,
      metadata: insertQuery.metadata || {}
    };
    this.sqlQueries.set(id, query);
    return query;
  }

  async updateSqlQuery(id: number, updates: Partial<SqlQuery>): Promise<SqlQuery | undefined> {
    const query = this.sqlQueries.get(id);
    if (!query) return undefined;

    const updatedQuery = { ...query, ...updates };
    this.sqlQueries.set(id, updatedQuery);
    return updatedQuery;
  }

  async deleteSqlQuery(id: number): Promise<boolean> {
    return this.sqlQueries.delete(id);
  }

  // Schema operations
  async getSchema(id: number): Promise<Schema | undefined> {
    return this.schemas.get(id);
  }

  async getSchemasByUser(userId: number): Promise<Schema[]> {
    return Array.from(this.schemas.values())
      .filter(schema => schema.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createSchema(insertSchema: InsertSchema): Promise<Schema> {
    const id = this.currentSchemaId++;
    const schema: Schema = {
      ...insertSchema,
      id,
      createdAt: new Date(),
    };
    this.schemas.set(id, schema);
    return schema;
  }

  async deleteSchema(id: number): Promise<boolean> {
    return this.schemas.delete(id);
  }

  // Shared query operations
  async getSharedQuery(shareToken: string): Promise<SharedQuery | undefined> {
    return Array.from(this.sharedQueries.values())
      .find(shared => shared.shareToken === shareToken);
  }

  async createSharedQuery(insertSharedQuery: InsertSharedQuery): Promise<SharedQuery> {
    const id = this.currentSharedQueryId++;
    const sharedQuery: SharedQuery = {
      ...insertSharedQuery,
      id,
      createdAt: new Date(),
      isPublic: insertSharedQuery.isPublic || false,
      expiresAt: insertSharedQuery.expiresAt || null,
    };
    this.sharedQueries.set(id, sharedQuery);
    return sharedQuery;
  }

  async deleteSharedQuery(id: number): Promise<boolean> {
    return this.sharedQueries.delete(id);
  }
}

export const storage = new MemStorage();
