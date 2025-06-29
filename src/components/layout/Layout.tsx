import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  FileText,
  Mic,
  Plus,
  Menu,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);

  // Salvar preferência do usuário no localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-expanded');
    if (saved !== null) {
      setIsExpanded(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', JSON.stringify(isExpanded));
  }, [isExpanded]);

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

  const SidebarItem = ({ item, isActive }: { item: any; isActive: boolean }) => {
    const Icon = item.icon;

    const buttonContent = (
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
          "transition-all duration-300 group relative",
          isExpanded ? "w-full justify-start h-12" : "w-12 h-12 justify-center p-0",
          isActive
            ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 font-semibold shadow-sm border border-blue-200/50 dark:from-blue-900/20 dark:to-purple-900/20 dark:text-blue-300 dark:border-blue-700/50"
            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:scale-105"
        )}
        asChild
      >
        <Link to={item.href}>
          <Icon className={cn("h-5 w-5 transition-all", isExpanded ? "mr-3" : "mr-0")} />
          {isExpanded && (
            <span className="truncate">{item.name}</span>
          )}
        </Link>
      </Button>
    );

    if (!isExpanded) {
      return (
        <TooltipProvider>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              {buttonContent}
            </TooltipTrigger>
            <TooltipContent side="right" className="ml-2">
              <p>{item.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return buttonContent;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/80 transition-all duration-300 ease-in-out",
        isExpanded ? "w-72" : "w-20"
      )}>
        <div className="flex h-full flex-col">
          {/* Header com Logo e Toggle */}
          <div className="flex items-center justify-between border-b border-slate-200/80 px-4 py-6 dark:border-slate-700/80">
            <div className={cn("flex items-center transition-all duration-300", isExpanded ? "opacity-100" : "opacity-0 w-0")}>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                <Mic className="h-6 w-6 text-white" />
              </div>
              {isExpanded && (
                <div className="ml-4">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent dark:from-white dark:to-slate-300">
                    Smart Meeting
                  </h1>
                </div>
              )}
            </div>

            {/* Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "h-10 w-10 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 group",
                !isExpanded && "mx-auto"
              )}
            >
              {isExpanded ? (
                <ChevronLeft className="h-5 w-5 text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200 transition-colors" />
              ) : (
                <Menu className="h-5 w-5 text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200 transition-colors" />
              )}
            </Button>
          </div>

          {/* Quick Action */}
          <div className={cn("p-4 transition-all duration-300", !isExpanded && "px-2")}>
            {isExpanded ? (
              <Button asChild className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                <Link to="/new-meeting">
                  <Plus className="mr-2 h-5 w-5" />
                  Nova Reunião
                </Link>
              </Button>
            ) : (
              <TooltipProvider>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <Button asChild className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 p-0">
                      <Link to="/new-meeting">
                        <Plus className="h-5 w-5" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="ml-2">
                    <p>Nova Reunião</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Navigation */}
          <nav className={cn("flex-1 space-y-2 transition-all duration-300", isExpanded ? "px-4" : "px-2")}>
            {isExpanded && (
              <div className="mb-6 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 transition-opacity duration-300">
                Navegação
              </div>
            )}
            {navigation.map((item) => {
              const isActive = item.paths.includes(location.pathname);
              return (
                <SidebarItem key={item.id} item={item} isActive={isActive} />
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn("transition-all duration-300", isExpanded ? "ml-72" : "ml-20")}>
        {/* Header */}
        <header className="border-b border-slate-200/80 bg-white/60 backdrop-blur-xl px-8 py-6 dark:border-slate-700/80 dark:bg-slate-900/60">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {pageInfo.name}
            </h2>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              {pageInfo.subtitle}
            </p>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 