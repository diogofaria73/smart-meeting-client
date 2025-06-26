import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Mic } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navigation = [
    { id: 'dashboard', name: 'Início', href: '/dashboard', icon: Home, paths: ['/', '/dashboard'] },
    { id: 'meetings', name: 'Reuniões', href: '/meetings', icon: FileText, paths: ['/meetings'] }
  ];

  const getCurrentPageName = () => {
    const currentPath = location.pathname;

    // Check for meeting detail pages
    if (currentPath.startsWith('/meeting/')) {
      return 'Detalhes da Reunião';
    }

    // Check for new meeting page
    if (currentPath === '/new-meeting') {
      return 'Nova Reunião';
    }

    // Find matching navigation item
    const page = navigation.find(nav => nav.paths.includes(currentPath));
    return page?.name || 'Início';
  };

  return (
    <div className="min-h-screen main-content">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 w-64 h-screen sidebar-clean">
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Smart Meeting
              </h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1 flex-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = item.paths.includes(location.pathname);

              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <header className="px-8 py-6 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-title">
                {getCurrentPageName()}
              </h2>
              <p className="text-caption mt-1">
                {new Date().toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 