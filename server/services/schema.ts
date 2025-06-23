export interface DatabaseSchema {
  tables: Record<string, TableDefinition>;
  indexes?: Record<string, IndexDefinition>;
  views?: Record<string, ViewDefinition>;
}

export interface TableDefinition {
  columns: Record<string, ColumnDefinition>;
  primaryKey?: string[];
  foreignKeys?: ForeignKeyDefinition[];
  indexes?: string[];
  constraints?: ConstraintDefinition[];
}

export interface ColumnDefinition {
  type: string;
  nullable?: boolean;
  default?: any;
  autoIncrement?: boolean;
  unique?: boolean;
  comment?: string;
}

export interface ForeignKeyDefinition {
  columns: string[];
  referencedTable: string;
  referencedColumns: string[];
  onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
  onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
}

export interface IndexDefinition {
  table: string;
  columns: string[];
  unique?: boolean;
  type?: 'BTREE' | 'HASH' | 'GIN' | 'GIST';
}

export interface ViewDefinition {
  query: string;
  columns?: string[];
}

export interface ConstraintDefinition {
  type: 'CHECK' | 'UNIQUE' | 'EXCLUDE';
  expression: string;
  name?: string;
}

export class SchemaAnalyzer {
  analyzeSchema(schema: DatabaseSchema): {
    tableCount: number;
    columnCount: number;
    indexCount: number;
    relationships: Array<{
      from: string;
      to: string;
      type: 'one-to-one' | 'one-to-many' | 'many-to-many';
    }>;
    suggestions: string[];
  } {
    const tableCount = Object.keys(schema.tables).length;
    let columnCount = 0;
    let indexCount = 0;
    const relationships: Array<{
      from: string;
      to: string;
      type: 'one-to-one' | 'one-to-many' | 'many-to-many';
    }> = [];
    const suggestions: string[] = [];

    // Analyze tables
    for (const [tableName, table] of Object.entries(schema.tables)) {
      columnCount += Object.keys(table.columns).length;
      indexCount += table.indexes?.length || 0;

      // Analyze foreign keys
      if (table.foreignKeys) {
        for (const fk of table.foreignKeys) {
          relationships.push({
            from: tableName,
            to: fk.referencedTable,
            type: 'one-to-many' // Simplified for now
          });
        }
      }

      // Generate suggestions
      const hasIdColumn = Object.keys(table.columns).some(col => 
        col.toLowerCase() === 'id' && table.columns[col].autoIncrement
      );
      
      if (!hasIdColumn) {
        suggestions.push(`테이블 '${tableName}'에 자동 증가 ID 컬럼 추가를 고려해보세요.`);
      }

      const hasTimestamps = Object.keys(table.columns).some(col => 
        ['created_at', 'updated_at', 'createdAt', 'updatedAt'].includes(col)
      );
      
      if (!hasTimestamps) {
        suggestions.push(`테이블 '${tableName}'에 타임스탬프 컬럼 추가를 고려해보세요.`);
      }

      // Check for missing indexes on foreign key columns
      if (table.foreignKeys) {
        for (const fk of table.foreignKeys) {
          const hasIndex = table.indexes?.some(idx => 
            fk.columns.every(col => idx.includes(col))
          );
          
          if (!hasIndex) {
            suggestions.push(`외래 키 '${fk.columns.join(', ')}'에 인덱스 추가를 권장합니다.`);
          }
        }
      }
    }

    return {
      tableCount,
      columnCount,
      indexCount,
      relationships,
      suggestions
    };
  }

