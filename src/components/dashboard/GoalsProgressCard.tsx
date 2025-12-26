import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useTasks } from '@/hooks/useTasks';
import { useFocusSessions } from '@/hooks/useFocusSessions';
import { cn } from '@/lib/utils';

const typeColors = {
  daily: 'bg-category-dev',
  weekly: 'bg-category-cloud',
  monthly: 'bg-category-dsa',
};

export function GoalsProgressCard() {
  const { goals } = useAppStore();
  const { tasks } = useTasks();
  const { sessions } = useFocusSessions();
  const [isExpanded, setIsExpanded] = useState(true);

  // Calculate real goals from data
  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.scheduled_date === today);
  const completedToday = todayTasks.filter(t => t.status === 'completed').length;
  
  // Weekly study hours calculation
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekSessions = sessions.filter(s => new Date(s.started_at) >= weekStart);
  const weeklyHours = weekSessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0) / 60;

  const displayGoals = [
    { 
      id: 'daily-tasks', 
      title: 'DSA Problems', 
      type: 'daily' as const, 
      progress: completedToday, 
      target: Math.max(todayTasks.length, 5) 
    },
    { 
      id: 'weekly-study', 
      title: 'Study Hours', 
      type: 'weekly' as const, 
      progress: Math.round(weeklyHours * 10) / 10, 
      target: 20 
    },
    ...(goals.length > 0 ? goals.slice(0, 1) : [
      { id: 'monthly-course', title: 'AWS Course', type: 'monthly' as const, progress: 65, target: 100 }
    ])
  ];

  return (
    <div className="card-hover p-4 h-full flex flex-col">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full mb-3"
      >
        <h4 className="text-sm font-semibold text-foreground">Goals</h4>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-foreground-muted" />
        ) : (
          <ChevronDown className="h-4 w-4 text-foreground-muted" />
        )}
      </button>

      {isExpanded && (
        <div className="flex-1 space-y-3">
          {displayGoals.map((goal) => {
            const percentage = Math.min(100, Math.round((goal.progress / goal.target) * 100));
            const label = goal.type === 'daily' ? 'Today' : goal.type === 'weekly' ? 'This week' : 'This month';
            
            return (
              <div key={goal.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-foreground-muted">{label}:</span>
                    <span className="text-xs font-medium text-foreground">{goal.title}</span>
                  </div>
                  <span className="text-xs text-foreground-muted">
                    {goal.progress}/{goal.target}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className={cn('progress-bar-fill', typeColors[goal.type])}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
