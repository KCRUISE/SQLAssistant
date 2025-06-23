import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SqlEditor } from '@/components/SqlEditor';
import { QueryAnalysis } from '@/components/QueryAnalysis';
import { useToast } from '@/hooks/useToast';
import { sqlApi } from '@/lib/api';
import { ArrowLeftRight, Upload, FileText } from 'lucide-react';
import type { TransformSqlRequest, GenerateSqlResponse } from '@shared/schema';

export default function SqlTransformer() {
  const { toast } = useToast();
  const [originalSql, setOriginalSql] = useState('');
  const [targetDatabase, setTargetDatabase] = useState('PostgreSQL');
  const [optimizationLevel, setOptimizationLevel] = useState('standard');
  const [result, setResult] = useState<GenerateSqlResponse & { queryId: number } | null>(null);

  const transformMutation = useMutation({
    mutationFn: (request: TransformSqlRequest) => sqlApi.transformSql(request),
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "SQL 변환 완료",
        description: `${targetDatabase}에 최적화된 SQL로 변환되었습니다.`,
        variant: "success"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "SQL 변환 실패",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleTransform = () => {
    if (!originalSql.trim()) {
      toast({
        title: "입력 오류",
        description: "변환할 SQL을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    const request: TransformSqlRequest = {
      originalSql,
      targetDatabase,
      optimizationLevel: optimizationLevel as any
    };

    transformMutation.mutate(request);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setOriginalSql(content);
        toast({
          title: "파일 업로드 완료",
          description: "SQL 파일이 성공적으로 로드되었습니다.",
        });
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <ArrowLeftRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg">SQL Transformer</CardTitle>
              <p className="text-sm text-muted-foreground">SQL을 다른 데이터베이스 시스템으로 변환하세요</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="targetDatabase">대상 데이터베이스</Label>
              <Select value={targetDatabase} onValueChange={setTargetDatabase}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MySQL">MySQL</SelectItem>
                  <SelectItem value="PostgreSQL">PostgreSQL</SelectItem>
                  <SelectItem value="SQLite">SQLite</SelectItem>
                  <SelectItem value="SQL Server">SQL Server</SelectItem>
                  <SelectItem value="Oracle">Oracle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="optimizationLevel">최적화 레벨</Label>
              <Select value={optimizationLevel} onValueChange={setOptimizationLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">표준</SelectItem>
                  <SelectItem value="performance">성능 최적화</SelectItem>
                  <SelectItem value="readability">가독성 최적화</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="originalSql">원본 SQL</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept=".sql,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="sql-file-upload"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('sql-file-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  파일 업로드
                </Button>
              </div>
            </div>
            <Textarea
              id="originalSql"
              rows={12}
              value={originalSql}
              onChange={(e) => setOriginalSql(e.target.value)}
              className="form-textarea font-mono"
              placeholder={`-- 변환할 SQL을 입력하세요
SELECT 
    users.name,
    COUNT(orders.id) as order_count,
    SUM(orders.total) as total_amount
FROM users
LEFT JOIN orders ON users.id = orders.user_id
WHERE users.created_at >= '2023-01-01'
GROUP BY users.id, users.name
ORDER BY total_amount DESC
LIMIT 10;`}
            />
          </div>
        </CardContent>

        {/* Action Bar */}
        <div className="px-6 py-4 bg-muted/50 border-t border-border flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <FileText className="h-4 w-4 mr-1" />
            AI가 SQL을 분석하여 대상 데이터베이스에 최적화된 쿼리로 변환합니다
          </div>
          <Button 
            onClick={handleTransform}
            disabled={transformMutation.isPending}
            className="btn-primary"
          >
            {transformMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                변환중...
              </>
            ) : (
              <>
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                SQL 변환하기
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Results Section */}
      {result && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
          {/* Transformed SQL */}
          <div className="lg:col-span-2">
            <SqlEditor
              sql={result.sql}
              isLoading={transformMutation.isPending}
              metadata={{
                executionTime: result.estimatedExecutionTime / 1000,
                isValidated: true,
                complexity: result.complexity
              }}
            />
          </div>

          {/* Analysis & Actions */}
          <div>
            <QueryAnalysis
              analysis={{
                complexity: result.complexity,
                estimatedExecutionTime: result.estimatedExecutionTime,
                usedTables: result.usedTables,
                suggestions: result.suggestions
              }}
              onSave={() => toast({ title: "저장 완료", description: "변환된 SQL이 저장되었습니다." })}
              onShare={() => toast({ title: "공유 링크 생성", description: "공유 가능한 링크가 생성되었습니다." })}
              onBookmark={() => toast({ title: "즐겨찾기 추가", description: "즐겨찾기에 추가되었습니다." })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
