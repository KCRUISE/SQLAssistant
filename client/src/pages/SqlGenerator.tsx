import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SqlEditor } from '@/components/SqlEditor';
import { QueryAnalysis } from '@/components/QueryAnalysis';
import { useToast } from '@/hooks/useToast';
import { sqlApi } from '@/lib/api';
import { 
  Wand2, 
  Info, 
  Save, 
  ChevronRight,
  ChevronDown 
} from 'lucide-react';
import type { GenerateSqlRequest, GenerateSqlResponse } from '@shared/schema';

export default function SqlGenerator() {
  const { toast } = useToast();
  const [naturalQuery, setNaturalQuery] = useState('');
  const [subject, setSubject] = useState('전자상거래');
  const [analysisType, setAnalysisType] = useState('트렌드 분석');
  const [database, setDatabase] = useState('MySQL');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [limit, setLimit] = useState('100');
  const [sortOrder, setSortOrder] = useState('auto');
  const [optimizationLevel, setOptimizationLevel] = useState('standard');
  const [result, setResult] = useState<GenerateSqlResponse & { queryId: number } | null>(null);

  const generateMutation = useMutation({
    mutationFn: (request: GenerateSqlRequest) => sqlApi.generateSql(request),
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "SQL 생성 완료",
        description: "자연어 질문이 SQL로 성공적으로 변환되었습니다.",
        variant: "success"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "SQL 생성 실패",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleGenerate = () => {
    if (!naturalQuery.trim()) {
      toast({
        title: "입력 오류",
        description: "자연어 질문을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    const request: GenerateSqlRequest = {
      naturalLanguageQuery: naturalQuery,
      database,
      subject,
      analysisType,
      options: {
        limit: parseInt(limit) || undefined,
        sortOrder: sortOrder as any,
        optimizationLevel: optimizationLevel as any
      }
    };

    generateMutation.mutate(request);
  };

  const handleSaveTemplate = () => {
    toast({
      title: "템플릿 저장",
      description: "현재 설정이 템플릿으로 저장되었습니다.",
      variant: "success"
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Wand2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">AI SQL Generator</CardTitle>
              <p className="text-sm text-muted-foreground">자연어로 SQL 쿼리를 생성하세요</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subject" className="flex items-center pt-[5px] pb-[5px]">
                📊 주제 영역
              </Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="전자상거래">🛒 전자상거래</SelectItem>
                  <SelectItem value="금융서비스">💰 금융 서비스</SelectItem>
                  <SelectItem value="인사관리">👥 인사 관리</SelectItem>
                  <SelectItem value="마케팅분석">📊 마케팅 분석</SelectItem>
                  <SelectItem value="헬스케어">🏥 헬스케어</SelectItem>
                  <SelectItem value="교육">🎓 교육</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="analysisType" className="flex items-center pt-[5px] pb-[5px]">
                🎯 분석 유형
              </Label>
              <Select value={analysisType} onValueChange={setAnalysisType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="트렌드 분석">📈 트렌드 분석</SelectItem>
                  <SelectItem value="고객 세분화">🎯 고객 세분화</SelectItem>
                  <SelectItem value="성과 분석">💹 성과 분석</SelectItem>
                  <SelectItem value="이상 탐지">🔍 이상 탐지</SelectItem>
                  <SelectItem value="집계 분석">📊 집계 분석</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="naturalQuery" className="flex items-center pt-[5px] pb-[5px]">
              💬 자연어 질문
            </Label>
            <div className="relative">
              <Textarea
                id="naturalQuery"
                rows={4}
                value={naturalQuery}
                onChange={(e) => setNaturalQuery(e.target.value)}
                className="form-textarea"
                placeholder="예: 지난 3개월 동안 월별 매출이 가장 높은 상위 10개 제품과 각 제품의 판매량, 평균 단가를 조회하고 싶어요. 또한 전년 동기 대비 성장률도 함께 보여주세요."
              />
              <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                <span className={naturalQuery.length > 500 ? 'text-destructive' : ''}>
                  {naturalQuery.length}
                </span>/500
              </div>
            </div>
          </div>
          
          {/* Advanced Options */}
          <div className="border-t border-border pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center text-primary hover:text-primary/80"
            >
              {showAdvanced ? (
                <ChevronDown className="h-4 w-4 mr-2" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-2" />
              )}
              고급 옵션
            </Button>
            {showAdvanced && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="limit">결과 제한</Label>
                    <Input
                      id="limit"
                      type="number"
                      value={limit}
                      onChange={(e) => setLimit(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sortOrder">정렬 방식</Label>
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">자동</SelectItem>
                        <SelectItem value="asc">오름차순</SelectItem>
                        <SelectItem value="desc">내림차순</SelectItem>
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
              </div>
            )}
          </div>
        </CardContent>

        {/* Action Bar */}
        <div className="px-6 py-4 bg-muted/50 border-t border-border flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <Info className="h-4 w-4 mr-1" />
            AI가 자연어를 분석하여 최적화된 SQL을 생성합니다
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" onClick={handleSaveTemplate}>
              <Save className="h-4 w-4 mr-2" />
              템플릿 저장
            </Button>
            <Button 
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              className="btn-primary"
            >
              {generateMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  생성중...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  SQL 생성하기
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Results Section */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Generated SQL */}
          <div className="lg:col-span-2">
            <SqlEditor
              sql={result.sql}
              isLoading={generateMutation.isPending}
              metadata={{
                executionTime: result.estimatedExecutionTime / 1000,
                isValidated: true,
                complexity: result.complexity
              }}
            />
          </div>

          {/* AI Analysis & Actions */}
          <div>
            <QueryAnalysis
              analysis={{
                complexity: result.complexity,
                estimatedExecutionTime: result.estimatedExecutionTime,
                usedTables: result.usedTables,
                suggestions: result.suggestions
              }}
              onSave={() => toast({ title: "저장 완료", description: "SQL이 저장되었습니다." })}
              onShare={() => toast({ title: "공유 링크 생성", description: "공유 가능한 링크가 생성되었습니다." })}
              onBookmark={() => toast({ title: "즐겨찾기 추가", description: "즐겨찾기에 추가되었습니다." })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
