import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'focus' | 'calm' | 'ocean' | 'forest';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'focus',
      setTheme: (theme) => {
        set({ theme });
        updateThemeClass(theme);
      },
      toggleTheme: () => {
        const themes: Theme[] = ['focus', 'calm', 'ocean', 'forest'];
        const currentIndex = themes.indexOf(get().theme);
        const newTheme = themes[(currentIndex + 1) % themes.length];
        set({ theme: newTheme });
        updateThemeClass(newTheme);
      },
    }),
    {
      name: 'productivity-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          updateThemeClass(state.theme);
        }
      },
    }
  )
);

function updateThemeClass(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove('theme-calm', 'theme-ocean', 'theme-forest');
  if (theme !== 'focus') {
    root.classList.add(`theme-${theme}`);
  }
}
