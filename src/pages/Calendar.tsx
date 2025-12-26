import { useState } from 'react';
import { ChevronLeft, ChevronRight, Globe, BarChart3, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTo12Hour, formatHourTo12Hour } from '@/lib/timeFormat';
import { useTasks } from '@/hooks/useTasks';
import { AppLayout, Header } from '@/components/layout';
import { WeeklyActivityChart } from '@/components/dashboard';

type ViewMode = 'day' | 'week' | 'month';

const HOURS = Array.from({ length: 19 }, (_, i) => i + 5); // 05:00 to 23:00
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const categoryColors: Record<string, string> = {
  dsa: 'bg-category-dsa',
  dev: 'bg-category-dev',
  cloud: 'bg-category-cloud',
  core: 'bg-category-core',
  other: 'bg-muted',
  DSA: 'bg-category-dsa',
  Development: 'bg-category-dev',
  Cloud: 'bg-category-cloud',
  'Core Subjects': 'bg-category-core',
};

const Calendar = () => {
  const { tasks } = useTasks();
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showWeeklyActivity, setShowWeeklyActivity] = useState(false);
  const [selectedDayTasks, setSelectedDayTasks] = useState<typeof tasks | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get week dates
  const getWeekDates = () => {
    const start = new Date(currentDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  };

  const weekDates = getWeekDates();

  // Get month days
  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay() || 7; // Monday = 1

    const days: (Date | null)[] = [];
    
    // Add empty cells for days before the first day
    for (let i = 1; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getCurrentHourPosition = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const startHour = 5;
    return ((hours - startHour) * 60 + minutes) / 60;
  };

  const getTaskPosition = (task: typeof tasks[0]) => {
    if (!task.start_time || !task.end_time) {
      return { top: '0px', height: '64px' };
    }
    const [startHour, startMin] = task.start_time.split(':').map(Number);
    const [endHour, endMin] = task.end_time.split(':').map(Number);
    const startOffset = (startHour - 5) * 60 + startMin;
    const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    return {
      top: `${(startOffset / 60) * 64}px`,
      height: `${Math.max((duration / 60) * 64, 40)}px`,
    };
  };

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter((t) => t.scheduled_date === dateStr);
  };

  const handleDayClick = (date: Date) => {
    const dayTasks = getTasksForDate(date);
    setSelectedDate(date);
    setSelectedDayTasks(dayTasks);
  };

  const formatMonthYear = () => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <AppLayout>
      <Header title="Calendar" />
      
      <div className="flex h-[calc(100vh-90px)]">
        {/* Left Sidebar */}
        <div className="w-72 border-r border-border-subtle p-6 flex flex-col">
          {/* Mini Calendar */}
          <div className="card-hover p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex gap-1">
                <button
                  onClick={() => navigateDate('prev')}
                  className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-secondary transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 text-foreground-secondary" />
                </button>
                <button
                  onClick={() => navigateDate('next')}
                  className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-secondary transition-colors"
                >
                  <ChevronRight className="h-4 w-4 text-foreground-secondary" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div key={day} className="text-xs text-foreground-muted py-1">{day}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {getMonthDays().map((date, index) => {
                const isToday = date?.toDateString() === new Date().toDateString();
                const isSelected = date?.toDateString() === currentDate.toDateString();
                const hasTasks = date && getTasksForDate(date).length > 0;
                
                return (
                  <button
                    key={index}
                    onClick={() => date && handleDayClick(date)}
                    disabled={!date}
                    className={cn(
                      'h-7 w-7 flex items-center justify-center rounded-lg text-sm transition-colors relative',
                      !date && 'invisible',
                      date && !isToday && !isSelected && 'hover:bg-secondary text-foreground-secondary',
                      isToday && !isSelected && 'bg-primary/20 text-primary',
                      isSelected && 'bg-primary text-primary-foreground'
                    )}
                  >
                    {date?.getDate()}
                    {hasTasks && !isSelected && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weekly Activity Toggle Button */}
          <button
            onClick={() => setShowWeeklyActivity(!showWeeklyActivity)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors mb-4',
              showWeeklyActivity
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-foreground-secondary hover:bg-muted'
            )}
          >
            <BarChart3 className="h-4 w-4" />
            Weekly Activity
          </button>

          {/* Weekly Activity Chart */}
          {showWeeklyActivity && (
            <div className="h-[280px] mb-4">
              <WeeklyActivityChart />
            </div>
          )}

          {/* Timezone */}
          <div className="mt-auto">
            <div className="flex items-center gap-2 text-foreground-secondary">
              <Globe className="h-4 w-4" />
              <span className="text-sm">
                {Intl.DateTimeFormat().resolvedOptions().timeZone} ({new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })})
              </span>
            </div>
          </div>
        </div>

        {/* Main Calendar View */}
        <div className="flex-1 flex flex-col">
          {/* Calendar Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-foreground">{formatMonthYear()}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateDate('prev')}
                  className="h-8 w-8 flex items-center justify-center rounded-lg bg-secondary hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 text-foreground-secondary" />
                </button>
                <button
                  onClick={goToToday}
                  className="px-4 py-1.5 rounded-lg bg-secondary hover:bg-muted text-sm font-medium text-foreground-secondary transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => navigateDate('next')}
                  className="h-8 w-8 flex items-center justify-center rounded-lg bg-secondary hover:bg-muted transition-colors"
                >
                  <ChevronRight className="h-4 w-4 text-foreground-secondary" />
                </button>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-secondary rounded-xl p-1">
              {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    'px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors',
                    viewMode === mode
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground-secondary hover:text-foreground'
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Week View */}
          {viewMode === 'week' && (
            <div className="flex-1 overflow-auto">
              {/* Day Headers */}
              <div className="flex border-b border-border-subtle sticky top-0 bg-background z-10">
                <div className="w-16 shrink-0" />
                {weekDates.map((date, index) => {
                  const isToday = date.toDateString() === new Date().toDateString();
                  const dayTasks = getTasksForDate(date);
                  return (
                    <div
                      key={index}
                      onClick={() => handleDayClick(date)}
                      className={cn(
                        'flex-1 py-4 text-center border-l border-border-subtle cursor-pointer hover:bg-secondary/50 transition-colors',
                        isToday && 'bg-primary/5'
                      )}
                    >
                      <p className="text-sm text-foreground-muted">{DAYS[index]}</p>
                      <p className={cn(
                        'text-2xl font-bold',
                        isToday ? 'text-primary' : 'text-foreground'
                      )}>
                        {date.getDate().toString().padStart(2, '0')}
                      </p>
                      {dayTasks.length > 0 && (
                        <p className="text-xs text-foreground-muted mt-1">{dayTasks.length} tasks</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Time Grid */}
              <div className="flex relative">
                {/* Time Column */}
                <div className="w-16 shrink-0">
                  {HOURS.map((hour) => (
                    <div key={hour} className="h-16 flex items-start justify-end pr-3 -mt-2">
                      <span className="text-xs text-foreground-muted">
                        {formatHourTo12Hour(hour)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Grid */}
                <div className="flex-1 flex relative">
                  {/* Current Time Line */}
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none"
                    style={{ top: `${getCurrentHourPosition() * 64}px` }}
                  >
                    <div className="relative flex items-center">
                      <div className="h-4 w-4 rounded-full bg-primary -ml-2 glow-primary" />
                      <div className="flex-1 h-0.5 bg-primary" />
                    </div>
                  </div>

                  {weekDates.map((date, dayIndex) => {
                    const dayTasks = getTasksForDate(date);
                    const isToday = date.toDateString() === new Date().toDateString();

                    return (
                      <div
                        key={dayIndex}
                        className={cn(
                          'flex-1 border-l border-border-subtle relative',
                          isToday && 'bg-primary/5'
                        )}
                      >
                        {/* Hour lines */}
                        {HOURS.map((hour) => (
                          <div
                            key={hour}
                            className="h-16 border-b border-border-subtle"
                          />
                        ))}

                        {/* Tasks */}
                        {dayTasks.map((task) => {
                          const position = getTaskPosition(task);
                          return (
                            <div
                              key={task.id}
                              onClick={() => handleDayClick(date)}
                              className={cn(
                                'absolute left-1 right-1 rounded-xl p-3 overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:z-10 shadow-lg',
                                categoryColors[task.category] || 'bg-muted',
                                task.status === 'completed' && 'opacity-50'
                              )}
                              style={position}
                            >
                              <p className="text-sm font-semibold text-white truncate">{task.title}</p>
                              {task.start_time && task.end_time && (
                                <p className="text-xs text-white/80 mt-0.5 font-medium">
                                  {formatTo12Hour(task.start_time)} - {formatTo12Hour(task.end_time)}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Day View */}
          {viewMode === 'day' && (
            <div className="flex-1 overflow-auto">
              <div className="flex">
                <div className="w-16 shrink-0">
                  {HOURS.map((hour) => (
                    <div key={hour} className="h-16 flex items-start justify-end pr-3 -mt-2">
                      <span className="text-xs text-foreground-muted">
                        {formatHourTo12Hour(hour)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex-1 relative">
                  {/* Current Time Line */}
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none"
                    style={{ top: `${getCurrentHourPosition() * 64}px` }}
                  >
                    <div className="relative flex items-center">
                      <div className="h-3 w-3 rounded-full bg-primary -ml-1.5 glow-primary" />
                      <div className="flex-1 h-0.5 bg-primary" />
                    </div>
                  </div>

                  {HOURS.map((hour) => (
                    <div key={hour} className="h-16 border-b border-border-subtle" />
                  ))}

                  {/* Day tasks */}
                  {getTasksForDate(currentDate).map((task) => {
                    const position = getTaskPosition(task);
                    return (
                      <div
                        key={task.id}
                        onClick={() => handleDayClick(currentDate)}
                        className={cn(
                          'absolute left-2 right-2 rounded-xl p-4 overflow-hidden cursor-pointer shadow-lg hover:scale-[1.01] transition-transform',
                          categoryColors[task.category] || 'bg-muted',
                          task.status === 'completed' && 'opacity-50'
                        )}
                        style={{
                          top: position.top,
                          height: position.height,
                        }}
                      >
                        <p className="text-base font-semibold text-white">{task.title}</p>
                        {task.start_time && task.end_time && (
                          <p className="text-sm text-white/80 font-medium mt-1">
                            {formatTo12Hour(task.start_time)} - {formatTo12Hour(task.end_time)}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Month View */}
          {viewMode === 'month' && (
            <div className="flex-1 p-6">
              <div className="grid grid-cols-7 gap-2 mb-2">
                {DAYS.map((day) => (
                  <div key={day} className="text-center text-sm text-foreground-muted py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {getMonthDays().map((date, index) => {
                  const isToday = date?.toDateString() === new Date().toDateString();
                  const dayTasks = date ? getTasksForDate(date) : [];
                  
                  return (
                    <div
                      key={index}
                      onClick={() => date && handleDayClick(date)}
                      className={cn(
                        'min-h-24 p-2 rounded-xl border border-border-subtle transition-colors',
                        date ? 'hover:bg-secondary cursor-pointer' : 'invisible',
                        isToday && 'bg-primary/10 border-primary/30'
                      )}
                    >
                      {date && (
                        <>
                          <p className={cn(
                            'text-sm font-medium mb-2',
                            isToday ? 'text-primary' : 'text-foreground-secondary'
                          )}>
                            {date.getDate()}
                          </p>
                          <div className="space-y-1.5">
                            {dayTasks.slice(0, 3).map((task) => (
                              <div
                                key={task.id}
                                className={cn(
                                  'px-2 py-1.5 rounded-lg text-xs font-medium text-white truncate',
                                  categoryColors[task.category] || 'bg-muted'
                                )}
                              >
                                {task.title}
                              </div>
                            ))}
                            {dayTasks.length > 3 && (
                              <p className="text-xs text-foreground-muted font-medium">+{dayTasks.length - 3} more</p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Task Detail Modal */}
        {selectedDayTasks !== null && selectedDate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedDayTasks(null)}>
            <div className="bg-background rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                <button
                  onClick={() => setSelectedDayTasks(null)}
                  className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4 text-foreground-secondary" />
                </button>
              </div>

              {selectedDayTasks.length === 0 ? (
                <p className="text-foreground-muted text-center py-8">No tasks scheduled for this day</p>
              ) : (
                <div className="space-y-3">
                  {selectedDayTasks.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        'p-4 rounded-xl border-l-4',
                        categoryColors[task.category] ? `border-l-4 ${categoryColors[task.category].replace('bg-', 'border-')}` : 'border-muted',
                        'bg-secondary'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className={cn(
                            'font-medium text-foreground',
                            task.status === 'completed' && 'line-through opacity-60'
                          )}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-foreground-muted mt-1">{task.description}</p>
                          )}
                          {task.start_time && task.end_time && (
                            <p className="text-xs text-foreground-secondary mt-2">
                              🕐 {formatTo12Hour(task.start_time)} - {formatTo12Hour(task.end_time)}
                            </p>
                          )}
                        </div>
                        <span className={cn(
                          'text-xs px-2 py-1 rounded-full font-medium',
                          task.status === 'completed' ? 'bg-success/20 text-success' :
                          task.status === 'in_progress' ? 'bg-primary/20 text-primary' :
                          'bg-muted text-foreground-muted'
                        )}>
                          {task.status === 'completed' ? 'Done' : task.status === 'in_progress' ? 'In Progress' : 'Pending'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded font-medium',
                          categoryColors[task.category]?.replace('bg-', 'bg-') + '/20',
                          'text-foreground-secondary'
                        )}>
                          {task.category}
                        </span>
                        {task.priority && (
                          <span className={cn(
                            'text-xs px-2 py-0.5 rounded font-medium',
                            task.priority === 'high' ? 'bg-destructive/20 text-destructive' :
                            task.priority === 'medium' ? 'bg-warning/20 text-warning' :
                            'bg-muted text-foreground-muted'
                          )}>
                            {task.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Calendar;