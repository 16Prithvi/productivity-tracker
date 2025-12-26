import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface DailyReview {
  id: string;
  user_id: string;
  review_date: string;
  tasks_completed: number;
  tasks_skipped: number;
  focus_time_minutes: number;
  topics_covered: string[] | null;
  ai_summary: string | null;
  streak_count: number;
  created_at: string;
}

export interface WeeklyReview {
  id: string;
  user_id: string;
  week_start: string;
  week_end: string;
  total_focus_hours: number;
  tasks_planned: number;
  tasks_completed: number;
  most_productive_day: string | null;
  ai_suggestion: string | null;
  created_at: string;
}

export function useReviews() {
  const { user } = useAuth();
  const [dailyReviews, setDailyReviews] = useState<DailyReview[]>([]);
  const [weeklyReviews, setWeeklyReviews] = useState<WeeklyReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReviews();
    } else {
      setDailyReviews([]);
      setWeeklyReviews([]);
      setLoading(false);
    }
  }, [user]);

  const fetchReviews = async () => {
    if (!user) return;

    try {
      const [dailyRes, weeklyRes] = await Promise.all([
        supabase
          .from('daily_reviews')
          .select('*')
          .eq('user_id', user.id)
          .order('review_date', { ascending: false })
          .limit(30),
        supabase
          .from('weekly_reviews')
          .select('*')
          .eq('user_id', user.id)
          .order('week_start', { ascending: false })
          .limit(12),
      ]);

      if (dailyRes.error) throw dailyRes.error;
      if (weeklyRes.error) throw weeklyRes.error;

      setDailyReviews(dailyRes.data || []);
      setWeeklyReviews(weeklyRes.data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOrUpdateDailyReview = async (review: Partial<DailyReview>) => {
    if (!user) return null;

    const today = new Date().toISOString().split('T')[0];

    try {
      const { data, error } = await supabase
        .from('daily_reviews')
        .upsert(
          {
            ...review,
            user_id: user.id,
            review_date: review.review_date || today,
          },
          { onConflict: 'user_id,review_date' }
        )
        .select()
        .single();

      if (error) throw error;
      
      setDailyReviews((prev) => {
        const exists = prev.find((r) => r.review_date === data.review_date);
        if (exists) {
          return prev.map((r) => (r.review_date === data.review_date ? data : r));
        }
        return [data, ...prev];
      });
      
      return data;
    } catch (error) {
      console.error('Error creating daily review:', error);
      return null;
    }
  };

  const getTodayReview = () => {
    const today = new Date().toISOString().split('T')[0];
    return dailyReviews.find((r) => r.review_date === today);
  };

  const getStreak = () => {
    const todayReview = getTodayReview();
    return todayReview?.streak_count || 0;
  };

  return {
    dailyReviews,
    weeklyReviews,
    loading,
    createOrUpdateDailyReview,
    getTodayReview,
    getStreak,
    fetchReviews,
  };
}
