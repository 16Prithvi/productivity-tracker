import { useState, useEffect } from 'react';
import { Play, Pause, Square, RotateCcw, Sparkles } from 'lucide-react';
import { useFocusSessions } from '@/hooks/useFocusSessions';
import { useTasks } from '@/hooks/useTasks';
import { useProfile } from '@/hooks/useProfile';
import { cn } from '@/lib/utils';

interface FocusTimerProps {
  onOpenPlanModal?: () => void;
  showAIPlan?: boolean;
}

export function FocusTimer({ onOpenPlanModal, showAIPlan = false }: FocusTimerProps) {
  const { currentSession, startSession, endSession, getTodayFocusMinutes } = useFocusSessions();
  const { tasks, updateTask } = useTasks();
  const { profile } = useProfile();
  
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter((t) => t.scheduled_date === today && t.status !== 'completed');

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  // Check if task can start (dependency check)
  const canStartTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task?.depends_on) return true;
    const dependentTask = tasks.find((t) => t.id === task.depends_on);
    return dependentTask?.status === 'completed';
  };

  const getDependencyMessage = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task?.depends_on) return null;
    const dependentTask = tasks.find((t) => t.id === task.depends_on);
    if (dependentTask?.status !== 'completed') {
      return `Complete "${dependentTask?.title}" first`;
    }
    return null;
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  // Resume session on mount
  useEffect(() => {
    if (currentSession) {
      const elapsed = Math.floor(
        (Date.now() - new Date(currentSession.started_at).getTime()) / 1000
      );
      setSeconds(elapsed);
      setIsRunning(true);
      setSelectedTaskId(currentSession.task_id || null);
    }
  }, [currentSession]);

  const handleStart = async () => {
    if (selectedTaskId && !canStartTask(selectedTaskId)) {
      return;
    }

    if (!isRunning && !currentSession) {
      await startSession(selectedTaskId || undefined);
      if (selectedTaskId) {
        await updateTask(selectedTaskId, { status: 'in_progress' });
      }
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = async () => {
    setIsRunning(false);
    await endSession();
    setSeconds(0);
    setSelectedTaskId(null);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="card-hover p-4 h-full animate-in" style={{ animationDelay: '150ms' }}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-foreground-secondary">Focus Timer</h4>
        {showAIPlan && profile?.ai_enabled !== false && onOpenPlanModal && (
          <button
            onClick={onOpenPlanModal}
            className="h-6 px-2 flex items-center gap-1 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
          >
            <Sparkles className="h-3 w-3" />
            AI
          </button>
        )}
      </div>

      {/* Timer Display - Compact */}
      <div className="flex items-center gap-3 mb-2">
        <div
          className={cn(
            'h-14 w-14 rounded-full flex items-center justify-center shrink-0',
            'bg-gradient-to-br from-background-tertiary to-background-secondary',
            'border-2',
            isRunning ? 'border-primary animate-pulse' : 'border-border'
          )}
        >
          <p className="text-lg font-bold text-foreground tabular-nums">
            {formatTime(seconds)}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {!isRunning ? (
            <button
              onClick={handleStart}
              disabled={selectedTaskId ? !canStartTask(selectedTaskId) : false}
              className={cn(
                'h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors',
                selectedTaskId && !canStartTask(selectedTaskId) && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Play className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-foreground hover:bg-muted transition-colors"
            >
              <Pause className="h-4 w-4" />
            </button>
          )}

          {seconds > 0 && (
            <>
              <button
                onClick={handleStop}
                className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors"
              >
                <Square className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleReset}
                className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5 text-foreground-secondary" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Quick start tasks - Compact */}
      {!isRunning && !currentSession && todayTasks.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {todayTasks.slice(0, 2).map((task) => (
            <button
              key={task.id}
              onClick={() => setSelectedTaskId(task.id === selectedTaskId ? null : task.id)}
              disabled={!canStartTask(task.id)}
              className={cn(
                'text-[10px] px-2 py-0.5 rounded transition-colors truncate max-w-[80px]',
                task.id === selectedTaskId
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground-secondary hover:bg-muted',
                !canStartTask(task.id) && 'opacity-50 cursor-not-allowed'
              )}
              title={getDependencyMessage(task.id) || task.title}
            >
              {task.title}
            </button>
          ))}
        </div>
      )}

      {selectedTask && (
        <p className="text-[10px] text-foreground-muted mt-1 truncate">
          → {selectedTask.title}
        </p>
      )}
    </div>
  );
}