import React, { createContext, useContext, useEffect, useCallback, ReactNode } from 'react';

type ShortcutCallback = (e: KeyboardEvent) => void;

interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  description: string;
  callback: ShortcutCallback;
}

interface KeyboardShortcutContextType {
  registerShortcut: (id: string, shortcut: Shortcut) => void;
  unregisterShortcut: (id: string) => void;
  getShortcuts: () => Record<string, Shortcut>;
}

const KeyboardShortcutContext = createContext<KeyboardShortcutContextType | undefined>(undefined);

export function KeyboardShortcutProvider({ children }: { children: ReactNode }) {
  const shortcuts = React.useRef<Record<string, Shortcut>>({});

  const registerShortcut = useCallback((id: string, shortcut: Shortcut) => {
    shortcuts.current[id] = shortcut;
  }, []);

  const unregisterShortcut = useCallback((id: string) => {
    delete shortcuts.current[id];
  }, []);

  const getShortcuts = useCallback(() => {
    return shortcuts.current;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      Object.values(shortcuts.current as Record<string, Shortcut>).forEach((shortcut: Shortcut) => {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = !!shortcut.ctrlKey === (e.ctrlKey || e.metaKey);
        const shiftMatch = !!shortcut.shiftKey === e.shiftKey;
        const altMatch = !!shortcut.altKey === e.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          e.preventDefault();
          shortcut.callback(e);
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <KeyboardShortcutContext.Provider value={{ registerShortcut, unregisterShortcut, getShortcuts }}>
      {children}
    </KeyboardShortcutContext.Provider>
  );
}

export function useKeyboardShortcuts() {
  const context = useContext(KeyboardShortcutContext);
  if (context === undefined) {
    throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutProvider');
  }
  return context;
}
