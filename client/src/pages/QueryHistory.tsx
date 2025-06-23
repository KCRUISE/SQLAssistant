import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SqlEditor } from '@/components/SqlEditor';
import { useToast } from '@/hooks/useToast';
import { sqlApi } from '@/lib/api';
import { 
  History, 
  Search, 
  Filter, 
  Star,
  Trash2,
  Copy,
  Share2,
  Calendar,
  Database,
  Wand2,
  ArrowLeftRight,
  Lightbulb,
  Eye
} from 'lucide-react';
import type { SqlQuery } from '@shared/schema';

export default function QueryHistory() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedQuery, setSelectedQuery] = useState<SqlQuery | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const { data: queries = [], isLoading } = useQuery({
    queryKey: ['/api/queries'],
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['/api/queries/favorites'],
  });

  const updateFavoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }: { id: number; isFavorite: boolean }) => 
      sqlApi.updateFavorite(id, isFavorite),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/queries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/queries/favorites'] });
    },
    onError: (error: Error) => {
      toast({
        title: "즐겨찾기 업데이트 실패",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteQueryMutation = useMutation({
    mutationFn: (id: number) => sqlApi.deleteQuery(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/queries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/queries/favorites'] });
      toast({
        title: "쿼리 삭제 완료",
        description: "쿼리가 성공적으로 삭제되었습니다.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "쿼리 삭제 실패",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const shareQueryMutation = useMutation({
    mutationFn: (id: number) => sqlApi.shareQuery(id, { isPublic: true }),
    onSuccess: (data) => {
      navigator.clipboard.writeText(data.shareUrl);
      toast({
        title: "공유 링크 생성 완료",
        description: "링크가 클립보드에 복사되었습니다.",
        variant: "success"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "공유 링크 생성 실패",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const filteredQueries = queries.filter((query: SqlQuery) => {
    const matchesSearch = query.naturalLanguageQuery.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         query.generatedSql.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'favorites') return matchesSearch && query.isFavorite;
    return matchesSearch && query.queryType === filterType;
  });

  const getQueryTypeIcon = (type: string) => {
    switch (type) {
      case 'generate': return <Wand2 className="h-4 w-4" />;
      case 'transform': return <ArrowLeftRight className="h-4 w-4" />;
      case 'explain': return <Lightbulb className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const getQueryTypeLabel = (type: string) => {
    switch (type) {
      case 'generate': return 'SQL 생성';
      case 'transform': return 'SQL 변환';
      case 'explain': return 'SQL 설명';
      default: return type;
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

  const handleCopyQuery = async (sql: string) => {
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
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Query History</h1>
          <p className="text-muted-foreground">이전에 생성한 SQL 쿼리를 관리하고 재사용하세요</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary">
            총 {queries.length}개 쿼리
          </Badge>
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Star className="h-3 w-3 mr-1" />
            {favorites.length}개 즐겨찾기
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="쿼리 내용으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="favorites">즐겨찾기</SelectItem>
                  <SelectItem value="generate">SQL 생성</SelectItem>
                  <SelectItem value="transform">SQL 변환</SelectItem>
                  <SelectItem value="explain">SQL 설명</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Query List */}
      <div className="flex-1 space-y-4">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-3 bg-muted/60 rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-muted/60 rounded animate-pulse w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredQueries.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchTerm || filterType !== 'all' ? '검색 결과가 없습니다' : '쿼리 히스토리가 없습니다'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || filterType !== 'all' 
                  ? '다른 검색어나 필터를 시도해보세요.' 
                  : 'SQL 생성기를 사용하여 첫 번째 쿼리를 만들어보세요.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredQueries.map((query: SqlQuery) => (
            <Card key={query.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Query header */}
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getQueryTypeIcon(query.queryType)}
                        <Badge variant="outline">
                          {getQueryTypeLabel(query.queryType)}
                        </Badge>
                      </div>
                      <Badge className={getComplexityColor(query.complexity || 'medium')}>
                        {query.complexity === 'simple' ? '간단' : 
                         query.complexity === 'medium' ? '중간' : '복잡'}
                      </Badge>
                      <Badge variant="outline">
                        <Database className="h-3 w-3 mr-1" />
                        {query.database}
                      </Badge>
                      {query.isFavorite && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                    </div>

                    {/* Natural language query */}
                    <div>
                      <h3 className="font-medium text-foreground line-clamp-2">
                        {query.naturalLanguageQuery}
                      </h3>
                    </div>

                    {/* SQL preview */}
                    <div className="bg-muted/50 rounded-lg p-3">
                      <code className="text-sm font-mono text-muted-foreground line-clamp-3">
                        {query.generatedSql}
                      </code>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(query.createdAt).toLocaleDateString()}
                      </div>
                      {query.executionTime && (
                        <div>
                          실행 시간: ~{query.executionTime / 1000}초
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedQuery(query);
                        setIsDetailDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateFavoriteMutation.mutate({
                        id: query.id,
                        isFavorite: !query.isFavorite
                      })}
                      disabled={updateFavoriteMutation.isPending}
                    >
                      <Star className={`h-4 w-4 ${query.isFavorite ? 'text-yellow-500 fill-current' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyQuery(query.generatedSql)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => shareQueryMutation.mutate(query.id)}
                      disabled={shareQueryMutation.isPending}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteQueryMutation.mutate(query.id)}
                      disabled={deleteQueryMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Query Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              {selectedQuery && getQueryTypeIcon(selectedQuery.queryType)}
              <span>쿼리 상세 정보</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedQuery && (
            <div className="space-y-6">
              {/* Query metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">타입</div>
                  <Badge variant="outline">
                    {getQueryTypeLabel(selectedQuery.queryType)}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">복잡도</div>
                  <Badge className={getComplexityColor(selectedQuery.complexity || 'medium')}>
                    {selectedQuery.complexity === 'simple' ? '간단' : 
                     selectedQuery.complexity === 'medium' ? '중간' : '복잡'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">데이터베이스</div>
                  <div className="text-sm">{selectedQuery.database}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">생성일</div>
                  <div className="text-sm">{new Date(selectedQuery.createdAt).toLocaleString()}</div>
                </div>
              </div>

              {/* Natural language query */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">자연어 질문</div>
                <div className="p-3 bg-muted/50 rounded-lg text-sm">
                  {selectedQuery.naturalLanguageQuery}
                </div>
              </div>

              {/* SQL Editor */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">생성된 SQL</div>
                <SqlEditor
                  sql={selectedQuery.generatedSql}
                  metadata={{
                    executionTime: selectedQuery.executionTime ? selectedQuery.executionTime / 1000 : undefined,
                    isValidated: true,
                    complexity: selectedQuery.complexity
                  }}
                />
              </div>

              {/* Metadata */}
              {selectedQuery.metadata && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">추가 정보</div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <pre className="text-xs text-muted-foreground overflow-auto">
                      {JSON.stringify(selectedQuery.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
