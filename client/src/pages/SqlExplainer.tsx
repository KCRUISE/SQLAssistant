import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/useToast';
import { sqlApi } from '@/lib/api';
import { Lightbulb, BookOpen, TrendingUp, Upload } from 'lucide-react';
import type { ExplainSqlRequest, ExplainSqlResponse } from '@shared/schema';

export default function SqlExplainer() {
  const { toast } = useToast();
  const [sql, setSql] = useState('');
  const [result, setResult] = useState<ExplainSqlResponse | null>(null);

  const explainMutation = useMutation({
    mutationFn: (request: ExplainSqlRequest) => sqlApi.explainSql(request),
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "SQL 설명 완료",
        description: "쿼리에 대한 상세한 설명이 생성되었습니다.",
        variant: "success"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "SQL 설명 실패",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleExplain = () => {
    if (!sql.trim()) {
      toast({
        title: "입력 오류",
        description: "설명할 SQL을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    explainMutation.mutate({ sql });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setSql(content);
        toast({
          title: "파일 업로드 완료",
          description: "SQL 파일이 성공적으로 로드되었습니다.",
        });
      };
      reader.readAsText(file);
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200';
      case 'complex':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
              <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-lg">SQL Explainer</CardTitle>
              <p className="text-sm text-muted-foreground">SQL 쿼리의 동작 원리와 최적화 방법을 상세히 설명합니다</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">분석할 SQL</label>
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
              rows={12}
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              className="form-textarea font-mono"
              placeholder={`-- 설명받고 싶은 SQL을 입력하세요
SELECT 
    p.product_name,
    SUM(s.quantity) AS total_quantity,
    AVG(s.unit_price) AS avg_price,
    SUM(s.total_amount) AS monthly_revenue,
    ROUND(
        (SUM(s.total_amount) - ly.last_year_revenue) / ly.last_year_revenue * 100, 2
    ) AS growth_rate
FROM sales s
JOIN products p ON s.product_id = p.product_id
LEFT JOIN (
    SELECT product_id, SUM(total_amount) AS last_year_revenue
    FROM sales
    WHERE sale_date BETWEEN '2022-01-01' AND '2022-03-31'
    GROUP BY product_id
) ly ON s.product_id = ly.product_id
WHERE s.sale_date BETWEEN '2023-01-01' AND '2023-03-31'
GROUP BY p.product_id, p.product_name, ly.last_year_revenue
ORDER BY monthly_revenue DESC
LIMIT 10;`}
            />
          </div>
        </CardContent>

        {/* Action Bar */}
        <div className="px-6 py-4 bg-muted/50 border-t border-border flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4 mr-1" />
            AI가 SQL의 구조와 동작을 분석하여 이해하기 쉽게 설명합니다
          </div>
          <Button 
            onClick={handleExplain}
            disabled={explainMutation.isPending}
            className="btn-primary"
          >
            {explainMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                분석중...
              </>
            ) : (
              <>
                <Lightbulb className="h-4 w-4 mr-2" />
                SQL 설명하기
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Results Section */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Explanation */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                  쿼리 개요
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {result.explanation}
                </p>
              </CardContent>
            </Card>

            {/* Detailed Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">상세 분석</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.breakdown.map((item, index) => (
                  <div key={index} className="border-l-4 border-primary/30 pl-4">
                    <h4 className="font-semibold text-foreground mb-2">{item.section}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Performance Suggestions */}
            {result.performance.suggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-emerald-600" />
                    성능 최적화 제안
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {result.performance.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-sm text-muted-foreground leading-relaxed">
                          {suggestion}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Analysis Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">분석 요약</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">복잡도</span>
                  <Badge className={getComplexityColor(result.complexity)}>
                    {result.complexity === 'simple' ? '간단' : 
                     result.complexity === 'medium' ? '중간' : '복잡'}
                  </Badge>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">성능 점수</span>
                    <span className="text-sm font-medium text-foreground">
                      {result.performance.rating}/10
                    </span>
                  </div>
                  <Progress 
                    value={result.performance.rating * 10} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">추가 작업</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
                  성능 최적화하기
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2 text-emerald-500" />
                  학습 자료 보기
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
