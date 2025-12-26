import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PlanScheduleItem {
  title: string;
  start: string;
  end: string;
  category: string;
  priority: string;
  notes: string;
}

interface DailyPlanResponse {
  schedule: PlanScheduleItem[];
  summary: string;
}

interface DailySummaryResponse {
  summary: string;
  topicsLearned: string[];
  improvement: string;
  streak: number;
}

export function useAI() {
  const [loading, setLoading] = useState(false);

  const generateDailyPlan = async (
    userInput: string,
    existingTasks: any[],
    preferences: { focusDuration: number; breakDuration: number },
    availableFrom?: string,
    unavailableSlots?: { start: string; end: string }[]
  ): Promise<DailyPlanResponse | null> => {
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-plan', {
        body: {
          action: 'GENERATE_DAILY_PLAN',
          payload: {
            userInput,
            todayDate: new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            existingTasks,
            preferences,
            availableFrom,
            unavailableSlots,
          },
        },
      });

      if (error) {
        console.error('AI plan error:', error);
        toast.error('Failed to generate plan');
        return null;
      }

      if (data.error) {
        toast.error(data.error);
        return null;
      }

      return data as DailyPlanResponse;
    } catch (error) {
      console.error('Error generating plan:', error);
      toast.error('Failed to generate plan');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateDailySummary = async (
    completedTasks: any[],
    focusSessions: any[],
    skippedTasks: any[],
    currentStreak: number
  ): Promise<DailySummaryResponse | null> => {
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-plan', {
        body: {
          action: 'DAILY_SUMMARY',
          payload: {
            completedTasks,
            focusSessions,
            skippedTasks,
            currentStreak,
          },
        },
      });

      if (error) {
        console.error('AI summary error:', error);
        return null;
      }

      return data as DailySummaryResponse;
    } catch (error) {
      console.error('Error generating summary:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    generateDailyPlan,
    generateDailySummary,
  };
}
