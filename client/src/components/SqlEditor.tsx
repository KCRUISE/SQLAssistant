import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, Download, Indent, Play, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import CodeMirror from '@uiw/react-codemirror';
import { sql as sqlLang } from '@codemirror/lang-sql'; // sql을 sqlLang으로 변경
import { useTheme } from '@/components/ThemeProvider';

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
  sql: initialSql, 
  isLoading = false, 
  onFormat, 
  onExecute,
  metadata = {}
}: SqlEditorProps) {
  const { toast } = useToast();
  const { isDark } = useTheme();
  const [sql, setSql] = useState(initialSql);

  useEffect(() => {
    setSql(initialSql);
  }, [initialSql]);

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
        <div className="bg-muted/50 rounded-lg font-mono text-sm leading-relaxed h-full overflow-auto code-editor">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <CodeMirror
              value={sql}
              height="100%"
              extensions={[sqlLang()]} // sql()을 sqlLang()으로 변경
              onChange={(value) => setSql(value)}
              theme={isDark ? 'dark' : 'light'}
              className="h-full"
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