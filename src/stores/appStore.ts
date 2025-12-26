import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// IndexedDB Storage adapter
const indexedDBStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const request = indexedDB.open('ProductivityDB', 1);
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('store')) {
          db.createObjectStore('store');
        }
      };
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction('store', 'readonly');
        const store = transaction.objectStore('store');
        const getRequest = store.get(name);
        
        getRequest.onsuccess = () => {
          resolve(getRequest.result || null);
        };
        
        getRequest.onerror = () => {
          resolve(null);
        };
      };
      
      request.onerror = () => {
        resolve(null);
      };
    });
  },
  
  setItem: async (name: string, value: string): Promise<void> => {
    return new Promise((resolve) => {
      const request = indexedDB.open('ProductivityDB', 1);
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('store')) {
          db.createObjectStore('store');
        }
      };
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction('store', 'readwrite');
        const store = transaction.objectStore('store');
        store.put(value, name);
        
        transaction.oncomplete = () => {
          resolve();
        };
      };
    });
  },
  
  removeItem: async (name: string): Promise<void> => {
    return new Promise((resolve) => {
      const request = indexedDB.open('ProductivityDB', 1);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction('store', 'readwrite');
        const store = transaction.objectStore('store');
        store.delete(name);
        
        transaction.oncomplete = () => {
          resolve();
        };
      };
    });
  },
};

export interface Task {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  category: 'dsa' | 'dev' | 'cloud' | 'core' | 'other';
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  links?: string[];
  completed: boolean;
  createdAt: string;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  startTime: string;
  endTime?: string;
  duration: number;
  completed: boolean;
}

export interface StudyMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'link' | 'note';
  url?: string;
  content?: string;
  category: string;
  tags: string[];
  status: 'not_started' | 'in_progress' | 'completed';
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly';
  progress: number;
  target: number;
  createdAt: string;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

interface AppState {
  tasks: Task[];
  focusSessions: FocusSession[];
  studyMaterials: StudyMaterial[];
  goals: Goal[];
  todos: Todo[];
  currentFocusSession: FocusSession | null;
  userName: string;
  
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  
  // Focus actions
  startFocusSession: (taskId?: string) => void;
  endFocusSession: () => void;
  
  // Study materials actions
  addStudyMaterial: (material: Omit<StudyMaterial, 'id' | 'createdAt'>) => void;
  updateStudyMaterial: (id: string, updates: Partial<StudyMaterial>) => void;
  deleteStudyMaterial: (id: string) => void;
  
  // Goal actions
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoalProgress: (id: string, progress: number) => void;
  deleteGoal: (id: string) => void;
  
  // Todo actions
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  
  // User actions
  setUserName: (name: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      tasks: [],
      focusSessions: [],
      studyMaterials: [],
      goals: [],
      todos: [],
      currentFocusSession: null,
      userName: 'User',
      
      addTask: (task) => {
        const newTask: Task = {
          ...task,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
      },
      
      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
      },
      
      deleteTask: (id) => {
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
      },
      
      toggleTaskComplete: (id) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          ),
        }));
      },
      
      startFocusSession: (taskId) => {
        const session: FocusSession = {
          id: generateId(),
          taskId,
          startTime: new Date().toISOString(),
          duration: 0,
          completed: false,
        };
        set({ currentFocusSession: session });
      },
      
      endFocusSession: () => {
        const { currentFocusSession } = get();
        if (currentFocusSession) {
          const endTime = new Date().toISOString();
          const duration = Math.floor(
            (new Date(endTime).getTime() - new Date(currentFocusSession.startTime).getTime()) / 1000
          );
          const completedSession: FocusSession = {
            ...currentFocusSession,
            endTime,
            duration,
            completed: true,
          };
          set((state) => ({
            focusSessions: [...state.focusSessions, completedSession],
            currentFocusSession: null,
          }));
        }
      },
      
      addStudyMaterial: (material) => {
        const newMaterial: StudyMaterial = {
          ...material,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ studyMaterials: [...state.studyMaterials, newMaterial] }));
      },
      
      updateStudyMaterial: (id, updates) => {
        set((state) => ({
          studyMaterials: state.studyMaterials.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        }));
      },
      
      deleteStudyMaterial: (id) => {
        set((state) => ({
          studyMaterials: state.studyMaterials.filter((m) => m.id !== id),
        }));
      },
      
      addGoal: (goal) => {
        const newGoal: Goal = {
          ...goal,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ goals: [...state.goals, newGoal] }));
      },
      
      updateGoalProgress: (id, progress) => {
        set((state) => ({
          goals: state.goals.map((g) => (g.id === id ? { ...g, progress } : g)),
        }));
      },
      
      deleteGoal: (id) => {
        set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
      },
      
      addTodo: (text) => {
        const newTodo: Todo = {
          id: generateId(),
          text,
          completed: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ todos: [...state.todos, newTodo] }));
      },
      
      toggleTodo: (id) => {
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          ),
        }));
      },
      
      deleteTodo: (id) => {
        set((state) => ({ todos: state.todos.filter((t) => t.id !== id) }));
      },
      
      setUserName: (name) => {
        set({ userName: name });
      },
    }),
    {
      name: 'productivity-app-data',
      storage: createJSONStorage(() => indexedDBStorage),
    }
  )
);
