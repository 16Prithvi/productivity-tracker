import { useState } from 'react';
import { Plus, Search, Filter, Calendar, Clock, Flag, MoreVertical, Check, Trash2 } from 'lucide-react';
import { AppLayout, Header } from '@/components/layout';
import { useAppStore, Task } from '@/stores/appStore';
import { cn } from '@/lib/utils';

const categoryColors: Record<string, string> = {
  dsa: 'bg-category-dsa',
  dev: 'bg-category-dev',
  cloud: 'bg-category-cloud',
  core: 'bg-category-core',
  other: 'bg-muted',
};

const priorityColors = {
  low: 'text-foreground-muted',
  medium: 'text-warning',
  high: 'text-destructive',
};

const sampleTasks: Task[] = [
  {
    id: '1',
    name: 'Complete Binary Tree Problems',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '11:00',
    category: 'dsa',
    priority: 'high',
    notes: 'Focus on DFS and BFS traversals',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Build React Dashboard Component',
    date: new Date().toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '16:00',
    category: 'dev',
    priority: 'medium',
    completed: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'AWS Lambda Function Setup',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '12:00',
    category: 'cloud',
    priority: 'medium',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Review Database Indexing',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    startTime: '15:00',
    endTime: '16:30',
    category: 'core',
    priority: 'low',
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

type FilterType = 'all' | 'today' | 'upcoming' | 'completed';

const Tasks = () => {
  const { tasks, toggleTaskComplete, deleteTask } = useAppStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const displayTasks = tasks.length > 0 ? tasks : sampleTasks;

  const today = new Date().toISOString().split('T')[0];

  const filteredTasks = displayTasks.filter((task) => {
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (filter) {
      case 'today':
        return matchesSearch && task.date === today;
      case 'upcoming':
        return matchesSearch && task.date > today && !task.completed;
      case 'completed':
        return matchesSearch && task.completed;
      default:
        return matchesSearch;
    }
  });

  const groupedTasks = filteredTasks.reduce((acc, task) => {
    const date = task.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const sortedDates = Object.keys(groupedTasks).sort();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const todayDate = new Date();
    const tomorrow = new Date(todayDate);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateStr === today) {
      return 'Today';
    } else if (dateStr === tomorrow.toISOString().split('T')[0]) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <AppLayout>
      <Header title="Tasks" />

      <div className="p-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2">
            {([
              { key: 'all', label: 'All Tasks' },
              { key: 'today', label: 'Today' },
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'completed', label: 'Completed' },
            ] as { key: FilterType; label: string }[]).map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                  filter === f.key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground-secondary hover:bg-muted'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="w-64 h-10 pl-10 pr-4 rounded-xl bg-secondary border border-border-subtle text-foreground text-sm placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <button className="btn-primary flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-8">
          {sortedDates.map((date) => (
            <div key={date}>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>{formatDate(date)}</span>
                <span className="text-sm font-normal text-foreground-muted">
                  ({groupedTasks[date].length} tasks)
                </span>
              </h2>

              <div className="space-y-3">
                {groupedTasks[date].map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      'card-hover p-5 flex items-center gap-4 group animate-in',
                      task.completed && 'opacity-60'
                    )}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className={cn(
                        'h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-colors shrink-0',
                        task.completed
                          ? 'bg-primary border-primary'
                          : 'border-border hover:border-primary'
                      )}
                    >
                      {task.completed && <Check className="h-4 w-4 text-primary-foreground" />}
                    </button>

                    {/* Category Indicator */}
                    <div className={cn('w-1 h-12 rounded-full', categoryColors[task.category])} />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'font-medium text-foreground',
                        task.completed && 'line-through text-foreground-muted'
                      )}>
                        {task.name}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-foreground-secondary flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {task.startTime} - {task.endTime}
                        </span>
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full capitalize',
                          categoryColors[task.category],
                          'bg-opacity-20'
                        )}>
                          {task.category}
                        </span>
                        {task.notes && (
                          <span className="text-sm text-foreground-muted truncate max-w-[200px]">
                            {task.notes}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Priority */}
                    <Flag className={cn('h-4 w-4', priorityColors[task.priority])} />

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors">
                        <MoreVertical className="h-4 w-4 text-foreground-secondary" />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-destructive/20 text-foreground-muted hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <Calendar className="h-12 w-12 text-foreground-muted mb-4" />
              <p className="text-lg font-medium text-foreground">No tasks found</p>
              <p className="text-foreground-secondary">Create a new task to get started</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Tasks;
