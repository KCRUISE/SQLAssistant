export interface SqlToken {
  type: 'keyword' | 'string' | 'number' | 'function' | 'comment' | 'identifier';
  value: string;
  start: number;
  end: number;
}

export class SqlParser {
  private readonly keywords = new Set([
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER',
    'ON', 'GROUP', 'BY', 'HAVING', 'ORDER', 'LIMIT', 'OFFSET', 'INSERT', 'INTO',
    'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'ALTER', 'DROP',
    'INDEX', 'CONSTRAINT', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'UNIQUE',
    'NOT', 'NULL', 'DEFAULT', 'CHECK', 'AND', 'OR', 'IN', 'LIKE', 'BETWEEN',
    'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'AS', 'DISTINCT', 'ALL',
    'UNION', 'INTERSECT', 'EXCEPT', 'WITH', 'RECURSIVE', 'CAST', 'EXTRACT'
  ]);

  private readonly functions = new Set([
    'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ROUND', 'FLOOR', 'CEIL', 'ABS',
    'UPPER', 'LOWER', 'TRIM', 'LENGTH', 'SUBSTRING', 'REPLACE', 'CONCAT',
    'COALESCE', 'NULLIF', 'NOW', 'CURRENT_DATE', 'CURRENT_TIME', 'DATE_ADD',
    'DATE_SUB', 'YEAR', 'MONTH', 'DAY', 'HOUR', 'MINUTE', 'SECOND'
  ]);

  tokenize(sql: string): SqlToken[] {
    const tokens: SqlToken[] = [];
    let i = 0;

    while (i < sql.length) {
      const char = sql[i];

      // Skip whitespace
      if (/\s/.test(char)) {
        i++;
        continue;
      }

      // Comments
      if (char === '-' && sql[i + 1] === '-') {
        const start = i;
        while (i < sql.length && sql[i] !== '\n') {
          i++;
        }
        tokens.push({
          type: 'comment',
          value: sql.slice(start, i),
          start,
          end: i
        });
        continue;
      }

      // Multi-line comments
      if (char === '/' && sql[i + 1] === '*') {
        const start = i;
        i += 2;
        while (i < sql.length - 1 && !(sql[i] === '*' && sql[i + 1] === '/')) {
          i++;
        }
        i += 2;
        tokens.push({
          type: 'comment',
          value: sql.slice(start, i),
          start,
          end: i
        });
        continue;
      }

      // String literals
      if (char === "'" || char === '"') {
        const start = i;
        const quote = char;
        i++;
        while (i < sql.length && sql[i] !== quote) {
          if (sql[i] === '\\') {
            i += 2; // Skip escaped character
          } else {
            i++;
          }
        }
        i++; // Skip closing quote
        tokens.push({
          type: 'string',
          value: sql.slice(start, i),
          start,
          end: i
        });
        continue;
      }

      // Numbers
      if (/\d/.test(char)) {
        const start = i;
        while (i < sql.length && /[\d.]/.test(sql[i])) {
          i++;
        }
        tokens.push({
          type: 'number',
          value: sql.slice(start, i),
          start,
          end: i
        });
        continue;
      }

      // Identifiers and keywords
      if (/[a-zA-Z_]/.test(char)) {
        const start = i;
        while (i < sql.length && /[a-zA-Z0-9_]/.test(sql[i])) {
          i++;
        }
        const value = sql.slice(start, i);
        const upperValue = value.toUpperCase();
        
        let type: SqlToken['type'] = 'identifier';
        if (this.keywords.has(upperValue)) {
          type = 'keyword';
        } else if (this.functions.has(upperValue)) {
          type = 'function';
        }

        tokens.push({
          type,
          value,
          start,
          end: i
        });
        continue;
      }

      // Skip other characters (operators, punctuation)
      i++;
    }

    return tokens;
  }

  formatSql(sql: string): string {
    const tokens = this.tokenize(sql);
    let formatted = '';
    let indentLevel = 0;
    let newLine = true;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const upperValue = token.value.toUpperCase();

      if (token.type === 'keyword') {
        if (['SELECT', 'FROM', 'WHERE', 'GROUP', 'ORDER', 'HAVING'].includes(upperValue)) {
          if (!newLine) {
            formatted += '\n';
          }
          formatted += '  '.repeat(indentLevel) + token.value.toUpperCase();
          newLine = false;
        } else if (['JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL'].includes(upperValue)) {
          if (!newLine) {
            formatted += '\n';
          }
          formatted += '  '.repeat(indentLevel) + token.value.toUpperCase();
          newLine = false;
        } else {
          if (newLine) {
            formatted += '  '.repeat(indentLevel);
          } else {
            formatted += ' ';
          }
          formatted += token.value.toUpperCase();
          newLine = false;
        }
      } else if (token.type === 'function') {
        if (newLine) {
          formatted += '  '.repeat(indentLevel);
        } else if (formatted && !formatted.endsWith(' ')) {
          formatted += ' ';
        }
        formatted += token.value.toUpperCase();
        newLine = false;
      } else {
        if (newLine) {
          formatted += '  '.repeat(indentLevel);
        } else if (formatted && !formatted.endsWith(' ') && token.type !== 'string') {
          formatted += ' ';
        }
        formatted += token.value;
        newLine = false;
      }
    }

    return formatted.trim();
  }

  highlightSql(sql: string): string {
    const tokens = this.tokenize(sql);
    let highlighted = '';
    let lastEnd = 0;

    for (const token of tokens) {
      // Add any whitespace/characters between tokens
      highlighted += sql.slice(lastEnd, token.start);

      // Add highlighted token
      const className = `sql-${token.type}`;
      highlighted += `<span class="${className}">${this.escapeHtml(token.value)}</span>`;

      lastEnd = token.end;
    }

    // Add any remaining characters
    highlighted += sql.slice(lastEnd);

    return highlighted;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  extractTables(sql: string): string[] {
    const tokens = this.tokenize(sql);
    const tables: string[] = [];
    
    for (let i = 0; i < tokens.length - 1; i++) {
      const token = tokens[i];
      const nextToken = tokens[i + 1];
      
      if (token.type === 'keyword' && 
          ['FROM', 'JOIN', 'INTO', 'UPDATE'].includes(token.value.toUpperCase()) &&
          nextToken.type === 'identifier') {
        tables.push(nextToken.value);
      }
    }

    return [...new Set(tables)]; // Remove duplicates
  }

  validateSql(sql: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const tokens = this.tokenize(sql);
    
    if (tokens.length === 0) {
      return { isValid: false, errors: ['Empty query'] };
    }

    // Basic validation rules
    const hasSelect = tokens.some(t => t.type === 'keyword' && t.value.toUpperCase() === 'SELECT');
    const hasFrom = tokens.some(t => t.type === 'keyword' && t.value.toUpperCase() === 'FROM');

    if (hasSelect && !hasFrom) {
      errors.push('SELECT statement missing FROM clause');
    }

    // Check for unmatched parentheses
    let parenCount = 0;
    for (const token of tokens) {
      if (token.value === '(') parenCount++;
      if (token.value === ')') parenCount--;
    }
    
    if (parenCount !== 0) {
      errors.push('Unmatched parentheses');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const sqlParser = new SqlParser();
