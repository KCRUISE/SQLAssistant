import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

interface DataVisualizationProps {
  data?: any[];
  type?: 'bar' | 'line' | 'pie';
  title?: string;
}

export function DataVisualization({ 
  data = [], 
  type = 'bar', 
  title = 'Data Visualization' 
}: DataVisualizationProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!chartRef.current || !data.length) return;

    // Dynamically import Chart.js to avoid SSR issues
    import('chart.js/auto').then((Chart) => {
      const ctx = chartRef.current?.getContext('2d');
      if (!ctx) return;

      // Destroy existing chart if it exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      // Sample data if none provided
      const chartData = data.length > 0 ? data : [
        { label: 'Jan', value: 12000 },
        { label: 'Feb', value: 19000 },
        { label: 'Mar', value: 3000 },
        { label: 'Apr', value: 5000 },
        { label: 'May', value: 20000 },
        { label: 'Jun', value: 30000 },
      ];

      chartInstanceRef.current = new Chart.default(ctx, {
        type,
        data: {
          labels: chartData.map(item => item.label),
          datasets: [{
            label: 'Sales Revenue',
            data: chartData.map(item => item.value),
            backgroundColor: 'rgba(14, 165, 233, 0.8)',
            borderColor: 'rgba(14, 165, 233, 1)',
            borderWidth: 1,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
            },
            tooltip: {
              mode: 'index',
              intersect: false,
            },
          },
          scales: type !== 'pie' ? {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.1)',
              },
            },
            x: {
              grid: {
                color: 'rgba(0, 0, 0, 0.1)',
              },
            },
          } : {},
        },
      });
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [data, type]);

  return (
    <div className="w-full h-full">
      <canvas 
        ref={chartRef} 
        className="w-full h-full"
        style={{ maxHeight: '100%', maxWidth: '100%' }}
      />
    </div>
  );
}
