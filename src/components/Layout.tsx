import { Info, Home, Code, Search, Database, Moon, Sun } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/xss', label: 'XSS', icon: Code },
  { path: '/sql', label: 'SQL', icon: Database },
  { path: '/osint', label: 'OSINT', icon: Search },
  { path: '/about', label: 'О проекте', icon: Info },
];

export function Layout({ children, theme, onThemeToggle }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Верхняя панель с названием и кнопкой темы */}
      <header className="glass border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">WebSec Academy</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={onThemeToggle} aria-label="Переключить тему">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Основной контент */}
      <main className="flex-1">{children}</main>

      {/* Нижнее меню */}
      <footer className="glass border-t border-border/50 py-4">
        <nav className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  asChild
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  className={isActive ? 'gradient-primary' : ''}
                >
                  <Link to={item.path}>
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </div>
        </nav>

        {/* Копирайт */}
        <div className="text-center text-sm text-gray-500 mt-3">
          © 2025 Promaster Development
        </div>
      </footer>
    </div>
  );
}
