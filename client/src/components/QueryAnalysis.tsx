import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Lightbulb, FileCode, Share2, Bookmark } from 'lucide-react';

interface QueryAnalysisProps {
  analysis?: {
    complexity: 'simple' | 'medium' | 'complex';
    estimatedExecutionTime: number;
    usedTables: string[];
    suggestions: string[];
  };
  onSave?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
}

export function QueryAnalysis({ 
  analysis, 
  onSave, 
  onShare, 
  onBookmark 
}: QueryAnalysisProps) {
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
    <div className="space-y-6">
      {/* Query Analysis */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
              <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-base">AI 분석</CardTitle>
              <p className="text-sm text-muted-foreground">쿼리 복잡도 및 최적화 제안</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis ? (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">복잡도</span>
                  <Badge className={getComplexityColor(analysis.complexity)}>
                    {analysis.complexity === 'simple' ? '간단' : 
                     analysis.complexity === 'medium' ? '중간' : '복잡'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">예상 실행 시간</span>
                  <span className="text-sm font-medium text-foreground">
                    ~{analysis.estimatedExecutionTime / 1000}초
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">사용된 테이블</span>
                  <span className="text-sm font-medium text-foreground">
                    {analysis.usedTables.length}개
                  </span>
                </div>
              </div>
              
              {analysis.suggestions.length > 0 && (
                <div className="pt-3 border-t border-border">
                  <h4 className="text-sm font-medium text-foreground mb-2">최적화 제안</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {analysis.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>SQL을 생성하면 AI 분석 결과가 표시됩니다</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">내보내기 및 공유</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={onSave}
          >
            <FileCode className="h-4 w-4 mr-2 text-blue-500" />
            SQL 파일로 저장
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={onShare}
          >
            <Share2 className="h-4 w-4 mr-2 text-emerald-500" />
            팀과 공유하기
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={onBookmark}
          >
            <Bookmark className="h-4 w-4 mr-2 text-purple-500" />
            즐겨찾기 추가
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
