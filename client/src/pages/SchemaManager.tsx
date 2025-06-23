import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';
import { apiRequest } from '@/lib/queryClient';
import { 
  GitBranch, 
  Plus, 
  Database, 
  Table,
  FileText,
  Upload,
  Download,
  Trash2,
  Eye,
  Edit
} from 'lucide-react';

interface Schema {
  id: number;
  name: string;
  database: string;
  schemaData: any;
  createdAt: string;
}

interface TableInfo {
  name: string;
  columns: Array<{
    name: string;
    type: string;
    nullable: boolean;
    primary: boolean;
    foreign?: string;
  }>;
  indexes: string[];
}

export default function SchemaManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedSchema, setSelectedSchema] = useState<Schema | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // Form states
  const [name, setName] = useState('');
  const [database, setDatabase] = useState('MySQL');
  const [schemaData, setSchemaData] = useState('');

  const { data: schemas = [], isLoading } = useQuery({
    queryKey: ['/api/schemas'],
  });

  const createSchemaMutation = useMutation({
    mutationFn: async (data: { name: string; database: string; schemaData: any }) => {
      const response = await apiRequest('POST', '/api/schemas', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schemas'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "스키마 생성 완료",
        description: "새 스키마가 성공적으로 추가되었습니다.",
        variant: "success"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "스키마 생성 실패",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteSchemaMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/schemas/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schemas'] });
      toast({
        title: "스키마 삭제 완료",
        description: "스키마가 성공적으로 삭제되었습니다.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "스키마 삭제 실패",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setName('');
    setDatabase('MySQL');
    setSchemaData('');
  };

  const handleCreateSchema = () => {
    if (!name || !schemaData) {
      toast({
        title: "입력 오류",
        description: "모든 필드를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    try {
      const parsedData = JSON.parse(schemaData);
      createSchemaMutation.mutate({
        name,
        database,
        schemaData: parsedData
      });
    } catch (error) {
      toast({
        title: "JSON 형식 오류",
        description: "올바른 JSON 형식의 스키마 데이터를 입력해주세요.",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setSchemaData(content);
        toast({
          title: "파일 업로드 완료",
          description: "스키마 파일이 성공적으로 로드되었습니다.",
        });
      };
      reader.readAsText(file);
    }
  };

  const generateSampleSchema = () => {
    const sampleSchema = {
      tables: {
        users: {
          columns: {
            id: { type: 'INT', primary: true, autoIncrement: true },
            username: { type: 'VARCHAR(50)', nullable: false, unique: true },
            email: { type: 'VARCHAR(100)', nullable: false },
            created_at: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' }
          },
          indexes: ['idx_username', 'idx_email']
        },
        orders: {
          columns: {
            id: { type: 'INT', primary: true, autoIncrement: true },
            user_id: { type: 'INT', foreign: 'users.id' },
            total_amount: { type: 'DECIMAL(10,2)', nullable: false },
            status: { type: 'ENUM("pending","completed","cancelled")', default: 'pending' },
            created_at: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' }
          },
          indexes: ['idx_user_id', 'idx_status']
        }
      }
    };
    setSchemaData(JSON.stringify(sampleSchema, null, 2));
  };

  const renderTableInfo = (tableData: any) => {
    if (!tableData?.tables) return null;
    
    return Object.entries(tableData.tables).map(([tableName, table]: [string, any]) => (
      <div key={tableName} className="border border-border rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Table className="h-4 w-4 text-blue-600" />
          <h4 className="font-semibold text-foreground">{tableName}</h4>
        </div>
        <div className="space-y-2">
          {Object.entries(table.columns || {}).map(([colName, colInfo]: [string, any]) => (
            <div key={colName} className="flex items-center justify-between text-sm">
              <span className="font-medium">{colName}</span>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {colInfo.type}
                </Badge>
                {colInfo.primary && (
                  <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                    PK
                  </Badge>
                )}
                {colInfo.foreign && (
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                    FK
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    ));
  };

  const getDatabaseIcon = (dbType: string) => {
    switch (dbType.toLowerCase()) {
      case 'mysql': return '🐬';
      case 'postgresql': return '🐘';
      case 'sqlite': return '📄';
      case 'oracle': return '🔶';
      case 'sql server': return '🔷';
      default: return '🗄️';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Schema Manager</h1>
          <p className="text-muted-foreground">데이터베이스 스키마를 관리하고 시각화하세요</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              새 스키마
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>새 스키마 생성</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="schemaName">스키마 이름</Label>
                  <Input
                    id="schemaName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="예: ecommerce_schema"
                  />
                </div>
                <div>
                  <Label htmlFor="schemaDatabase">데이터베이스 타입</Label>
                  <Select value={database} onValueChange={setDatabase}>
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
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="schemaData">스키마 데이터 (JSON)</Label>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateSampleSchema}
                    >
                      샘플 생성
                    </Button>
                    <input
                      type="file"
                      accept=".json,.sql"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="schema-file-upload"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('schema-file-upload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      파일
                    </Button>
                  </div>
                </div>
                <Textarea
                  id="schemaData"
                  rows={12}
                  value={schemaData}
                  onChange={(e) => setSchemaData(e.target.value)}
                  className="form-textarea font-mono text-sm"
                  placeholder="JSON 형식의 스키마 데이터를 입력하세요..."
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  취소
                </Button>
                <Button 
                  onClick={handleCreateSchema}
                  disabled={createSchemaMutation.isPending}
                >
                  {createSchemaMutation.isPending ? '생성중...' : '생성'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Schema List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-muted/60 rounded animate-pulse w-2/3"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted/60 rounded animate-pulse"></div>
                  <div className="h-3 bg-muted/60 rounded animate-pulse w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : schemas.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-12">
                <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground mb-2">스키마가 없습니다</h3>
                <p className="text-muted-foreground mb-4">
                  새 스키마를 생성하여 데이터베이스 구조를 관리해보세요.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  첫 번째 스키마 생성
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          schemas.map((schema: Schema) => (
            <Card key={schema.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {getDatabaseIcon(schema.database)}
                    </div>
                    <div>
                      <CardTitle className="text-base">{schema.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{schema.database}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {Object.keys(schema.schemaData?.tables || {}).length} 테이블
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    생성일: {new Date(schema.createdAt).toLocaleDateString()}
                  </div>
                  
                  {/* Table list preview */}
                  <div className="space-y-1">
                    {Object.keys(schema.schemaData?.tables || {}).slice(0, 3).map((tableName) => (
                      <div key={tableName} className="flex items-center text-sm">
                        <Table className="h-3 w-3 mr-2 text-muted-foreground" />
                        <span className="text-foreground">{tableName}</span>
                      </div>
                    ))}
                    {Object.keys(schema.schemaData?.tables || {}).length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{Object.keys(schema.schemaData?.tables || {}).length - 3} 더 보기
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSchema(schema);
                        setIsViewDialogOpen(true);
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      보기
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3 mr-1" />
                      편집
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteSchemaMutation.mutate(schema.id)}
                      disabled={deleteSchemaMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      삭제
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Schema Detail Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <div className="text-2xl">
                {selectedSchema && getDatabaseIcon(selectedSchema.database)}
              </div>
              <div>
                <div>{selectedSchema?.name}</div>
                <div className="text-sm font-normal text-muted-foreground">
                  {selectedSchema?.database} Schema
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedSchema && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary">
                    {Object.keys(selectedSchema.schemaData?.tables || {}).length} 테이블
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    생성일: {new Date(selectedSchema.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    내보내기
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    SQL 생성
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {renderTableInfo(selectedSchema.schemaData)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
