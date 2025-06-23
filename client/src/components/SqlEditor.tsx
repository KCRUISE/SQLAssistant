import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, Download, Indent, Play, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface SqlEditorProps {
  sql: string;
  isLoading?: boolean;
  onFormat?: () => void;
  onExecute?: () => void;
  metadata?: {
    executionTime?: number;
    isValidated?: boolean;
    complexity?: string;
  };
}

export function SqlEditor({ 
  sql, 
  isLoading = false, 
  onFormat, 
  onExecute,
  metadata = {}
}: SqlEditorProps) {
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const [highlightedSql, setHighlightedSql] = useState('');

  useEffect(() => {
    if (sql) {
      // Simple SQL highlighting
      const highlighted = highlightSql(sql);
      setHighlightedSql(highlighted);
    }
  }, [sql]);

  const highlightSql = (sqlText: string): string => {
    // Keywords
    const keywords = /\b(SELECT|FROM|WHERE|JOIN|INNER|LEFT|RIGHT|FULL|OUTER|ON|GROUP|BY|HAVING|ORDER|LIMIT|OFFSET|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|ALTER|DROP|INDEX|CONSTRAINT|PRIMARY|KEY|FOREIGN|REFERENCES|UNIQUE|NOT|NULL|DEFAULT|CHECK|AND|OR|IN|LIKE|BETWEEN|EXISTS|CASE|WHEN|THEN|ELSE|END|AS|DISTINCT|ALL|UNION|INTERSECT|EXCEPT|WITH|RECURSIVE|CAST|EXTRACT)\b/gi;
    
    // Functions
    const functions = /\b(COUNT|SUM|AVG|MIN|MAX|ROUND|FLOOR|CEIL|ABS|UPPER|LOWER|TRIM|LENGTH|SUBSTRING|REPLACE|CONCAT|COALESCE|NULLIF|NOW|CURRENT_DATE|CURRENT_TIME|DATE_ADD|DATE_SUB|YEAR|MONTH|DAY|HOUR|MINUTE|SECOND)\b/gi;
    
    // String literals
    const strings = /'[^']*'/g;
    
    // Numbers
    const numbers = /\b\d+(\.\d+)?\b/g;
    
    // Comments
    const comments = /--[^\n]*|\/\*[\s\S]*?\*\//g;

    let highlighted = sqlText
      .replace(comments, '<span class="sql-comment">$&</span>')
      .replace(strings, '<span class="sql-string">$&</span>')
      .replace(numbers, '<span class="sql-number">$&</span>')
      .replace(functions, '<span class="sql-function">$&</span>')
      .replace(keywords, '<span class="sql-keyword">$&</span>');

    return highlighted;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sql);
      toast({
        title: "복사 완료",
        description: "SQL이 클립보드에 복사되었습니다.",
      });
    } catch (error) {
      toast({
        title: "복사 실패",
        description: "클립보드 복사에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([sql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'query.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "다운로드 완료",
      description: "SQL 파일이 다운로드되었습니다.",
    });
  };

  return (
    <Card className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
              <Play className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Generated SQL</h3>
              <p className="text-sm text-muted-foreground">AI로 생성된 최적화된 쿼리</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
            </Button>
            {onFormat && (
              <Button variant="ghost" size="sm" onClick={onFormat}>
                <Indent className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-4">
        <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm leading-relaxed h-full overflow-auto code-editor">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div
              ref={editorRef}
              className="whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: highlightedSql || sql }}
            />
          )}
        </div>
      </div>
      
      {!isLoading && sql && (
        <div className="p-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            {metadata.executionTime && (
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                생성 시간: {metadata.executionTime}초
              </span>
            )}
            {metadata.isValidated && (
              <span className="flex items-center text-emerald-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                문법 검증 완료
              </span>
            )}
          </div>
          {onExecute && (
            <Button onClick={onExecute} className="btn-primary">
              <Play className="h-4 w-4 mr-2" />
              쿼리 실행
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
