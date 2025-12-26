import { useState } from 'react';
import { Plus, Search, BookMarked, Trash2, Check, Calendar, Link, FileText, ExternalLink, X } from 'lucide-react';
import { AppLayout, Header } from '@/components/layout';
import { cn } from '@/lib/utils';

interface Revision {
  id: string;
  title: string;
  category: string;
  notes?: string;
  pdfUrl?: string;
  linkUrl?: string;
  lastReviewed?: string;
  completed: boolean;
  createdAt: string;
}

const categoryColors: Record<string, string> = {
  dsa: 'bg-category-dsa',
  dev: 'bg-category-dev',
  cloud: 'bg-category-cloud',
  core: 'bg-category-core',
  other: 'bg-muted',
  DSA: 'bg-category-dsa',
  Dev: 'bg-category-dev',
  Cloud: 'bg-category-cloud',
  Core: 'bg-category-core',
};

const sampleRevisions: Revision[] = [
  {
    id: '1',
    title: 'Binary Trees - DFS & BFS',
    category: 'DSA',
    notes: 'Review traversal algorithms and practice problems',
    pdfUrl: '',
    linkUrl: 'https://leetcode.com/problems/binary-tree-inorder-traversal/',
    lastReviewed: new Date().toISOString().split('T')[0],
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'React Hooks Deep Dive',
    category: 'Dev',
    notes: 'useEffect, useMemo, useCallback patterns',
    linkUrl: 'https://react.dev/reference/react',
    completed: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'AWS Lambda & API Gateway',
    category: 'Cloud',
    notes: 'Serverless architecture patterns',
    pdfUrl: 'aws-lambda-guide.pdf',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Database Normalization',
    category: 'Core',
    notes: '1NF, 2NF, 3NF, BCNF forms',
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

type FilterType = 'all' | 'pending' | 'completed';

const Revisions = () => {
  const [revisions, setRevisions] = useState<Revision[]>(sampleRevisions);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRevision, setNewRevision] = useState({
    title: '',
    category: 'DSA',
    notes: '',
    pdfUrl: '',
    linkUrl: '',
  });

  const filteredRevisions = revisions.filter((rev) => {
    const matchesSearch = rev.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (filter) {
      case 'pending':
        return matchesSearch && !rev.completed;
      case 'completed':
        return matchesSearch && rev.completed;
      default:
        return matchesSearch;
    }
  });

  const toggleComplete = (id: string) => {
    setRevisions(revisions.map((rev) =>
      rev.id === id ? { ...rev, completed: !rev.completed, lastReviewed: new Date().toISOString().split('T')[0] } : rev
    ));
  };

  const deleteRevision = (id: string) => {
    setRevisions(revisions.filter((rev) => rev.id !== id));
  };

  const addRevision = () => {
    if (!newRevision.title.trim()) return;
    
    const revision: Revision = {
      id: Date.now().toString(),
      title: newRevision.title,
      category: newRevision.category,
      notes: newRevision.notes,
      pdfUrl: newRevision.pdfUrl,
      linkUrl: newRevision.linkUrl,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    
    setRevisions([revision, ...revisions]);
    setNewRevision({ title: '', category: 'DSA', notes: '', pdfUrl: '', linkUrl: '' });
    setIsAddModalOpen(false);
  };

  const pendingCount = revisions.filter((r) => !r.completed).length;
  const completedCount = revisions.filter((r) => r.completed).length;

  return (
    <AppLayout>
      <Header title="Revisions" />

      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card-hover p-4">
            <p className="text-sm text-foreground-muted mb-1">Total Bookmarks</p>
            <p className="text-2xl font-bold text-foreground">{revisions.length}</p>
          </div>
          <div className="card-hover p-4">
            <p className="text-sm text-foreground-muted mb-1">Pending Review</p>
            <p className="text-2xl font-bold text-warning">{pendingCount}</p>
          </div>
          <div className="card-hover p-4">
            <p className="text-sm text-foreground-muted mb-1">Completed</p>
            <p className="text-2xl font-bold text-success">{completedCount}</p>
          </div>
        </div>

        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2">
            {([
              { key: 'all', label: 'All' },
              { key: 'pending', label: 'Pending' },
              { key: 'completed', label: 'Completed' },
            ] as { key: FilterType; label: string }[]).map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                  filter === f.key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground-secondary hover:bg-muted'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search revisions..."
                className="w-64 h-10 pl-10 pr-4 rounded-xl bg-secondary border border-border-subtle text-foreground text-sm placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Revision</span>
            </button>
          </div>
        </div>

        {/* Revisions List */}
        <div className="space-y-3">
          {filteredRevisions.map((revision) => (
            <div
              key={revision.id}
              className={cn(
                'card-hover p-5 flex items-center gap-4 group animate-in',
                revision.completed && 'opacity-60'
              )}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleComplete(revision.id)}
                className={cn(
                  'h-7 w-7 rounded-lg border-2 flex items-center justify-center transition-colors shrink-0',
                  revision.completed
                    ? 'bg-success border-success'
                    : 'border-border hover:border-primary'
                )}
              >
                {revision.completed && <Check className="h-5 w-5 text-success-foreground" />}
              </button>

              {/* Category Indicator */}
              <div className={cn('w-1.5 h-14 rounded-full', categoryColors[revision.category])} />

              {/* Icon */}
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <BookMarked className="h-6 w-6 text-primary" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'font-medium text-foreground text-lg',
                  revision.completed && 'line-through text-foreground-muted'
                )}>
                  {revision.title}
                </p>
                <div className="flex items-center gap-4 mt-1.5">
                  <span className={cn(
                    'text-xs px-2.5 py-1 rounded-full text-white font-medium',
                    categoryColors[revision.category]
                  )}>
                    {revision.category}
                  </span>
                  {revision.notes && (
                    <span className="text-sm text-foreground-muted truncate max-w-[300px]">
                      {revision.notes}
                    </span>
                  )}
                </div>
              </div>

              {/* Attachments */}
              <div className="flex items-center gap-2">
                {revision.pdfUrl && (
                  <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center" title="Has PDF">
                    <FileText className="h-5 w-5 text-destructive" />
                  </div>
                )}
                {revision.linkUrl && (
                  <a 
                    href={revision.linkUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                    title="Open Link"
                  >
                    <ExternalLink className="h-5 w-5 text-primary" />
                  </a>
                )}
              </div>

              {/* Last Reviewed */}
              {revision.lastReviewed && (
                <div className="flex items-center gap-1.5 text-sm text-foreground-muted">
                  <Calendar className="h-4 w-4" />
                  <span>{revision.lastReviewed}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => deleteRevision(revision.id)}
                  className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-destructive/20 text-foreground-muted hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}

          {filteredRevisions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <BookMarked className="h-12 w-12 text-foreground-muted mb-4" />
              <p className="text-lg font-medium text-foreground">No revisions found</p>
              <p className="text-foreground-secondary">Bookmark topics to review later</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Revision Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background border border-border rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">Add Revision</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="h-5 w-5 text-foreground-muted" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground-secondary mb-1.5 block">Title *</label>
                <input
                  type="text"
                  value={newRevision.title}
                  onChange={(e) => setNewRevision({ ...newRevision, title: e.target.value })}
                  placeholder="e.g., Binary Search Trees"
                  className="w-full h-11 px-4 rounded-xl bg-secondary border border-border-subtle text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground-secondary mb-1.5 block">Category</label>
                <select
                  value={newRevision.category}
                  onChange={(e) => setNewRevision({ ...newRevision, category: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-secondary border border-border-subtle text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="DSA">DSA</option>
                  <option value="Dev">Development</option>
                  <option value="Cloud">Cloud</option>
                  <option value="Core">Core Subjects</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground-secondary mb-1.5 block">Notes</label>
                <textarea
                  value={newRevision.notes}
                  onChange={(e) => setNewRevision({ ...newRevision, notes: e.target.value })}
                  placeholder="Add any notes..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border-subtle text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground-secondary mb-1.5 flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  Link URL
                </label>
                <input
                  type="url"
                  value={newRevision.linkUrl}
                  onChange={(e) => setNewRevision({ ...newRevision, linkUrl: e.target.value })}
                  placeholder="https://example.com/resource"
                  className="w-full h-11 px-4 rounded-xl bg-secondary border border-border-subtle text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground-secondary mb-1.5 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  PDF Name (for reference)
                </label>
                <input
                  type="text"
                  value={newRevision.pdfUrl}
                  onChange={(e) => setNewRevision({ ...newRevision, pdfUrl: e.target.value })}
                  placeholder="e.g., dsa-notes.pdf"
                  className="w-full h-11 px-4 rounded-xl bg-secondary border border-border-subtle text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 h-11 rounded-xl bg-secondary text-foreground-secondary font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addRevision}
                disabled={!newRevision.title.trim()}
                className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Revision
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Revisions;