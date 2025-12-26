import { Flame } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useReviews } from '@/hooks/useReviews';

export function DailyAchievement() {
  const { tasks } = useTasks();
  const { getStreak, getTodayReview } = useReviews();

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter((t) => t.scheduled_date === today);
  const completedToday = todayTasks.filter((t) => t.status === 'completed').length;
  
  const streakCount = getStreak();
  const hasStartedToday = completedToday > 0;

  return (
    <div className="card-hover p-5 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-foreground mb-4">Daily Achievement</h3>
      
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Flame className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-4xl font-bold text-foreground">{streakCount || 1}</p>
            <p className="text-sm text-foreground-muted">Day streak</p>
          </div>
        </div>
        
        <div className="w-full p-3 rounded-xl bg-secondary text-center">
          {hasStartedToday ? (
            <p className="text-sm text-foreground">
              Great job! You've completed {completedToday} task{completedToday !== 1 ? 's' : ''} today!
            </p>
          ) : (
            <p className="text-sm text-foreground-muted">
              Start your first task to begin your streak!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}