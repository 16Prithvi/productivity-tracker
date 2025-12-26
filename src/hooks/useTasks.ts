import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  priority: string;
  status: string;
  scheduled_date: string | null;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
  depends_on: string | null;
  study_material_id: string | null;
  ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTasks();
    } else {
      setTasks([]);
      setLoading(false);
    }
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (task: {
    title: string;
    category: string;
    description?: string;
    priority?: string;
    status?: string;
    scheduled_date?: string;
    start_time?: string;
    end_time?: string;
    notes?: string;
    depends_on?: string;
    study_material_id?: string;
    ai_generated?: boolean;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: task.title,
          category: task.category,
          description: task.description,
          priority: task.priority,
          status: task.status,
          scheduled_date: task.scheduled_date,
          start_time: task.start_time,
          end_time: task.end_time,
          notes: task.notes,
          depends_on: task.depends_on,
          study_material_id: task.study_material_id,
          ai_generated: task.ai_generated,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      setTasks((prev) => [...prev, data]);
      toast.success('Task created');
      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
      return null;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setTasks((prev) => prev.map((t) => (t.id === id ? data : t)));
      return data;
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
      return null;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success('Task deleted');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const bulkCreateTasks = async (newTasks: Array<{
    title: string;
    category: string;
    description?: string;
    priority?: string;
    status?: string;
    scheduled_date?: string;
    start_time?: string;
    end_time?: string;
    notes?: string;
    ai_generated?: boolean;
  }>) => {
    if (!user) return [];

    try {
      const tasksWithUser = newTasks.map((t) => ({
        title: t.title,
        category: t.category,
        description: t.description,
        priority: t.priority,
        status: t.status,
        scheduled_date: t.scheduled_date,
        start_time: t.start_time,
        end_time: t.end_time,
        notes: t.notes,
        ai_generated: t.ai_generated,
        user_id: user.id,
      }));

      const { data, error } = await supabase
        .from('tasks')
        .insert(tasksWithUser)
        .select();

      if (error) throw error;
      setTasks((prev) => [...prev, ...(data || [])]);
      toast.success(`${data?.length || 0} tasks added`);
      return data || [];
    } catch (error) {
      console.error('Error bulk creating tasks:', error);
      toast.error('Failed to create tasks');
      return [];
    }
  };

  return {
    tasks,
    loading,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    bulkCreateTasks,
  };
}
