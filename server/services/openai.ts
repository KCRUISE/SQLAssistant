import OpenAI from "openai";
import type { 
  GenerateSqlRequest, 
  GenerateSqlResponse, 
  TransformSqlRequest,
  ExplainSqlRequest,
  ExplainSqlResponse
} from "@shared/schema";

// .env 파일의 OPENAI_API_KEY만 사용하도록 수정
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("The OPENAI_API_KEY environment variable is missing or empty.");
}

const openai = new OpenAI({ apiKey });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
export class OpenAIService {
  async generateSql(request: GenerateSqlRequest): Promise<GenerateSqlResponse> {
    try {
      const prompt = this.buildGenerateSqlPrompt(request);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert SQL developer. Generate optimized SQL queries based on natural language descriptions. Always respond with valid JSON in the specified format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        sql: result.sql || "",
        explanation: result.explanation || "",
        complexity: result.complexity || "medium",
        estimatedExecutionTime: result.estimatedExecutionTime || 1000,
        suggestions: result.suggestions || [],
        usedTables: result.usedTables || []
      };
    } catch (error) {
      throw new Error(`Failed to generate SQL: ${error.message}`);
    }
  }

  async transformSql(request: TransformSqlRequest): Promise<GenerateSqlResponse> {
    try {
      const prompt = `
        Transform the following SQL query for ${request.targetDatabase} database with ${request.optimizationLevel || 'standard'} optimization level:
        
        Original SQL:
        ${request.originalSql}
        
        Requirements:
        - Ensure compatibility with ${request.targetDatabase}
        - Apply ${request.optimizationLevel || 'standard'} optimization techniques
        - Maintain query functionality
        - Provide explanation of changes made
        
        Respond with JSON containing:
        {
          "sql": "transformed SQL query",
          "explanation": "detailed explanation of transformation",
          "complexity": "simple|medium|complex",
          "estimatedExecutionTime": number_in_milliseconds,
          "suggestions": ["optimization suggestion 1", "suggestion 2"],
          "usedTables": ["table1", "table2"]
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert SQL developer specializing in database migration and query optimization."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        sql: result.sql || "",
        explanation: result.explanation || "",
        complexity: result.complexity || "medium",
        estimatedExecutionTime: result.estimatedExecutionTime || 1000,
        suggestions: result.suggestions || [],
        usedTables: result.usedTables || []
      };
    } catch (error) {
      throw new Error(`Failed to transform SQL: ${error.message}`);
    }
  }

  async explainSql(request: ExplainSqlRequest): Promise<ExplainSqlResponse> {
    try {
      const prompt = `
        Explain the following SQL query in detail:
        
        ${request.sql}
        
        Provide a comprehensive explanation including:
        - Overall purpose and functionality
        - Step-by-step breakdown of each part
        - Performance analysis and optimization suggestions
        - Complexity assessment
        
        Respond with JSON containing:
        {
          "explanation": "comprehensive explanation of the query",
          "breakdown": [
            {
              "section": "SELECT clause",
              "description": "detailed explanation"
            }
          ],
          "complexity": "simple|medium|complex",
          "performance": {
            "rating": number_from_1_to_10,
            "suggestions": ["performance improvement suggestion"]
          }
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert SQL educator and performance analyst. Provide clear, educational explanations of SQL queries."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        explanation: result.explanation || "",
        breakdown: result.breakdown || [],
        complexity: result.complexity || "medium",
        performance: result.performance || { rating: 5, suggestions: [] }
      };
    } catch (error) {
      throw new Error(`Failed to explain SQL: ${error.message}`);
    }
  }

  private buildGenerateSqlPrompt(request: GenerateSqlRequest): string {
    return `
      Generate a SQL query based on the following natural language description:
      
      Query: "${request.naturalLanguageQuery}"
      Database: ${request.database}
      Subject Area: ${request.subject || "General"}
      Analysis Type: ${request.analysisType || "General"}
      
      Options:
      - Limit: ${request.options?.limit || "No limit specified"}
      - Sort Order: ${request.options?.sortOrder || "auto"}
      - Optimization Level: ${request.options?.optimizationLevel || "standard"}
      
      Please generate an optimized SQL query that:
      1. Accurately reflects the natural language request
      2. Follows best practices for ${request.database}
      3. Is optimized for performance
      4. Includes appropriate comments if complex
      
      Respond with JSON containing:
      {
        "sql": "generated SQL query with proper formatting",
        "explanation": "detailed explanation of what the query does",
        "complexity": "simple|medium|complex",
        "estimatedExecutionTime": estimated_time_in_milliseconds,
        "suggestions": ["optimization suggestion 1", "suggestion 2"],
        "usedTables": ["table1", "table2", "table3"]
      }
    `;
  }
}

export const openaiService = new OpenAIService();