import { useState, useEffect } from 'react';
import { Coffee, Activity, Eye, Footprints, Droplets } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { cn } from '@/lib/utils';

interface SmartBreakSuggestionProps {
  focusMinutes: number;
  isActive: boolean;
}

const lightBreaks = [
  { icon: Activity, text: 'Take a quick stretch', emoji: '🧘' },
  { icon: Droplets, text: 'Drink some water', emoji: '💧' },
  { icon: Eye, text: 'Rest your eyes', emoji: '👀' },
];

const heavyBreaks = [
  { icon: Footprints, text: 'Take a short walk', emoji: '🚶' },
  { icon: Coffee, text: 'Grab a coffee break', emoji: '☕' },
  { icon: Eye, text: 'Look at something far away', emoji: '🌲' },
];

export function SmartBreakSuggestion({ focusMinutes, isActive }: SmartBreakSuggestionProps) {
  const { profile } = useProfile();
  const [suggestion, setSuggestion] = useState<typeof lightBreaks[0] | null>(null);

  useEffect(() => {
    if (!profile?.smart_breaks_enabled) {
      setSuggestion(null);
      return;
    }

    if (!isActive && focusMinutes > 0) {
      // Just finished a focus session
      if (focusMinutes >= 60) {
        const randomBreak = heavyBreaks[Math.floor(Math.random() * heavyBreaks.length)];
        setSuggestion(randomBreak);
      } else if (focusMinutes >= 25) {
        const randomBreak = lightBreaks[Math.floor(Math.random() * lightBreaks.length)];
        setSuggestion(randomBreak);
      }
    }
  }, [focusMinutes, isActive, profile?.smart_breaks_enabled]);

  if (!suggestion || !profile?.smart_breaks_enabled) return null;

  const Icon = suggestion.icon;

  return (
    <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            {suggestion.emoji} {suggestion.text}
          </p>
          <p className="text-xs text-foreground-muted">
            {focusMinutes >= 60 ? 'You deserve a proper break!' : 'Quick break suggestion'}
          </p>
        </div>
        <button
          onClick={() => setSuggestion(null)}
          className="text-xs text-foreground-muted hover:text-foreground transition-colors"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
