export interface NavigationNode {
  id: string;
  key: string;
  type: 'GROUP' | 'LINK' | 'EXTERNAL_LINK' | 'DIVIDER';
  label: string;
  path: string | null;
  icon: string | null;
  permission?: string | null;
  moduleKey?: string | null;
  openInNewTab?: boolean;
  metadata?: any;
  sortOrder?: number;
  children: NavigationNode[];
}

export interface NavigationMenuResponse {
  key: string;
  name?: string;
  version: number;
  locale: string;
  items: NavigationNode[];
}

export async function fetchNavigationMenu(
  menuKey: string,
  locale: string,
  signal?: AbortSignal
): Promise<NavigationMenuResponse> {
  const query = new URLSearchParams({ locale });

  const response = await fetch(
    `/api/v1/navigation/menus/${encodeURIComponent(menuKey)}?${query}`,
    {
      credentials: 'include',
      signal,
      headers: {
        Accept: 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.message || `Navigation request failed: HTTP ${response.status}`
    );
  }

  return response.json() as Promise<NavigationMenuResponse>;
}
