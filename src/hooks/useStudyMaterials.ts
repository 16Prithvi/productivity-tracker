import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface StudyMaterial {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  material_type: string;
  url: string | null;
  content: string | null;
  file_path: string | null;
  tags: string[] | null;
  status: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export function useStudyMaterials() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMaterials();
    } else {
      setMaterials([]);
      setLoading(false);
    }
  }, [user]);

  const fetchMaterials = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('study_materials')
        .select('*')
        .eq('user_id', user.id)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMaterials(data || []);
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast.error('Failed to load study materials');
    } finally {
      setLoading(false);
    }
  };

  const createMaterial = async (material: {
    title: string;
    category: string;
    material_type: string;
    description?: string;
    url?: string;
    content?: string;
    file_path?: string;
    tags?: string[];
    status?: string;
    is_pinned?: boolean;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('study_materials')
        .insert({
          title: material.title,
          category: material.category,
          material_type: material.material_type,
          description: material.description,
          url: material.url,
          content: material.content,
          file_path: material.file_path,
          tags: material.tags,
          status: material.status,
          is_pinned: material.is_pinned,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      setMaterials((prev) => [data, ...prev]);
      toast.success('Material added');
      return data;
    } catch (error) {
      console.error('Error creating material:', error);
      toast.error('Failed to add material');
      return null;
    }
  };

  const updateMaterial = async (id: string, updates: Partial<StudyMaterial>) => {
    try {
      const { data, error } = await supabase
        .from('study_materials')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setMaterials((prev) => prev.map((m) => (m.id === id ? data : m)));
      return data;
    } catch (error) {
      console.error('Error updating material:', error);
      toast.error('Failed to update material');
      return null;
    }
  };

  const deleteMaterial = async (id: string) => {
    try {
      const { error } = await supabase.from('study_materials').delete().eq('id', id);
      if (error) throw error;
      setMaterials((prev) => prev.filter((m) => m.id !== id));
      toast.success('Material deleted');
    } catch (error) {
      console.error('Error deleting material:', error);
      toast.error('Failed to delete material');
    }
  };

  return {
    materials,
    loading,
    fetchMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial,
  };
}
