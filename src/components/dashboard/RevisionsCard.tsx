import { BookMarked } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Revision {
  id: string;
  title: string;
  category: string;
}

// Sample revisions - in production this would come from a hook
const sampleRevisions: Revision[] = [
  { id: '1', title: 'Binary Trees', category: 'DSA' },
  { id: '2', title: 'React Hooks', category: 'Dev' },
  { id: '3', title: 'AWS S3', category: 'Cloud' },
];

export function RevisionsCard() {
  const navigate = useNavigate();
  const revisionCount = sampleRevisions.length;

  return (
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
        {sampleRevisions.slice(0, 3).map((rev) => (
          <span
            key={rev.id}
            className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/20 text-primary"
          >
            {rev.title}
          </span>
        ))}
      </div>
    </div>
  );
}
