import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useTheme } from './ThemeProvider';
import { Button } from '@/components/ui/button';
import {
  Database,
  Moon,
  Sun,
  Settings,
  Bell,
  User,
  Wand2,
  ArrowLeftRight,
  Lightbulb,
  BarChart3,
  GitBranch,
  History,
  Share2,
  Activity
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  {
    id: 'generator',
    path: '/',
    label: 'SQL 생성기',
    icon: Wand2,
    badge: 'AI'
  },
  {
    id: 'transformer',
    path: '/transform',
    label: 'SQL 변환기',
    icon: ArrowLeftRight
  },
  {
    id: 'explainer',
    path: '/explain',
    label: 'SQL 설명기',
    icon: Lightbulb
  },
  {
    id: 'visualizer',
    path: '/visualize',
    label: '데이터 시각화',
    icon: BarChart3
  }
];

const managementItems = [
  {
    id: 'schema',
    path: '/schema',
    label: '스키마 관리',
    icon: GitBranch
  },
  {
    id: 'history',
    path: '/history',
    label: '쿼리 히스토리',
    icon: History
  },
  {
    id: 'sharing',
    path: '/sharing',
    label: '공유 및 협업',
    icon: Share2
  }
];

export function Layout({ children }: LayoutProps) {
  const { theme, setTheme, isDark } = useTheme();
  const [location] = useLocation();
  const [database, setDatabase] = useState('production_db');

  const isActive = (path: string) => {
    if (path === '/') return location === '/';
    return location.startsWith(path);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground antialiased">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-md border-b border-border shadow-sm sticky top-0 z-50">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary rounded-lg shadow-lg">
                  <Database className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">AI SQL Assistant</h1>
                  <p className="text-sm text-muted-foreground">Professional Database Query Tool</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Connection Status */}
              <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Connected</span>
              </div>
              
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </Button>
              
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              
              {/* User Menu */}
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="hidden md:block text-sm font-medium">개발자</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-card border-r border-border flex flex-col">
          {/* Quick Stats */}
          <div className="p-4 border-b border-border">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">127</div>
                <div className="text-xs text-muted-foreground">Queries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">15</div>
                <div className="text-xs text-muted-foreground">Tables</div>
              </div>
            </div>
          </div>
          
          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Core Features
            </div>
            
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link key={item.id} href={item.path}>
                  <Button
                    variant={active ? "secondary" : "ghost"}
                    className={`w-full justify-start ${active ? 'menu-active' : ''}`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className={`ml-auto text-xs ${active ? 'badge' : ''}`}>
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}
            
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 mt-6">
              Management
            </div>
            
            {managementItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link key={item.id} href={item.path}>
                  <Button
                    variant={active ? "secondary" : "ghost"}
                    className={`w-full justify-start ${active ? 'menu-active' : ''}`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>
          
          {/* Database Connection */}
          <div className="p-4 border-t border-border">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">DATABASE</label>
              <Select value={database} onValueChange={setDatabase}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="production_db">production_db (MySQL)</SelectItem>
                  <SelectItem value="analytics_db">analytics_db (PostgreSQL)</SelectItem>
                  <SelectItem value="test_db">test_db (SQLite)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
