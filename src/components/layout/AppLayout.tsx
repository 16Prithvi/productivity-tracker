import { ReactNode, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { useThemeStore } from '@/stores/themeStore';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { theme } = useThemeStore();

  useEffect(() => {
    // Apply theme on mount
    const root = document.documentElement;
    if (theme === 'calm') {
      root.classList.add('theme-calm');
    } else {
      root.classList.remove('theme-calm');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
