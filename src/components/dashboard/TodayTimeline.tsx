import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useStudyMaterials } from '@/hooks/useStudyMaterials';
import { Check, Plus, Sparkles, Lock, FileText, Link2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTo12Hour } from '@/lib/timeFormat';
import { TaskModal } from './TaskModal';
import { PlanMyDayModal } from './PlanMyDayModal';
import { FullscreenTimer } from './FullscreenTimer';

const categoryColors: Record<string, string> = {
  dsa: 'border-l-category-dsa',
  dev: 'border-l-category-dev',
  cloud: 'border-l-category-cloud',
  core: 'border-l-category-core',
  other: 'border-l-muted',
};

const categoryBarColors: Record<string, string> = {
  dsa: 'bg-category-dsa',
  dev: 'bg-category-dev',
  cloud: 'bg-category-cloud',
  core: 'bg-category-core',
  other: 'bg-muted',
};

interface TodayTimelineProps {
  showAIPlan?: boolean;
}

export function TodayTimeline({ showAIPlan = true }: TodayTimelineProps) {
  const { tasks, updateTask } = useTasks();
  const { materials } = useStudyMaterials();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [timerTask, setTimerTask] = useState<{ title: string; duration: number } | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks
    .filter((t) => t.scheduled_date === today)
    .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));

  const getLinkedMaterial = (materialId: string | null) => {
    if (!materialId) return null;
    return materials.find((m) => m.id === materialId);
  };

  const getDependentTask = (dependsOn: string | null) => {
    if (!dependsOn) return null;
    return tasks.find((t) => t.id === dependsOn);
  };

  const isBlocked = (task: typeof todayTasks[0]) => {
    if (!task.depends_on) return false;
    const dependentTask = getDependentTask(task.depends_on);
    return dependentTask?.status !== 'completed';
  };

  const handleToggleComplete = async (taskId: string, currentStatus: string | null) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    await updateTask(taskId, { status: newStatus });
  };

  const getTaskDuration = (startTime: string | null, endTime: string | null) => {
    if (!startTime || !endTime) return 30; // default 30 min
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    return (endH * 60 + endM) - (startH * 60 + startM);
  };

  const handleStartTimer = (task: typeof todayTasks[0]) => {
    const duration = getTaskDuration(task.start_time, task.end_time);
    setTimerTask({ title: task.title, duration });
    setIsTimerOpen(true);
  };

  // Generate time header slots
  const timeSlots = ['9:00 am', '10:30 am', '11:00 am', '12:00 pm'];

  return (
    <div className="card-hover p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Today's Timeline</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="h-9 px-4 flex items-center gap-2 rounded-lg bg-secondary text-foreground-secondary text-sm font-medium hover:bg-muted transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
          {showAIPlan && (
            <button
              onClick={() => setIsPlanModalOpen(true)}
              className="h-9 px-4 flex items-center gap-2 rounded-lg bg-warning/10 text-warning text-sm font-medium hover:bg-warning/20 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              AI Plan My Day
            </button>
          )}
        </div>
      </div>

      {/* Time header row */}
      <div className="flex items-center gap-4 mb-4 pl-20 text-sm text-foreground-muted font-medium">
        {timeSlots.map((time) => (
          <span key={time} className="flex-1">{time}</span>
        ))}
      </div>

      {/* Tasks */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {todayTasks.map((task, index) => {
          const linkedMaterial = getLinkedMaterial(task.study_material_id);
          const dependentTask = getDependentTask(task.depends_on);
          const isCompleted = task.status === 'completed';
          const blocked = isBlocked(task);
          const duration = getTaskDuration(task.start_time, task.end_time);

          return (
            <div
              key={task.id}
              className={cn(
                'relative flex items-start gap-4 p-4 rounded-xl border-l-4 transition-all duration-200',
                categoryColors[task.category] || 'border-l-muted',
                blocked && 'bg-warning/5 border-dashed',
                isCompleted && 'bg-background-secondary opacity-60',
                !isCompleted && !blocked && 'bg-secondary hover:bg-muted'
              )}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              {/* Time */}
              <div className="text-sm text-foreground-muted w-16 shrink-0 pt-1 font-medium">
                {formatTo12Hour(task.start_time)}
              </div>

              {/* Main content area */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  {/* Left - Task Info */}
                  <div className="flex-1 min-w-0">
                    {blocked && (
                      <div className="flex items-center gap-2 text-warning text-sm mb-2">
                        <Lock className="h-4 w-4" />
                        <span className="font-medium">Blocked</span>
                        <span className="text-foreground-muted">({formatTo12Hour(task.start_time)} – {formatTo12Hour(task.end_time)})</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      {/* Checkbox */}
                      <button
                        onClick={() => handleToggleComplete(task.id, task.status)}
                        disabled={blocked}
                        className={cn(
                          'h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-colors shrink-0',
                          isCompleted ? 'bg-success border-success' : 'border-border hover:border-primary',
                          blocked && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        {isCompleted && <Check className="h-4 w-4 text-success-foreground" />}
                      </button>
                      <div className="min-w-0">
                        <p className={cn(
                          'font-semibold text-foreground',
                          isCompleted && 'line-through text-foreground-muted'
                        )}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-sm text-foreground-muted mt-0.5">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right - Icons - BIGGER */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="w-10 h-10 rounded-xl bg-category-cloud/20 flex items-center justify-center text-lg cursor-pointer hover:bg-category-cloud/30 transition-colors" title="Resources">
                        📦
                      </span>
                      <span className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center text-lg cursor-pointer hover:bg-warning/30 transition-colors" title="High Priority">
                        🔥
                      </span>
                      {/* Clock icon - starts fullscreen timer */}
                      <button 
                        onClick={() => handleStartTimer(task)}
                        disabled={blocked || isCompleted}
                        className={cn(
                          "w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center cursor-pointer hover:bg-primary/30 transition-colors",
                          (blocked || isCompleted) && "opacity-50 cursor-not-allowed"
                        )}
                        title={`Start ${duration}min timer`}
                      >
                        <Clock className="h-5 w-5 text-primary" />
                      </button>
                      <span className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg cursor-pointer hover:bg-muted/80 transition-colors" title="More">
                        ❓
                      </span>
                    </div>
                  </div>
                </div>

                {/* Indicators */}
                <div className="flex items-center gap-3 mt-3">
                  {linkedMaterial && (
                    <span className="text-sm text-primary flex items-center gap-1.5 bg-primary/10 px-2 py-1 rounded-lg" title={linkedMaterial.title}>
                      <FileText className="h-4 w-4" />
                      {linkedMaterial.title.slice(0, 25)}
                    </span>
                  )}
                  {dependentTask && (
                    <span className="text-sm text-foreground-muted flex items-center gap-1.5 bg-muted px-2 py-1 rounded-lg" title={`Depends on: ${dependentTask.title}`}>
                      <Link2 className="h-4 w-4" />
                      Depends on task
                    </span>
                  )}
                  {/* Duration badge */}
                  <span className="text-xs text-foreground-muted bg-muted px-2 py-1 rounded-lg">
                    {duration}min
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Special blocks like Lunch */}
        {todayTasks.length > 0 && (
          <div className="flex items-center gap-4 p-4 rounded-xl bg-success/80">
            <div className="text-sm text-success-foreground w-16 shrink-0 font-medium">12:00 pm</div>
            <div className="flex-1">
              <p className="font-semibold text-success-foreground">Lunch</p>
            </div>
          </div>
        )}

        {todayTasks.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-foreground-muted py-12">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-foreground-muted" />
            </div>
            <p className="text-lg mb-2">No tasks for today</p>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="text-sm text-primary hover:underline"
            >
              Add your first task
            </button>
          </div>
        )}
      </div>

      <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
      <PlanMyDayModal isOpen={isPlanModalOpen} onClose={() => setIsPlanModalOpen(false)} />
      
      {/* Fullscreen Timer */}
      <FullscreenTimer
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        taskTitle={timerTask?.title || ''}
        durationMinutes={timerTask?.duration || 30}
      />
    </div>
  );
}
