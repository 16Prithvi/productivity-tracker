import { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';

export function QuickTodosCard() {
  const { todos, addTodo, toggleTodo } = useAppStore();
  const [newTodo, setNewTodo] = useState('');

  const handleAdd = () => {
    if (newTodo.trim()) {
      addTodo(newTodo.trim());
      setNewTodo('');
    }
  };

  return (
    <div className="card-hover p-4 h-full flex flex-col">
      <h4 className="text-sm font-semibold text-foreground mb-3">Quick Todos</h4>
      
      {/* Add Todo */}
      <div className="flex items-center gap-2 mb-3">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add a quick task..."
          className="flex-1 h-8 px-3 rounded-lg bg-secondary border border-border-subtle text-foreground text-xs placeholder:text-foreground-muted focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
        <button
          onClick={handleAdd}
          className="h-8 w-8 flex items-center justify-center rounded-lg bg-success text-success-foreground hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Todo List */}
      <div className="flex-1 overflow-y-auto space-y-1.5">
        {todos.slice(0, 5).map((todo) => (
          <div
            key={todo.id}
            className={cn(
              'flex items-center gap-2 p-2 rounded-lg transition-colors',
              todo.completed ? 'bg-background-secondary' : 'bg-secondary hover:bg-muted'
            )}
          >
            <button
              onClick={() => toggleTodo(todo.id)}
              className={cn(
                'h-4 w-4 rounded border flex items-center justify-center shrink-0',
                todo.completed
                  ? 'bg-success border-success'
                  : 'border-border hover:border-success'
              )}
            >
              {todo.completed && <Check className="h-2.5 w-2.5 text-success-foreground" />}
            </button>
            <span
              className={cn(
                'flex-1 text-xs truncate',
                todo.completed ? 'text-foreground-muted line-through' : 'text-foreground'
              )}
            >
              {todo.text}
            </span>
          </div>
        ))}

        {todos.length === 0 && (
          <p className="text-xs text-foreground-muted text-center py-4">No todos yet</p>
        )}
      </div>
    </div>
  );
}