  generateSqlFromSchema(schema: DatabaseSchema, dialect: 'mysql' | 'postgresql' | 'sqlite' = 'mysql'): string {
    const statements: string[] = [];

    // Generate CREATE TABLE statements
    for (const [tableName, table] of Object.entries(schema.tables)) {
      const columns: string[] = [];
      
      // Add columns
      for (const [columnName, column] of Object.entries(table.columns)) {
        let columnDef = `  ${columnName} ${column.type}`;
        
        if (column.autoIncrement) {
          if (dialect === 'mysql') {
            columnDef += ' AUTO_INCREMENT';
          } else if (dialect === 'postgresql') {
            columnDef = `  ${columnName} SERIAL`;
          }
        }
        
        if (!column.nullable) {
          columnDef += ' NOT NULL';
        }
        
        if (column.default !== undefined) {
          columnDef += ` DEFAULT ${column.default}`;
        }
        
        if (column.unique) {
          columnDef += ' UNIQUE';
        }
        
        columns.push(columnDef);
      }

      // Add primary key
      if (table.primaryKey && table.primaryKey.length > 0) {
        columns.push(`  PRIMARY KEY (${table.primaryKey.join(', ')})`);
      }

      // Add foreign keys
      if (table.foreignKeys) {
        for (const fk of table.foreignKeys) {
          let fkDef = `  FOREIGN KEY (${fk.columns.join(', ')}) REFERENCES ${fk.referencedTable}(${fk.referencedColumns.join(', ')})`;
          
          if (fk.onDelete) {
            fkDef += ` ON DELETE ${fk.onDelete}`;
          }
          
          if (fk.onUpdate) {
            fkDef += ` ON UPDATE ${fk.onUpdate}`;
          }
          
          columns.push(fkDef);
        }
      }

      statements.push(`CREATE TABLE ${tableName} (\n${columns.join(',\n')}\n);`);
    }

    // Generate CREATE INDEX statements
    for (const [tableName, table] of Object.entries(schema.tables)) {
      if (table.indexes) {
        for (const indexName of table.indexes) {
          // This is simplified - in reality you'd need more info about the index
          statements.push(`CREATE INDEX ${indexName} ON ${tableName}(id);`);
        }
      }
    }

    return statements.join('\n\n');
  }

  validateSchema(schema: DatabaseSchema): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if schema has tables
    if (!schema.tables || Object.keys(schema.tables).length === 0) {
      errors.push('스키마에 테이블이 정의되지 않았습니다.');
      return { isValid: false, errors, warnings };
    }

    // Validate each table
    for (const [tableName, table] of Object.entries(schema.tables)) {
      // Check if table has columns
      if (!table.columns || Object.keys(table.columns).length === 0) {
        errors.push(`테이블 '${tableName}'에 컬럼이 정의되지 않았습니다.`);
        continue;
      }

      // Validate foreign key references
      if (table.foreignKeys) {
        for (const fk of table.foreignKeys) {
          if (!schema.tables[fk.referencedTable]) {
            errors.push(`테이블 '${tableName}'의 외래 키가 존재하지 않는 테이블 '${fk.referencedTable}'을 참조합니다.`);
          } else {
            // Check if referenced columns exist
            const referencedTable = schema.tables[fk.referencedTable];
            for (const refCol of fk.referencedColumns) {
              if (!referencedTable.columns[refCol]) {
                errors.push(`외래 키가 존재하지 않는 컬럼 '${fk.referencedTable}.${refCol}'을 참조합니다.`);
              }
            }
          }
        }
      }

      // Check primary key columns exist
      if (table.primaryKey) {
        for (const pkCol of table.primaryKey) {
          if (!table.columns[pkCol]) {
            errors.push(`테이블 '${tableName}'의 기본 키가 존재하지 않는 컬럼 '${pkCol}'을 참조합니다.`);
          }
        }
      }

      // Warnings for best practices
      const hasIdColumn = Object.keys(table.columns).some(col => 
        col.toLowerCase() === 'id'
      );
      
      if (!hasIdColumn) {
        warnings.push(`테이블 '${tableName}'에 ID 컬럼이 없습니다.`);
      }

      if (!table.primaryKey || table.primaryKey.length === 0) {
        warnings.push(`테이블 '${tableName}'에 기본 키가 정의되지 않았습니다.`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const schemaAnalyzer = new SchemaAnalyzer();
