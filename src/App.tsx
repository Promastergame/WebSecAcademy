import About from './pages/About';
import Footer from '@/components/Footer';
import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { getSavedTheme, applyTheme, toggleTheme, Theme } from '@/lib/theme';
import Home from './pages/Home';
import SqlInjection from './pages/SqlInjection';
import Xss from './pages/Xss';
import Osint from './pages/Osint';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => {
  const [theme, setTheme] = useState<Theme>(getSavedTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Global keyboard shortcut for theme toggle (Ctrl+T)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        setTheme((prev) => toggleTheme(prev));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleThemeToggle = () => {
    setTheme((prev) => toggleTheme(prev));
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout theme={theme} onThemeToggle={handleThemeToggle}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sql" element={<SqlInjection />} />
              <Route path="/xss" element={<Xss />} />
              <Route path="/osint" element={<Osint />} />
			  <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>

            <Footer />
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
