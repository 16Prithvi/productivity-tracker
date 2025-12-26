import { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, Clock, Target, Lightbulb } from 'lucide-react';
import { useReviews } from '@/hooks/useReviews';
import { useTasks } from '@/hooks/useTasks';
import { useFocusSessions } from '@/hooks/useFocusSessions';
import { cn } from '@/lib/utils';

export function WeeklyReview() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { weeklyReviews, dailyReviews } = useReviews();
  const { tasks } = useTasks();
  const { sessions } = useFocusSessions();

  // Calculate weekly stats
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStartStr = weekStart.toISOString().split('T')[0];

  const weekTasks = tasks.filter((t) => t.scheduled_date && t.scheduled_date >= weekStartStr);
  const completedThisWeek = weekTasks.filter((t) => t.status === 'completed').length;
  const plannedThisWeek = weekTasks.length;

  const weekSessions = sessions.filter((s) => s.started_at >= weekStartStr);
  const totalFocusHours = Math.round(
    weekSessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0) / 60
  );

  // Find most productive day
  const dayStats: Record<string, number> = {};
  weekTasks.forEach((t) => {
    if (t.status === 'completed' && t.scheduled_date) {
      const day = new Date(t.scheduled_date).toLocaleDateString('en-US', { weekday: 'long' });
      dayStats[day] = (dayStats[day] || 0) + 1;
    }
  });
  const mostProductiveDay =
    Object.entries(dayStats).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Not enough data';

  // Get latest weekly review suggestion
  const latestWeeklyReview = weeklyReviews[0];

  return (
    <div className="card-hover overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-foreground">Weekly Review</h3>
            <p className="text-sm text-foreground-muted">
              {totalFocusHours}h focus • {completedThisWeek}/{plannedThisWeek} tasks
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-foreground-secondary" />
        ) : (
          <ChevronDown className="h-5 w-5 text-foreground-secondary" />
        )}
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-4 animate-in slide-in-from-top-2">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-secondary">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground-secondary">Focus Hours</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{totalFocusHours}h</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-success" />
                <span className="text-sm text-foreground-secondary">Tasks Done</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {completedThisWeek}/{plannedThisWeek}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-secondary">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-warning" />
                <span className="text-sm text-foreground-secondary">Best Day</span>
              </div>
              <p className="text-lg font-bold text-foreground truncate">{mostProductiveDay}</p>
            </div>
          </div>

          {/* AI Suggestion */}
          {latestWeeklyReview?.ai_suggestion && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">AI Suggestion</p>
                  <p className="text-sm text-foreground-secondary">
                    {latestWeeklyReview.ai_suggestion}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
