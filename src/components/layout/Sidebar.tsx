import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  BookOpen, 
  CheckSquare, 
  Settings,
  Zap,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/study-materials', icon: BookOpen, label: 'Study Materials' },
  { to: '/revisions', icon: CheckSquare, label: 'Revisions' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary glow-primary">
          <Zap className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">FocusFlow</h1>
          <p className="text-xs text-foreground-muted">Smart Productivity</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || 
            (item.to === '/dashboard' && location.pathname === '/');
          
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'nav-item',
                isActive && 'active'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="card-base p-4">
          <p className="text-xs text-foreground-muted mb-2">Today's Focus</p>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: '65%' }} />
          </div>
          <p className="text-xs text-foreground-secondary mt-2">6h 30m of 10h goal</p>
        </div>
      </div>
    </aside>
  );
}

