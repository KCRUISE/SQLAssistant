import { apiRequest } from '@/lib/queryClient';
import type { 
  GenerateSqlRequest, 
  GenerateSqlResponse,
  TransformSqlRequest,
  ExplainSqlRequest,
  ExplainSqlResponse,
  SqlQuery 
} from '@shared/schema';

export const sqlApi = {
  async generateSql(request: GenerateSqlRequest): Promise<GenerateSqlResponse & { queryId: number }> {
    const response = await apiRequest('POST', '/api/sql/generate', request);
    return response.json();
  },

  async transformSql(request: TransformSqlRequest): Promise<GenerateSqlResponse & { queryId: number }> {
    const response = await apiRequest('POST', '/api/sql/transform', request);
    return response.json();
  },

  async explainSql(request: ExplainSqlRequest): Promise<ExplainSqlResponse> {
    const response = await apiRequest('POST', '/api/sql/explain', request);
    return response.json();
  },

  async formatSql(sql: string): Promise<{
    formatted: string;
    highlighted: string;
    tables: string[];
    validation: { isValid: boolean; errors: string[] };
  }> {
    const response = await apiRequest('POST', '/api/sql/format', { sql });
    return response.json();
  },

  async getQueries(): Promise<SqlQuery[]> {
    const response = await apiRequest('GET', '/api/queries');
    return response.json();
  },

  async getFavorites(): Promise<SqlQuery[]> {
    const response = await apiRequest('GET', '/api/queries/favorites');
    return response.json();
  },

  async updateFavorite(id: number, isFavorite: boolean): Promise<SqlQuery> {
    const response = await apiRequest('PATCH', `/api/queries/${id}/favorite`, { isFavorite });
    return response.json();
  },

  async deleteQuery(id: number): Promise<{ success: boolean }> {
    const response = await apiRequest('DELETE', `/api/queries/${id}`);
    return response.json();
  },

  async shareQuery(id: number, options: { isPublic?: boolean; expiresIn?: number } = {}): Promise<{
    shareToken: string;
    shareUrl: string;
    expiresAt?: Date;
  }> {
    const response = await apiRequest('POST', `/api/queries/${id}/share`, options);
    return response.json();
  },

  async getSharedQuery(token: string): Promise<{
    query: SqlQuery;
    sharedAt: Date;
    isPublic: boolean;
  }> {
    const response = await apiRequest('GET', `/api/shared/${token}`);
    return response.json();
  }
};
