import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchNavigationMenu, NavigationMenuResponse, NavigationNode } from '../api/navigationApi';

export interface UseNavigationMenuResult {
  menu: NavigationMenuResponse | null;
  items: NavigationNode[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useNavigationMenu(menuKey: string): UseNavigationMenuResult {
  const { i18n } = useTranslation();
  const locale = i18n.language || 'en';

  const [menu, setMenu] = useState<NavigationMenuResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const loadMenu = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchNavigationMenu(menuKey, locale, signal);
        if (!signal?.aborted) {
          setMenu(response);
          setError(null);
        }
      } catch (err: any) {
        if (!signal?.aborted) {
          console.error(`Failed to load navigation menu '${menuKey}':`, err);
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [menuKey, locale]
  );

  useEffect(() => {
    const controller = new AbortController();
    loadMenu(controller.signal);

    // Listen for custom menu-updated event from Menu Editor
    const handleMenuUpdated = (evt: Event) => {
      const customEvt = evt as CustomEvent<{ menuKey?: string }>;
      if (!customEvt.detail?.menuKey || customEvt.detail.menuKey === menuKey) {
        loadMenu();
      }
    };
    window.addEventListener('navigation-menu-updated', handleMenuUpdated);

    return () => {
      controller.abort();
      window.removeEventListener('navigation-menu-updated', handleMenuUpdated);
    };
  }, [loadMenu, menuKey]);

  return {
    menu,
    items: menu?.items || [],
    loading,
    error,
    refetch: () => loadMenu(),
  };
}
