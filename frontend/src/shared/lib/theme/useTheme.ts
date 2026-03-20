import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useTheme = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => {
        const current = get().theme;
        if (current === 'dark') set({ theme: 'light' });
        else if (current === 'light') set({ theme: 'dark' });
        else {
          // If system, check what system is and toggle
          const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          set({ theme: isSystemDark ? 'light' : 'dark' });
        }
      },
    }),
    {
      name: 'yavimax-theme', // name of the item in the storage (must be unique)
    }
  )
);
