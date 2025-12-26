import { useState } from 'react';
import { X, Plus, Link2, Clock, Calendar, Flag, FileText, Repeat } from 'lucide-react';
import { useTasks, Task } from '@/hooks/useTasks';
import { useStudyMaterials, StudyMaterial } from '@/hooks/useStudyMaterials';
import { cn } from '@/lib/utils';
import { addDays, format } from 'date-fns';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTask?: Task;
}

const categories = [
  { value: 'dsa', label: 'DSA', color: 'bg-category-dsa' },
  { value: 'dev', label: 'Development', color: 'bg-category-dev' },
  { value: 'cloud', label: 'Cloud', color: 'bg-category-cloud' },
  { value: 'core', label: 'Core', color: 'bg-category-core' },
  { value: 'other', label: 'Other', color: 'bg-muted' },
];

const priorities = [
  { value: 'low', label: 'Low', color: 'text-foreground-muted' },
  { value: 'medium', label: 'Medium', color: 'text-warning' },
  { value: 'high', label: 'High', color: 'text-destructive' },
];

export function TaskModal({ isOpen, onClose, editTask }: TaskModalProps) {
  const [title, setTitle] = useState(editTask?.title || '');
  const [description, setDescription] = useState(editTask?.description || '');
  const [category, setCategory] = useState(editTask?.category || 'other');
  const [priority, setPriority] = useState(editTask?.priority || 'medium');
  const [scheduledDate, setScheduledDate] = useState(
    editTask?.scheduled_date || new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState(editTask?.start_time || '09:00');
  const [endTime, setEndTime] = useState(editTask?.end_time || '10:00');
  const [notes, setNotes] = useState(editTask?.notes || '');
  const [dependsOn, setDependsOn] = useState(editTask?.depends_on || '');
  const [studyMaterialId, setStudyMaterialId] = useState(editTask?.study_material_id || '');
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [repeatDays, setRepeatDays] = useState(7);

  const { tasks, createTask, updateTask, bulkCreateTasks } = useTasks();
  const { materials } = useStudyMaterials();

  const otherTasks = tasks.filter((t) => t.id !== editTask?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData = {
      title,
      description: description || undefined,
      category,
      priority,
      scheduled_date: scheduledDate,
      start_time: startTime,
      end_time: endTime,
      notes: notes || undefined,
      depends_on: dependsOn || undefined,
      study_material_id: studyMaterialId || undefined,
    };

    if (editTask) {
      await updateTask(editTask.id, taskData);
    } else if (repeatEnabled && repeatDays > 1) {
      // Create tasks for multiple days
      const tasksToCreate = [];
      const baseDate = new Date(scheduledDate);
      for (let i = 0; i < repeatDays; i++) {
        const date = addDays(baseDate, i);
        tasksToCreate.push({
          ...taskData,
          scheduled_date: format(date, 'yyyy-MM-dd'),
        });
      }
      await bulkCreateTasks(tasksToCreate);
    } else {
      await createTask(taskData);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg max-h-[90vh] overflow-hidden rounded-2xl bg-background-secondary border border-border shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border-subtle">
          <h2 className="text-lg font-semibold text-foreground">
            {editTask ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="h-5 w-5 text-foreground-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-5">
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-foreground-secondary block mb-2">
              Task Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full h-11 px-4 rounded-xl bg-secondary border border-border-subtle text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground-secondary block mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-secondary border border-border-subtle text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground-secondary block mb-2">
                <Flag className="inline h-4 w-4 mr-1" />
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-secondary border border-border-subtle text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {priorities.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground-secondary block mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Date
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-secondary border border-border-subtle text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground-secondary block mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                Start
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-secondary border border-border-subtle text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground-secondary block mb-2">
                End
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-secondary border border-border-subtle text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Repeat Task */}
          {!editTask && (
            <div className="p-4 rounded-xl bg-secondary/50 border border-border-subtle space-y-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setRepeatEnabled(!repeatEnabled)}
                  className={cn(
                    'h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors',
                    repeatEnabled ? 'bg-primary border-primary' : 'border-border hover:border-primary'
                  )}
                >
                  {repeatEnabled && <Repeat className="h-3 w-3 text-primary-foreground" />}
                </button>
                <label className="text-sm font-medium text-foreground-secondary">
                  Repeat this task for multiple days
                </label>
              </div>
              
              {repeatEnabled && (
                <div className="flex items-center gap-3 pl-8">
                  <span className="text-sm text-foreground-muted">Repeat for</span>
                  <input
                    type="number"
                    min="2"
                    max="30"
                    value={repeatDays}
                    onChange={(e) => setRepeatDays(Math.max(2, Math.min(30, parseInt(e.target.value) || 2)))}
                    className="w-16 h-9 px-3 rounded-lg bg-secondary border border-border-subtle text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <span className="text-sm text-foreground-muted">days</span>
                </div>
              )}
            </div>
          )}

          {/* Depends On */}
          {otherTasks.length > 0 && (
            <div>
              <label className="text-sm font-medium text-foreground-secondary block mb-2">
                <Link2 className="inline h-4 w-4 mr-1" />
                Depends On (optional)
              </label>
              <select
                value={dependsOn}
                onChange={(e) => setDependsOn(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-secondary border border-border-subtle text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">No dependency</option>
                {otherTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Study Material */}
          {materials.length > 0 && (
            <div>
              <label className="text-sm font-medium text-foreground-secondary block mb-2">
                <FileText className="inline h-4 w-4 mr-1" />
                Link Study Material (optional)
              </label>
              <select
                value={studyMaterialId}
                onChange={(e) => setStudyMaterialId(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-secondary border border-border-subtle text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">No material</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-foreground-secondary block mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-border-subtle text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-border-subtle">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleSubmit} className="btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>{editTask ? 'Save Changes' : 'Create Task'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
