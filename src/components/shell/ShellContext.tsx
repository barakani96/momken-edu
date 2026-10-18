import React, { createContext, useContext, useState, useCallback } from 'react';

export type UtilityPanelType = 'notifications' | 'help' | 'settings' | 'user' | 'switcher' | null;

export interface ShellContextType {
  activePanel: UtilityPanelType;
  openPanel: (panel: UtilityPanelType) => void;
  closePanel: () => void;
  togglePanel: (panel: UtilityPanelType) => void;
  isSideNavExpanded: boolean;
  toggleSideNav: () => void;
  setSideNavExpanded: (expanded: boolean) => void;
  theme: 'white' | 'g100';
  setTheme: (theme: 'white' | 'g100') => void;
  panelLoading: Record<'notifications' | 'help' | 'settings', boolean>;
  setPanelLoading: (panel: 'notifications' | 'help' | 'settings', loading: boolean) => void;
  refreshPanel: (panel: 'notifications' | 'help' | 'settings') => void;
  isPageNavigating: boolean;
  setIsPageNavigating: (navigating: boolean) => void;
  triggerPageTransition: (durationMs?: number) => void;
  activeContext: { entity: string; component: string };
  setActiveContext: (context: { entity: string; component: string }) => void;
}

const ShellContext = createContext<ShellContextType | null>(null);

export function useShell(): ShellContextType {
  const context = useContext(ShellContext);
  if (!context) {
    throw new Error('useShell must be used within a ShellProvider');
  }
  return context;
}

export interface ShellProviderProps {
  children: React.ReactNode;
}

export function ShellProvider({ children }: ShellProviderProps) {
  const [activePanel, setActivePanel] = useState<UtilityPanelType>(null);
  const [isSideNavExpanded, setSideNavExpanded] = useState<boolean>(true);
  const [theme, setTheme] = useState<'white' | 'g100'>('white');
  const [isPageNavigating, setIsPageNavigating] = useState<boolean>(false);
  const [panelLoading, setPanelLoadingState] = useState<Record<'notifications' | 'help' | 'settings', boolean>>({
    notifications: false,
    help: false,
    settings: false,
  });
  const [activeContext, setActiveContextState] = useState<{ entity: string; component: string }>({
    entity: 'System',
    component: 'Dashboard',
  });

  const setActiveContext = useCallback((context: { entity: string; component: string }) => {
    setActiveContextState(prev => {
      if (prev.entity === context.entity && prev.component === context.component) {
        return prev;
      }
      return context;
    });
  }, []);

  const openPanel = useCallback((panel: UtilityPanelType) => {
    setActivePanel(panel);
  }, []);

  const closePanel = useCallback(() => {
    setActivePanel(null);
  }, []);

  const togglePanel = useCallback((panel: UtilityPanelType) => {
    setActivePanel((current) => {
      const willOpen = current !== panel;
      if (willOpen && (panel === 'notifications' || panel === 'help' || panel === 'settings')) {
        // Trigger a brief realistic skeleton state when opening for smooth feedback
        setPanelLoadingState((prev) => ({ ...prev, [panel]: true }));
        setTimeout(() => {
          setPanelLoadingState((prev) => ({ ...prev, [panel]: false }));
        }, 350);
      }
      return willOpen ? panel : null;
    });
  }, []);

  const toggleSideNav = useCallback(() => {
    setSideNavExpanded((current) => !current);
  }, []);

  const setPanelLoading = useCallback((panel: 'notifications' | 'help' | 'settings', loading: boolean) => {
    setPanelLoadingState((prev) => ({ ...prev, [panel]: loading }));
  }, []);

  const refreshPanel = useCallback((panel: 'notifications' | 'help' | 'settings') => {
    setPanelLoadingState((prev) => ({ ...prev, [panel]: true }));
    setTimeout(() => {
      setPanelLoadingState((prev) => ({ ...prev, [panel]: false }));
    }, 600);
  }, []);

  const triggerPageTransition = useCallback((durationMs = 280) => {
    setIsPageNavigating(true);
    setTimeout(() => {
      setIsPageNavigating(false);
    }, durationMs);
  }, []);

  const value: ShellContextType = {
    activePanel,
    openPanel,
    closePanel,
    togglePanel,
    isSideNavExpanded,
    toggleSideNav,
    setSideNavExpanded,
    theme,
    setTheme,
    panelLoading,
    setPanelLoading,
    refreshPanel,
    isPageNavigating,
    setIsPageNavigating,
    triggerPageTransition,
    activeContext,
    setActiveContext,
  };

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}
