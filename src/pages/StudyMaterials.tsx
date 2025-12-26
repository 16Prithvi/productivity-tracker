import { useState } from 'react';
import { Plus, Search, Filter, FileText, Link2, BookOpen, MoreVertical, ExternalLink, Trash2 } from 'lucide-react';
import { AppLayout, Header } from '@/components/layout';
import { useStudyMaterials } from '@/hooks/useStudyMaterials';
import { AddMaterialSheet } from '@/components/study-materials/AddMaterialSheet';
import { cn } from '@/lib/utils';

const CATEGORIES = ['All', 'DSA', 'Development', 'Cloud', 'Core Subjects', 'Custom'];

const statusColors: Record<string, string> = {
  not_started: 'bg-muted text-foreground-muted',
  in_progress: 'bg-primary/20 text-primary',
  completed: 'bg-success/20 text-success',
  active: 'bg-primary/20 text-primary',
  pending: 'bg-warning/20 text-warning',
};

const statusLabels: Record<string, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
  active: 'Active',
  pending: 'Pending',
};

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  pdf: FileText,
  link: Link2,
  note: BookOpen,
  document: FileText,
  video: FileText,
};

const StudyMaterials = () => {
  const { materials, loading, deleteMaterial } = useStudyMaterials();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);

  const filteredMaterials = materials.filter((m) => {
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.tags && m.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  const groupedMaterials = filteredMaterials.reduce((acc, material) => {
    const category = material.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(material);
    return acc;
  }, {} as Record<string, typeof materials>);

  return (
    <AppLayout>
      <Header title="Study Materials" />

      <div className="p-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
          {/* Category Tabs */}
          <div className="flex items-center gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground-secondary hover:bg-muted'
                )}
              >
                {category}
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
                placeholder="Search materials..."
                className="w-64 h-10 pl-10 pr-4 rounded-xl bg-secondary border border-border-subtle text-foreground text-sm placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <button className="h-10 px-4 flex items-center gap-2 rounded-xl bg-secondary text-foreground-secondary hover:bg-muted transition-colors">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filter</span>
            </button>
            <button 
              onClick={() => setIsAddSheetOpen(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Material</span>
            </button>
          </div>
        </div>

        {/* Materials Grid */}
        <div className="space-y-8">
          {Object.entries(groupedMaterials).map(([category, categoryMaterials]) => (
            <div key={category}>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span>{category}</span>
                <span className="text-sm font-normal text-foreground-muted">
                  ({categoryMaterials.length})
                </span>
              </h2>

              <div className="grid grid-cols-3 gap-4">
                {categoryMaterials.map((material) => {
                  const TypeIcon = typeIcons[material.material_type] || FileText;

                  return (
                    <div
                      key={material.id}
                      className="card-hover p-5 group animate-in"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <TypeIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-foreground truncate">
                              {material.title}
                            </h3>
                            <p className="text-sm text-foreground-muted capitalize">
                              {material.material_type}
                            </p>
                          </div>
                        </div>
                        <button className="h-8 w-8 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 hover:bg-secondary transition-all">
                          <MoreVertical className="h-4 w-4 text-foreground-secondary" />
                        </button>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {material.tags && material.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 rounded-lg bg-secondary text-foreground-secondary"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                        <span
                          className={cn(
                            'text-xs px-2 py-1 rounded-full font-medium',
                            statusColors[material.status || 'not_started']
                          )}
                        >
                          {statusLabels[material.status || 'not_started']}
                        </span>

                        <div className="flex items-center gap-2">
                          {material.url && (
                            <a
                              href={material.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-secondary text-foreground-muted hover:text-primary transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          <button 
                            onClick={() => deleteMaterial(material.id)}
                            className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-destructive/20 text-foreground-muted hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredMaterials.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <BookOpen className="h-12 w-12 text-foreground-muted mb-4" />
              <p className="text-lg font-medium text-foreground">No materials found</p>
              <p className="text-foreground-secondary">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      <AddMaterialSheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen} />
    </AppLayout>
  );
};

export default StudyMaterials;
