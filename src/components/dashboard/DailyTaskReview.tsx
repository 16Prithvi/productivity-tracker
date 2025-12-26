import { useTasks } from '@/hooks/useTasks';
import { RotateCcw, X, Check, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusColors = {
  completed: 'bg-success/20 text-success',
  in_progress: 'bg-primary/20 text-primary',
  pending: 'bg-muted text-foreground-muted',
  skipped: 'bg-warning/20 text-warning',
};

export function DailyTaskReview() {
  const { tasks, updateTask } = useTasks();

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter((t) => t.scheduled_date === today);

  const completedCount = todayTasks.filter((t) => t.status === 'completed').length;
  const skippedCount = todayTasks.filter((t) => t.status === 'skipped').length;
  const pendingCount = todayTasks.filter((t) => t.status === 'pending').length;

  const handleReschedule = async (taskId: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await updateTask(taskId, {
      scheduled_date: tomorrow.toISOString().split('T')[0],
      status: 'pending',
    });
  };

  const handleMarkSkipped = async (taskId: string) => {
    await updateTask(taskId, { status: 'skipped' });
  };

  const handleMarkCompleted = async (taskId: string) => {
    await updateTask(taskId, { status: 'completed' });
  };

  if (todayTasks.length === 0) return null;

  return (
    <div className="card-hover p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Today's Review</h3>
          <p className="text-sm text-foreground-muted">
            {completedCount} completed • {pendingCount} pending • {skippedCount} skipped
          </p>
        </div>
      </div>

      <div className="space-y-2 max-h-[280px] overflow-y-auto">
        {todayTasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl transition-colors',
              task.status === 'completed' && 'bg-success/5',
              task.status === 'skipped' && 'bg-warning/5',
              task.status === 'pending' && 'bg-secondary'
            )}
          >
            {/* Status Icon */}
            <div
              className={cn(
                'h-8 w-8 rounded-lg flex items-center justify-center shrink-0',
                statusColors[task.status as keyof typeof statusColors]
              )}
            >
              {task.status === 'completed' && <Check className="h-4 w-4" />}
              {task.status === 'skipped' && <X className="h-4 w-4" />}
              {task.status === 'pending' && <AlertTriangle className="h-4 w-4" />}
              {task.status === 'in_progress' && (
                <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  'font-medium text-foreground truncate',
                  task.status === 'completed' && 'line-through text-foreground-muted'
                )}
              >
                {task.title}
              </p>
              <p className="text-xs text-foreground-muted">
                {task.start_time} – {task.end_time}
              </p>
            </div>

            {/* Actions for pending/skipped tasks */}
            {(task.status === 'pending' || task.status === 'skipped') && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMarkCompleted(task.id)}
                  className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-success/20 text-foreground-muted hover:text-success transition-colors"
                  title="Mark completed"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleReschedule(task.id)}
                  className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-primary/20 text-foreground-muted hover:text-primary transition-colors"
                  title="Reschedule to tomorrow"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                {task.status !== 'skipped' && (
                  <button
                    onClick={() => handleMarkSkipped(task.id)}
                    className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-warning/20 text-foreground-muted hover:text-warning transition-colors"
                    title="Skip task"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
