import { useState } from 'react';
import { Plus, Target, TrendingUp } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';

const sampleGoals = [
  { id: '1', title: 'Complete 5 DSA problems', type: 'daily' as const, progress: 3, target: 5 },
  { id: '2', title: 'Study 20 hours', type: 'weekly' as const, progress: 14, target: 20 },
  { id: '3', title: 'Finish AWS course', type: 'monthly' as const, progress: 65, target: 100 },
];

const typeLabels = {
  daily: 'Today',
  weekly: 'This week',
  monthly: 'This month',
};

const typeColors = {
  daily: 'bg-category-dev',
  weekly: 'bg-category-cloud',
  monthly: 'bg-category-dsa',
};

export function GoalsPanel() {
  const { goals, addGoal, updateGoalProgress } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);

  const displayGoals = goals.length > 0 ? goals : sampleGoals;

  return (
    <div className="card-hover p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Goals</h3>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="h-8 w-8 flex items-center justify-center rounded-lg bg-secondary hover:bg-muted transition-colors"
        >
          <Plus className="h-4 w-4 text-foreground-secondary" />
        </button>
      </div>

      {/* Goals List */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {displayGoals.map((goal) => {
          const percentage = Math.round((goal.progress / goal.target) * 100);
          
          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground font-medium truncate flex-1">
                  {goal.title}
                </span>
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full ml-2',
                    typeColors[goal.type],
                    'bg-opacity-20 text-foreground-secondary'
                  )}
                >
                  {typeLabels[goal.type]}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex-1 progress-bar">
                  <div
                    className={cn('progress-bar-fill', typeColors[goal.type])}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-foreground-muted w-16 text-right">
                  {goal.progress}/{goal.target}
                </span>
              </div>

              {percentage >= 100 && (
                <div className="flex items-center gap-1 text-success">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs">Goal achieved! 🎉</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
