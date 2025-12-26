import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const { profile } = useProfile();
  const { user } = useAuth();

  const userName = profile?.display_name || user?.email?.split('@')[0] || 'User';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="px-6 py-4 bg-background">
      <h1 className="text-xl font-bold text-foreground">
        {title || `${getGreeting()}, ${userName} 👋`}
      </h1>
    </header>
  );
}
