import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShell } from './ShellContext';

export function ShellKeyboardBindings() {
  const navigate = useNavigate();
  const { togglePanel } = useShell();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is actively typing in an input field
      const target = e.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target.isContentEditable
      ) {
        return;
      }

      // Ctrl+K or Cmd+K for search (simulated by opening notifications/help for now, or just focus search)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        // Since there is no explicit search yet, we just log or focus a datatable search if exists
        const dataTableSearch = document.querySelector('.cds--search-input') as HTMLInputElement;
        if (dataTableSearch) {
          dataTableSearch.focus();
        } else {
          console.log('Global search activated via shortcut');
        }
      }

      // 'R' to refresh data
      if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        // Trigger a refresh (we can just reload, or look for a refresh button)
        const refreshBtn = document.querySelector('button[aria-label="Refresh Data"]') as HTMLButtonElement;
        if (refreshBtn) {
          refreshBtn.click();
        } else {
          window.location.reload();
        }
      }

      // 'Ctrl+D' or 'Cmd+D' for Dashboard
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        navigate('/');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate, togglePanel]);

  return null;
}
