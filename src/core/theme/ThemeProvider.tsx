import React, { useEffect, ReactNode } from 'react';
import { useAppStore } from '../../stores/useAppStore';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-carbon-theme', theme);
  }, [theme]);

  return <>{children}</>;
}
