import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface FocusSession {
  id: string;
  user_id: string;
  task_id: string | null;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  break_taken: boolean;
  created_at: string;
}

export function useFocusSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSessions();
    } else {
      setSessions([]);
      setCurrentSession(null);
      setLoading(false);
    }
  }, [user]);

  const fetchSessions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('focus_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

      if (error) throw error;
      
      const active = data?.find((s) => !s.ended_at);
      if (active) {
        setCurrentSession(active);
      }
      
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (taskId?: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('focus_sessions')
        .insert({
          user_id: user.id,
          task_id: taskId || null,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      setCurrentSession(data);
      setSessions((prev) => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Failed to start focus session');
      return null;
    }
  };

  const endSession = async (breakTaken = false) => {
    if (!currentSession) return null;

    const endedAt = new Date().toISOString();
    const durationMinutes = Math.floor(
      (new Date(endedAt).getTime() - new Date(currentSession.started_at).getTime()) / 60000
    );

    try {
      const { data, error } = await supabase
        .from('focus_sessions')
        .update({
          ended_at: endedAt,
          duration_minutes: durationMinutes,
          break_taken: breakTaken,
        })
        .eq('id', currentSession.id)
        .select()
        .single();

      if (error) throw error;
      setCurrentSession(null);
      setSessions((prev) => prev.map((s) => (s.id === data.id ? data : s)));
      toast.success(`Focus session completed: ${durationMinutes} minutes`);
      return data;
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error('Failed to end focus session');
      return null;
    }
  };

  const getTodaySessions = () => {
    const today = new Date().toISOString().split('T')[0];
    return sessions.filter((s) => s.started_at.startsWith(today));
  };

  const getTodayFocusMinutes = () => {
    return getTodaySessions().reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
  };

  return {
    sessions,
    currentSession,
    loading,
    startSession,
    endSession,
    getTodaySessions,
    getTodayFocusMinutes,
  };
}
