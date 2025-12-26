import { FolderOpen, CheckCircle2, BookMarked } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useStudyMaterials } from '@/hooks/useStudyMaterials';
import { useNavigate } from 'react-router-dom';
import { FocusClockCard } from './FocusClockCard';

export function SummaryCards() {
  const { tasks } = useTasks();
  const { materials } = useStudyMaterials();
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter((t) => t.scheduled_date === today);
  const completedTasks = todayTasks.filter((t) => t.status === 'completed').length;

  // Study materials counts
  const activeMaterials = materials.filter(m => m.status === 'in_progress').length;

  // Sample revisions count
  const revisionCount = 3;

  return (
    <>
      {/* Tasks Done Card */}
      <div className="card-hover p-4 animate-in">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-foreground-secondary">Tasks Done</h4>
          <CheckCircle2 className="h-4 w-4 text-foreground-muted" />
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-foreground">{completedTasks}</span>
          <span className="text-sm text-foreground-muted">/ {todayTasks.length || 0}</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${todayTasks.length > 0 ? (completedTasks / todayTasks.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Revisions Card - Replaces Focus Time */}
      <div 
        className="card-hover p-4 animate-in cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all" 
        style={{ animationDelay: '50ms' }}
        onClick={() => navigate('/revisions')}
      >
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-foreground-secondary">Revisions</h4>
          <BookMarked className="h-4 w-4 text-foreground-muted" />
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-foreground">{revisionCount}</span>
          <span className="text-sm text-foreground-muted">Bookmarked</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {['Binary Trees', 'React Hooks', 'AWS S3'].map((topic) => (
            <span
              key={topic}
              className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/20 text-primary"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Study Materials Card - Clickable */}
      <div 
        className="card-hover p-4 animate-in cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all" 
        style={{ animationDelay: '100ms' }}
        onClick={() => navigate('/study-materials')}
      >
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-foreground-secondary">Study Materials</h4>
          <FolderOpen className="h-4 w-4 text-foreground-muted" />
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-foreground">{activeMaterials}</span>
          <span className="text-sm text-foreground-muted">Active</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {['DSA', 'Dev', 'Cloud'].map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-foreground-secondary"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Focus Clock Card - Below Study Materials */}
      <FocusClockCard />
    </>
  );
}
