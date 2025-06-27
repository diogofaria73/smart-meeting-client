import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  FileText,
  Mic,
  Plus,
  Settings,
  HelpCircle,
  BarChart3,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navigation = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      paths: ['/', '/dashboard']
    },
    {
      id: 'meetings',
      name: 'Reuniões',
      href: '/meetings',
      icon: FileText,
      paths: ['/meetings']
    },
    {
      id: 'analytics',
      name: 'Análises',
      href: '/analytics',
      icon: BarChart3,
      paths: ['/analytics']
    }
  ];

  const getCurrentPageInfo = () => {
    const currentPath = location.pathname;

    if (currentPath.startsWith('/meeting/')) {
      return { name: 'Detalhes da Reunião', subtitle: 'Visualizar transcrição e análises' };
    }

    if (currentPath === '/new-meeting') {
      return { name: 'Nova Reunião', subtitle: 'Criar e configurar reunião' };
    }

    const page = navigation.find(nav => nav.paths.includes(currentPath));
    return {
      name: page?.name || 'Dashboard',
      subtitle: page?.name === 'Dashboard' ? 'Visão geral das suas reuniões' :
        page?.name === 'Reuniões' ? 'Gerenciar suas reuniões' :
          page?.name === 'Análises' ? 'Relatórios e insights' : ''
    };
  };

  const pageInfo = getCurrentPageInfo();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center border-b px-6 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Mic className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-foreground">
                Smart Meeting
              </h1>
              <Badge variant="secondary" className="text-xs">
                AI-Powered
              </Badge>
            </div>
          </div>

          {/* Quick Action */}
          <div className="p-6">
            <Button asChild className="w-full">
              <Link to="/new-meeting">
                <Plus className="mr-2 h-4 w-4" />
                Nova Reunião
              </Link>
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4">
            <div className="mb-4 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Menu
            </div>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = item.paths.includes(location.pathname);

              return (
                <Button
                  key={item.id}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive && "bg-secondary font-medium"
                  )}
                  asChild
                >
                  <Link to={item.href}>
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                </Button>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="border-t p-4">
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link to="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link to="/help">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Ajuda
                </Link>
              </Button>
            </div>

            <Separator className="my-4" />

            {/* User Info */}
            <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">Usuário</div>
                <Badge variant="outline" className="text-xs">
                  Plano Pro
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <header className="border-b bg-card px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {pageInfo.name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {pageInfo.subtitle}
            </p>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 