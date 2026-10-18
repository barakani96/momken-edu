import { create } from 'zustand';
import { logger } from '../core/logger';

export type AppTheme = 'white' | 'g10' | 'g90' | 'g100';

export interface UserContext {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
}

export interface AppState {
  currentUser: UserContext | null;
  activeModule: string | null;
  setCurrentUser: (user: UserContext | null) => void;
  setActiveModule: (module: string | null) => void;
  
  // Theme state
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleDarkTheme: () => void;

  // Sidebar state
  isSidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
  toggleSidebar: () => void;

  // Context state
  currentContext: { title: string; module: string } | null;
  setCurrentContext: (context: { title: string; module: string } | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  activeModule: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  setActiveModule: (module) => set({ activeModule: module }),
  
  theme: (localStorage.getItem('app-theme') as AppTheme) || 'white',
  setTheme: (theme) => {
    localStorage.setItem('app-theme', theme);
    document.documentElement.setAttribute('data-carbon-theme', theme);
    logger.info('AppStore', `Theme changed to ${theme}`);
    set({ theme });
  },
  toggleDarkTheme: () => {
    const current = get().theme;
    const isDark = current === 'g90' || current === 'g100';
    const newTheme = isDark ? 'white' : 'g100';
    get().setTheme(newTheme);
  },

  isSidebarExpanded: true,
  setSidebarExpanded: (expanded) => set({ isSidebarExpanded: expanded }),
  toggleSidebar: () => set((state) => ({ isSidebarExpanded: !state.isSidebarExpanded })),

  currentContext: null,
  setCurrentContext: (context) => {
    logger.debug('AppStore', 'Context changed', context);
    set({ currentContext: context });
  },
}));
