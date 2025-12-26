import { useState } from 'react';
import { X, Sparkles, Loader2, Plus, Clock, Calendar } from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import { useTasks } from '@/hooks/useTasks';
import { useProfile } from '@/hooks/useProfile';
import { cn } from '@/lib/utils';

interface PlanMyDayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categoryMap: Record<string, string> = {
  DSA: 'dsa',
  Development: 'dev',
  Cloud: 'cloud',
  Core: 'core',
  Other: 'other',
};

export function PlanMyDayModal({ isOpen, onClose }: PlanMyDayModalProps) {
  const [userInput, setUserInput] = useState('');
  const [availableFrom, setAvailableFrom] = useState('09:00');
  const [unavailableStart, setUnavailableStart] = useState('');
  const [unavailableEnd, setUnavailableEnd] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [editingPlan, setEditingPlan] = useState<any[]>([]);

  const { loading, generateDailyPlan } = useAI();
  const { tasks, bulkCreateTasks } = useTasks();
  const { profile } = useProfile();

  const handleGenerate = async () => {
    if (!userInput.trim()) return;

    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter((t) => t.scheduled_date === today);

    const unavailableSlots =
      unavailableStart && unavailableEnd
        ? [{ start: unavailableStart, end: unavailableEnd }]
        : undefined;

    const result = await generateDailyPlan(
      userInput,
      todayTasks,
      {
        focusDuration: profile?.focus_duration || 25,
        breakDuration: profile?.break_duration || 5,
      },
      availableFrom,
      unavailableSlots
    );

    if (result) {
      setGeneratedPlan(result);
      setEditingPlan(result.schedule || []);
    }
  };

  const handleAddToTasks = async () => {
    if (!editingPlan.length) return;

    const today = new Date().toISOString().split('T')[0];
    const tasksToCreate = editingPlan.map((item) => ({
      title: item.title,
      category: categoryMap[item.category] || 'other',
      priority: item.priority || 'medium',
      scheduled_date: today,
      start_time: item.start,
      end_time: item.end,
      notes: item.notes,
      ai_generated: true,
    }));

    await bulkCreateTasks(tasksToCreate);
    onClose();
    setGeneratedPlan(null);
    setEditingPlan([]);
    setUserInput('');
  };

  const updatePlanItem = (index: number, field: string, value: string) => {
    setEditingPlan((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const removePlanItem = (index: number) => {
    setEditingPlan((prev) => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-background-secondary border border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Plan My Day</h2>
              <p className="text-sm text-foreground-muted">AI-powered daily planning</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="h-5 w-5 text-foreground-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {!generatedPlan ? (
            <div className="space-y-6">
              {/* Input */}
              <div>
                <label className="text-sm font-medium text-foreground-secondary block mb-2">
                  What do you want to accomplish today?
                </label>
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="I want to do DSA today – 3 questions. Web Dev – 3 topics. I'm not free from 1 PM to 5 PM."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border-subtle text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              {/* Time Constraints */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground-secondary block mb-2">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Available from
                  </label>
                  <input
                    type="time"
                    value={availableFrom}
                    onChange={(e) => setAvailableFrom(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-secondary border border-border-subtle text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground-secondary block">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Unavailable slot (optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={unavailableStart}
                      onChange={(e) => setUnavailableStart(e.target.value)}
                      placeholder="Start"
                      className="flex-1 h-11 px-4 rounded-xl bg-secondary border border-border-subtle text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <span className="flex items-center text-foreground-muted">to</span>
                    <input
                      type="time"
                      value={unavailableEnd}
                      onChange={(e) => setUnavailableEnd(e.target.value)}
                      placeholder="End"
                      className="flex-1 h-11 px-4 rounded-xl bg-secondary border border-border-subtle text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm text-foreground">{generatedPlan.summary}</p>
              </div>

              {/* Editable Schedule */}
              <div className="space-y-3">
                {editingPlan.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-secondary border border-border-subtle"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updatePlanItem(index, 'title', e.target.value)}
                          className="w-full h-10 px-3 rounded-lg bg-background border border-border-subtle text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <div className="flex items-center gap-3">
                          <input
                            type="time"
                            value={item.start}
                            onChange={(e) => updatePlanItem(index, 'start', e.target.value)}
                            className="h-9 px-3 rounded-lg bg-background border border-border-subtle text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                          <span className="text-foreground-muted">–</span>
                          <input
                            type="time"
                            value={item.end}
                            onChange={(e) => updatePlanItem(index, 'end', e.target.value)}
                            className="h-9 px-3 rounded-lg bg-background border border-border-subtle text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                          <span
                            className={cn(
                              'text-xs px-2 py-1 rounded-full',
                              item.category === 'DSA' && 'bg-category-dsa/20 text-category-dsa',
                              item.category === 'Development' && 'bg-category-dev/20 text-category-dev',
                              item.category === 'Cloud' && 'bg-category-cloud/20 text-category-cloud',
                              item.category === 'Core' && 'bg-category-core/20 text-category-core',
                              !['DSA', 'Development', 'Cloud', 'Core'].includes(item.category) &&
                                'bg-muted text-foreground-muted'
                            )}
                          >
                            {item.category}
                          </span>
                        </div>
                        {item.notes && (
                          <p className="text-sm text-foreground-secondary">{item.notes}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removePlanItem(index)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-destructive/20 text-foreground-muted hover:text-destructive transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border-subtle">
          {!generatedPlan ? (
            <button
              onClick={handleGenerate}
              disabled={loading || !userInput.trim()}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Plan</span>
                </>
              )}
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setGeneratedPlan(null);
                  setEditingPlan([]);
                }}
                className="btn-secondary"
              >
                Regenerate
              </button>
              <button
                onClick={handleAddToTasks}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add to Tasks</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
