import { useEffect, useState } from 'react';
import { Trophy, Flame, Star, Loader2 } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useFocusSessions } from '@/hooks/useFocusSessions';
import { useReviews } from '@/hooks/useReviews';
import { useAI } from '@/hooks/useAI';
import { useProfile } from '@/hooks/useProfile';

export function DailySummary() {
  const { tasks } = useTasks();
  const { getTodayFocusMinutes, getTodaySessions } = useFocusSessions();
  const { getStreak, createOrUpdateDailyReview, getTodayReview } = useReviews();
  const { generateDailySummary, loading: aiLoading } = useAI();
  const { profile } = useProfile();
  
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter((t) => t.scheduled_date === today);
  const completedTasks = todayTasks.filter((t) => t.status === 'completed');
  const skippedTasks = todayTasks.filter((t) => t.status === 'skipped');
  const focusMinutes = getTodayFocusMinutes();
  const streak = getStreak();
  const todayReview = getTodayReview();

  // Generate AI summary when day data changes
  useEffect(() => {
    if (todayReview?.ai_summary) {
      setAiSummary(todayReview.ai_summary);
    }
  }, [todayReview]);

  const handleGenerateSummary = async () => {
    if (!profile?.ai_enabled) return;

    const result = await generateDailySummary(
      completedTasks,
      getTodaySessions(),
      skippedTasks,
      streak
    );

    if (result) {
      setAiSummary(result.summary);
      
      // Save to daily review
      await createOrUpdateDailyReview({
        tasks_completed: completedTasks.length,
        tasks_skipped: skippedTasks.length,
        focus_time_minutes: focusMinutes,
        topics_covered: [...new Set(completedTasks.map((t) => t.category))],
        ai_summary: result.summary,
        streak_count: result.streak || streak,
      });
    }
  };

  return (
    <div className="card-gradient p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
      
      <div className="relative flex items-center justify-between">
        {/* Left - Summary */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Daily Achievement</h3>
          </div>
          
          <p className="text-foreground-secondary mb-4">
            {aiSummary || (
              completedTasks.length > 0
                ? `Great progress today! You completed ${completedTasks.length} task${completedTasks.length !== 1 ? 's' : ''}.`
                : "Start your day strong! Complete tasks to build momentum."
            )}
          </p>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Flame className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{streak}</p>
                <p className="text-xs text-foreground-muted">Day streak</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-success/20 flex items-center justify-center">
                <Star className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{focusMinutes}m</p>
                <p className="text-xs text-foreground-muted">Focus time</p>
              </div>
            </div>

            {profile?.ai_enabled && completedTasks.length > 0 && !aiSummary && (
              <button
                onClick={handleGenerateSummary}
                disabled={aiLoading}
                className="btn-secondary text-sm flex items-center gap-2"
              >
                {aiLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Star className="h-4 w-4" />
                )}
                Generate Summary
              </button>
            )}
          </div>
        </div>

        {/* Right - Streak Animation */}
        <div className="hidden md:flex items-center justify-center w-32 h-32">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse-glow" />
            <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-primary to-primary-muted flex items-center justify-center">
              <div className="text-center">
                <Flame className="h-8 w-8 text-primary-foreground mx-auto" />
                <p className="text-xs font-bold text-primary-foreground mt-1">{streak} days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
