import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { SqlEditor } from '@/components/SqlEditor';
import { useToast } from '@/hooks/useToast';
import { sqlApi } from '@/lib/api';
import { 
  Share2, 
  Link, 
  Copy,
  Globe,
  Lock,
  Clock,
  Users,
  Eye,
  Download,
  Send,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import type { SqlQuery } from '@shared/schema';

export default function Sharing() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedQuery, setSelectedQuery] = useState<SqlQuery | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [expirationDays, setExpirationDays] = useState('7');
  const [shareToken, setShareToken] = useState('');

  const { data: queries = [], isLoading } = useQuery({
    queryKey: ['/api/queries'],
    select: (data) => data?.filter((q: SqlQuery) => q.isFavorite) || []
  });

  const shareQueryMutation = useMutation({
    mutationFn: ({ id, options }: { id: number; options: any }) => 
      sqlApi.shareQuery(id, options),
    onSuccess: (data) => {
      setShareToken(data.shareToken);
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

  const handleShareQuery = (query: SqlQuery) => {
    setSelectedQuery(query);
    setIsShareDialogOpen(true);
    setShareToken('');
  };

  const handleGenerateShareLink = () => {
    if (!selectedQuery) return;

    const expiresIn = expirationDays === 'never' ? undefined : parseInt(expirationDays) * 24 * 60 * 60;
    
    shareQueryMutation.mutate({
      id: selectedQuery.id,
      options: {
        isPublic,
        expiresIn
      }
    });
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "링크 복사 완료",
      description: "공유 링크가 클립보드에 복사되었습니다.",
    });
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`SQL 쿼리 공유: ${selectedQuery?.naturalLanguageQuery}`);
    const body = encodeURIComponent(`안녕하세요,\n\n다음 SQL 쿼리를 공유합니다:\n\n${selectedQuery?.naturalLanguageQuery}\n\n공유 링크: [링크가 생성되면 여기에 표시됩니다]`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
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

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sharing & Collaboration</h1>
          <p className="text-muted-foreground">SQL 쿼리를 팀원들과 공유하고 협업하세요</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary">
            {queries.length}개 공유 가능한 쿼리
          </Badge>
        </div>
      </div>

      {/* Sharing Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Link className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-semibold text-sm">링크 공유</h3>
            <p className="text-xs text-muted-foreground">URL로 간편하게 공유</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-emerald-600" />
            <h3 className="font-semibold text-sm">팀 협업</h3>
            <p className="text-xs text-muted-foreground">팀원과 실시간 협업</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <h3 className="font-semibold text-sm">만료 설정</h3>
            <p className="text-xs text-muted-foreground">보안을 위한 자동 만료</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Eye className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <h3 className="font-semibold text-sm">접근 제어</h3>
            <p className="text-xs text-muted-foreground">공개/비공개 설정</p>
          </CardContent>
        </Card>
      </div>

      {/* Shareable Queries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">공유 가능한 쿼리</CardTitle>
          <p className="text-sm text-muted-foreground">즐겨찾기한 쿼리들을 팀과 공유하세요</p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 border border-border rounded-lg">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                    <div className="h-3 bg-muted/60 rounded animate-pulse w-3/4"></div>
                    <div className="h-3 bg-muted/60 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : queries.length === 0 ? (
            <div className="text-center py-12">
              <Share2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground mb-2">공유할 쿼리가 없습니다</h3>
              <p className="text-muted-foreground mb-4">
                즐겨찾기한 쿼리들이 여기에 표시됩니다.
              </p>
              <Button variant="outline">
                쿼리 히스토리에서 즐겨찾기 추가
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {queries.map((query: SqlQuery) => (
                <div key={query.id} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Query header */}
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">
                          {getQueryTypeLabel(query.queryType)}
                        </Badge>
                        <Badge className={getComplexityColor(query.complexity || 'medium')}>
                          {query.complexity === 'simple' ? '간단' : 
                           query.complexity === 'medium' ? '중간' : '복잡'}
                        </Badge>
                        <Badge variant="outline">
                          {query.database}
                        </Badge>
                      </div>

                      {/* Natural language query */}
                      <div>
                        <h3 className="font-medium text-foreground line-clamp-2">
                          {query.naturalLanguageQuery}
                        </h3>
                      </div>

                      {/* SQL preview */}
                      <div className="bg-muted/50 rounded-lg p-3">
                        <code className="text-sm font-mono text-muted-foreground line-clamp-2">
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

                    {/* Share button */}
                    <Button
                      onClick={() => handleShareQuery(query)}
                      className="ml-4"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      공유하기
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <Share2 className="h-5 w-5" />
              <span>쿼리 공유하기</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedQuery && (
            <div className="space-y-6">
              {/* Query preview */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">
                  {selectedQuery.naturalLanguageQuery}
                </h4>
                <code className="text-sm text-muted-foreground line-clamp-3">
                  {selectedQuery.generatedSql}
                </code>
              </div>

              {/* Share settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>공개 설정</Label>
                    <p className="text-sm text-muted-foreground">
                      공개로 설정하면 누구나 링크로 접근할 수 있습니다
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <Switch
                      checked={isPublic}
                      onCheckedChange={setIsPublic}
                    />
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiration">만료 기간</Label>
                  <Select value={expirationDays} onValueChange={setExpirationDays}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1일</SelectItem>
                      <SelectItem value="7">7일</SelectItem>
                      <SelectItem value="30">30일</SelectItem>
                      <SelectItem value="90">90일</SelectItem>
                      <SelectItem value="never">만료 없음</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Generate link */}
              <div className="space-y-4">
                <Button
                  onClick={handleGenerateShareLink}
                  disabled={shareQueryMutation.isPending}
                  className="w-full"
                >
                  {shareQueryMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      링크 생성중...
                    </>
                  ) : (
                    <>
                      <Link className="h-4 w-4 mr-2" />
                      공유 링크 생성
                    </>
                  )}
                </Button>

                {shareToken && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-emerald-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">공유 링크가 생성되었습니다!</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Input
                        value={`${window.location.origin}/shared/${shareToken}`}
                        readOnly
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        onClick={() => handleCopyLink(`${window.location.origin}/shared/${shareToken}`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Additional sharing options */}
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={handleEmailShare}>
                        <Send className="h-4 w-4 mr-2" />
                        이메일로 공유
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        QR 코드
                      </Button>
                    </div>

                    {/* Share info */}
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                          <p className="font-medium">공유 정보</p>
                          <ul className="mt-1 space-y-1 text-xs">
                            <li>• 접근 권한: {isPublic ? '공개' : '링크 소지자만'}</li>
                            <li>• 만료 기간: {expirationDays === 'never' ? '만료 없음' : `${expirationDays}일 후`}</li>
                            <li>• 생성일: {new Date().toLocaleString()}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
