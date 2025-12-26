-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  focus_duration INTEGER DEFAULT 25,
  break_duration INTEGER DEFAULT 5,
  ai_enabled BOOLEAN DEFAULT true,
  smart_breaks_enabled BOOLEAN DEFAULT true,
  daily_review_reminder BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create study_materials table
CREATE TABLE public.study_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  material_type TEXT NOT NULL CHECK (material_type IN ('pdf', 'link', 'note')),
  url TEXT,
  content TEXT,
  file_path TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own materials" ON public.study_materials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own materials" ON public.study_materials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own materials" ON public.study_materials FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own materials" ON public.study_materials FOR DELETE USING (auth.uid() = user_id);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  scheduled_date DATE,
  start_time TIME,
  end_time TIME,
  notes TEXT,
  depends_on UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  study_material_id UUID REFERENCES public.study_materials(id) ON DELETE SET NULL,
  ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- Create focus_sessions table
CREATE TABLE public.focus_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  break_taken BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions" ON public.focus_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sessions" ON public.focus_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sessions" ON public.focus_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Create daily_reviews table
CREATE TABLE public.daily_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  review_date DATE NOT NULL,
  tasks_completed INTEGER DEFAULT 0,
  tasks_skipped INTEGER DEFAULT 0,
  focus_time_minutes INTEGER DEFAULT 0,
  topics_covered TEXT[],
  ai_summary TEXT,
  streak_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, review_date)
);

ALTER TABLE public.daily_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reviews" ON public.daily_reviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own reviews" ON public.daily_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON public.daily_reviews FOR UPDATE USING (auth.uid() = user_id);

-- Create weekly_reviews table
CREATE TABLE public.weekly_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  total_focus_hours NUMERIC(5,2) DEFAULT 0,
  tasks_planned INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  most_productive_day TEXT,
  ai_suggestion TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

ALTER TABLE public.weekly_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own weekly reviews" ON public.weekly_reviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own weekly reviews" ON public.weekly_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own weekly reviews" ON public.weekly_reviews FOR UPDATE USING (auth.uid() = user_id);

-- Create trigger for profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_study_materials_updated_at BEFORE UPDATE ON public.study_materials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('study-materials', 'study-materials', false);

-- Storage policies
CREATE POLICY "Users can upload their own materials" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'study-materials' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view their own materials" ON storage.objects FOR SELECT USING (bucket_id = 'study-materials' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own materials" ON storage.objects FOR DELETE USING (bucket_id = 'study-materials' AND auth.uid()::text = (storage.foldername(name))[1]);