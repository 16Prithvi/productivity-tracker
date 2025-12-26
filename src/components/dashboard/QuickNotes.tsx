import { useState } from 'react';
import { Plus, ExternalLink, Pin, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickNote {
  id: string;
  text: string;
  link?: string;
  pinned: boolean;
}

const sampleNotes: QuickNote[] = [
  { id: '1', text: 'Review React 19 docs', link: 'https://react.dev', pinned: true },
  { id: '2', text: 'AWS Certified Solutions Architect', link: 'https://aws.amazon.com', pinned: false },
  { id: '3', text: 'Dynamic Programming patterns', pinned: true },
];

export function QuickNotes() {
  const [notes, setNotes] = useState<QuickNote[]>(sampleNotes);
  const [newNote, setNewNote] = useState('');

  const handleAdd = () => {
    if (newNote.trim()) {
      setNotes((prev) => [
        { id: Date.now().toString(), text: newNote.trim(), pinned: false },
        ...prev,
      ]);
      setNewNote('');
    }
  };

  const togglePin = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const sortedNotes = [...notes].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div className="card-hover p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Notes & Links</h3>
      </div>

      {/* Add Note */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add a note or link..."
          className="flex-1 h-10 px-4 rounded-xl bg-secondary border border-border-subtle text-foreground text-sm placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <button
          onClick={handleAdd}
          className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {sortedNotes.slice(0, 5).map((note) => (
          <div
            key={note.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-secondary hover:bg-muted transition-colors group"
          >
            <span className="flex-1 text-sm text-foreground truncate">{note.text}</span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {note.link && (
                <a
                  href={note.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-primary/20 text-foreground-muted hover:text-primary transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              <button
                onClick={() => togglePin(note.id)}
                className={cn(
                  'h-6 w-6 flex items-center justify-center rounded-md transition-colors',
                  note.pinned
                    ? 'text-primary bg-primary/20'
                    : 'hover:bg-primary/20 text-foreground-muted hover:text-primary'
                )}
              >
                <Pin className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => deleteNote(note.id)}
                className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-destructive/20 text-foreground-muted hover:text-destructive transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
