import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { Badge } from '@/components/ui/badge';
import { DataVisualization } from '@/components/DataVisualization';
import { SqlEditor } from '@/components/SqlEditor';
import { useToast } from '@/hooks/useToast';
import { sqlApi } from '@/lib/api';
import { 
  BarChart3, 
  Play, 
  TrendingUp, 
  PieChart, 
  LineChart,
  Download,
  Settings,
  RefreshCw
} from 'lucide-react';

export default function DataVisualizer() {
  const { toast } = useToast();
  const [sql, setSql] = useState(`SELECT 
    MONTH(sale_date) as month,
    SUM(total_amount) as revenue,
    COUNT(*) as order_count
FROM sales 
WHERE sale_date >= '2023-01-01' 
GROUP BY MONTH(sale_date)
ORDER BY month;`);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [isExecuting, setIsExecuting] = useState(false);
  const [chartData, setChartData] = useState([
    { label: 'Jan', value: 120000 },
    { label: 'Feb', value: 190000 },
    { label: 'Mar', value: 150000 },
    { label: 'Apr', value: 220000 },
    { label: 'May', value: 280000 },
    { label: 'Jun', value: 350000 },
  ]);

  const { data: queryHistory } = useQuery({
    queryKey: ['/api/queries'],
    select: (data) => data?.slice(0, 5) || []
  });

  const handleExecuteQuery = async () => {
    if (!sql.trim()) {
      toast({
        title: "입력 오류",
        description: "실행할 SQL을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsExecuting(true);
    
    // Simulate query execution and data visualization
    setTimeout(() => {
      setIsExecuting(false);
      toast({
        title: "쿼리 실행 완료",
        description: "데이터가 성공적으로 시각화되었습니다.",
        variant: "success"
      });
      
      // Generate sample data based on query
      const sampleData = [
        { label: 'Q1', value: Math.floor(Math.random() * 100000) + 50000 },
        { label: 'Q2', value: Math.floor(Math.random() * 100000) + 50000 },
        { label: 'Q3', value: Math.floor(Math.random() * 100000) + 50000 },
        { label: 'Q4', value: Math.floor(Math.random() * 100000) + 50000 },
      ];
      setChartData(sampleData);
    }, 2000);
  };

  const handleExportChart = () => {
    toast({
      title: "차트 내보내기",
      description: "차트가 PNG 형식으로 다운로드되었습니다.",
    });
  };

  const quickQueries = [
    {
      name: "월별 매출 추이",
      sql: `SELECT 
    DATE_FORMAT(sale_date, '%Y-%m') as month,
    SUM(total_amount) as revenue
FROM sales 
WHERE sale_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
GROUP BY DATE_FORMAT(sale_date, '%Y-%m')
ORDER BY month;`,
      chartType: 'line' as const
    },
    {
      name: "제품별 판매량",
      sql: `SELECT 
    p.product_name,
    SUM(s.quantity) as total_sold
FROM sales s
JOIN products p ON s.product_id = p.product_id
GROUP BY p.product_id, p.product_name
ORDER BY total_sold DESC
LIMIT 10;`,
      chartType: 'bar' as const
    },
    {
      name: "지역별 매출 분포",
      sql: `SELECT 
    region,
    SUM(total_amount) as revenue
FROM sales s
JOIN customers c ON s.customer_id = c.customer_id
GROUP BY region
ORDER BY revenue DESC;`,
      chartType: 'pie' as const
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Data Visualization</h1>
          <p className="text-muted-foreground">SQL 쿼리 결과를 다양한 차트로 시각화하세요</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
            Connected
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-0">
        {/* SQL Input & Quick Queries */}
        <div className="xl:col-span-1 space-y-6">
          {/* SQL Input */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BarChart3 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">SQL 쿼리</CardTitle>
                  <p className="text-sm text-muted-foreground">데이터 조회 쿼리</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="chartType">차트 유형</Label>
                <Select value={chartType} onValueChange={(value: 'bar' | 'line' | 'pie') => setChartType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">
                      <div className="flex items-center">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        막대 차트
                      </div>
                    </SelectItem>
                    <SelectItem value="line">
                      <div className="flex items-center">
                        <LineChart className="h-4 w-4 mr-2" />
                        선 차트
                      </div>
                    </SelectItem>
                    <SelectItem value="pie">
                      <div className="flex items-center">
                        <PieChart className="h-4 w-4 mr-2" />
                        원형 차트
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sql">SQL 쿼리</Label>
                <Textarea
                  id="sql"
                  rows={8}
                  value={sql}
                  onChange={(e) => setSql(e.target.value)}
                  className="form-textarea font-mono text-sm"
                  placeholder="SELECT * FROM sales;"
                />
              </div>

              <Button 
                onClick={handleExecuteQuery}
                disabled={isExecuting}
                className="w-full btn-primary"
              >
                {isExecuting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    실행중...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    쿼리 실행
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Query Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">빠른 쿼리</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickQueries.map((query, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto p-3"
                  onClick={() => {
                    setSql(query.sql);
                    setChartType(query.chartType);
                  }}
                >
                  <div>
                    <div className="font-medium text-sm">{query.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {query.chartType === 'bar' ? '막대' : query.chartType === 'line' ? '선' : '원형'} 차트
                    </div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Visualization Area */}
        <div className="xl:col-span-3 space-y-6">
          {/* Chart Display */}
          <Card className="h-[500px]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base">데이터 시각화</CardTitle>
                    <p className="text-sm text-muted-foreground">쿼리 결과 차트</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportChart}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExecuteQuery}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[400px] p-4">
              <div className="w-full h-full">
                <DataVisualization
                  data={chartData}
                  type={chartType}
                  title="Query Results"
                />
              </div>
            </CardContent>
          </Card>

          {/* Query Results Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">쿼리 결과</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">기간</th>
                      <th className="text-right py-2 px-3 font-medium text-muted-foreground">매출액</th>
                      <th className="text-right py-2 px-3 font-medium text-muted-foreground">주문 수</th>
                      <th className="text-right py-2 px-3 font-medium text-muted-foreground">성장률</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.map((row, index) => (
                      <tr key={index} className="border-b border-border hover:bg-muted/50">
                        <td className="py-2 px-3 font-medium">{row.label}</td>
                        <td className="py-2 px-3 text-right">₩{row.value.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right">{Math.floor(row.value / 1000)}</td>
                        <td className="py-2 px-3 text-right text-emerald-600">
                          +{(Math.random() * 20 + 5).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Recent Queries */}
          {queryHistory && queryHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">최근 쿼리</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {queryHistory.map((query) => (
                    <div
                      key={query.id}
                      className="p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => setSql(query.generatedSql)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground line-clamp-1">
                            {query.naturalLanguageQuery}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(query.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          {query.complexity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
