import { useState } from 'react';
import { Plus, Check, Trash2, Mail } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';

export function QuickTodos() {
  const { todos, addTodo, toggleTodo, deleteTodo } = useAppStore();
  const [newTodo, setNewTodo] = useState('');

  const handleAdd = () => {
    if (newTodo.trim()) {
      addTodo(newTodo.trim());
      setNewTodo('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className="card-hover p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Quick Todos</h3>
      </div>

      {/* Add Todo */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a quick task..."
          className="flex-1 h-10 px-4 rounded-xl bg-secondary border border-border-subtle text-foreground text-sm placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <button
          onClick={handleAdd}
          className="h-10 w-10 flex items-center justify-center rounded-xl bg-success text-success-foreground hover:opacity-90 transition-opacity"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Todo List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {todos.slice(0, 5).map((todo) => (
          <div
            key={todo.id}
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl transition-all duration-200',
              todo.completed ? 'bg-background-secondary' : 'bg-secondary hover:bg-muted'
            )}
          >
            <button
              onClick={() => toggleTodo(todo.id)}
              className={cn(
                'h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0',
                todo.completed
                  ? 'bg-success border-success'
                  : 'border-border hover:border-success'
              )}
            >
              {todo.completed && <Check className="h-3 w-3 text-success-foreground" />}
            </button>
            <span
              className={cn(
                'flex-1 text-sm truncate',
                todo.completed ? 'text-foreground-muted line-through' : 'text-foreground'
              )}
            >
              {todo.text}
            </span>
            <button className="h-6 w-6 flex items-center justify-center rounded-md bg-secondary text-foreground-muted hover:text-foreground transition-colors">
              <Mail className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {todos.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-6">
            <p className="text-sm text-foreground-muted">No todos yet. Add one above!</p>
          </div>
        )}
      </div>
    </div>
  );
}