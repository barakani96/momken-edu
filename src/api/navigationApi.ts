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

export interface NavigationMenuItemDetail {
  id: string;
  menuId: string;
  parentId: string | null;
  key: string;
  type: 'GROUP' | 'LINK' | 'EXTERNAL_LINK' | 'DIVIDER';
  label: string;
  path: string | null;
  icon: string | null;
  permission: string | null;
  moduleKey: string | null;
  sortOrder: number;
  isVisible: boolean;
  isEnabled: boolean;
  openInNewTab: boolean;
  metadata: string | null;
  createdAt: string;
  updatedAt: string;
  translations: Array<{
    id: string;
    itemId: string;
    locale: string;
    label: string;
    description: string | null;
  }>;
}

export interface NavigationMenuDetail {
  id: string;
  key: string;
  name: string;
  description: string | null;
  isActive: boolean;
  version: number;
  tenantId: string | null;
  createdAt: string;
  updatedAt: string;
  items: NavigationMenuItemDetail[];
}

export interface CreateMenuItemPayload {
  key: string;
  type: 'GROUP' | 'LINK' | 'EXTERNAL_LINK' | 'DIVIDER';
  label: string;
  path?: string | null;
  icon?: string | null;
  permission?: string | null;
  moduleKey?: string | null;
  sortOrder?: number;
  isVisible?: boolean;
  isEnabled?: boolean;
  openInNewTab?: boolean;
  parentId?: string | null;
  translations?: Array<{ locale: string; label: string; description?: string }>;
}

export interface UpdateMenuItemPayload {
  key?: string;
  type?: 'GROUP' | 'LINK' | 'EXTERNAL_LINK' | 'DIVIDER';
  label?: string;
  path?: string | null;
  icon?: string | null;
  permission?: string | null;
  moduleKey?: string | null;
  sortOrder?: number;
  isVisible?: boolean;
  isEnabled?: boolean;
  openInNewTab?: boolean;
  parentId?: string | null;
  translations?: Array<{ locale: string; label: string; description?: string }>;
}

/**
 * Authoritative API client function to fetch localized navigation menu tree from PostgreSQL / database
 */
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

/**
 * List all registered navigation menus
 */
export async function fetchNavigationMenus(): Promise<Array<{ id: string; key: string; name: string; description: string | null; isActive: boolean; version: number; _count?: { items: number } }>> {
  const response = await fetch('/api/v1/navigation/menus', {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Failed to list menus: HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Get single menu detail with all raw items and translations
 */
export async function fetchNavigationMenuDetail(menuId: string): Promise<NavigationMenuDetail> {
  const response = await fetch(`/api/v1/navigation/menus/by-id/${encodeURIComponent(menuId)}`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch menu detail: HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Create a new navigation menu
 */
export async function createNavigationMenu(payload: { key: string; name: string; description?: string; isActive?: boolean }): Promise<any> {
  const response = await fetch('/api/v1/navigation/menus', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Failed to create menu: HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Add a new menu item to a menu
 */
export async function createNavigationMenuItem(menuId: string, payload: CreateMenuItemPayload): Promise<any> {
  const response = await fetch(`/api/v1/navigation/menus/${encodeURIComponent(menuId)}/items`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Failed to create menu item: HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Update an existing menu item
 */
export async function updateNavigationMenuItem(itemId: string, payload: UpdateMenuItemPayload): Promise<any> {
  const response = await fetch(`/api/v1/navigation/items/${encodeURIComponent(itemId)}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Failed to update menu item: HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Delete a menu item
 */
export async function deleteNavigationMenuItem(itemId: string): Promise<any> {
  const response = await fetch(`/api/v1/navigation/items/${encodeURIComponent(itemId)}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Failed to delete menu item: HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Reorder menu items transactionally
 */
export async function reorderNavigationMenuItems(
  menuId: string,
  items: Array<{ id: string; sortOrder: number; parentId?: string | null }>
): Promise<any> {
  const response = await fetch(`/api/v1/navigation/menus/${encodeURIComponent(menuId)}/order`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ items }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Failed to reorder items: HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Fetch centralized navigation audit logs
 */
export async function fetchNavigationAuditLogs(limit = 100, offset = 0, action?: string): Promise<any[]> {
  const query = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (action) query.append('action', action);

  const response = await fetch(`/api/v1/navigation/audit-logs?${query}`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch audit logs: HTTP ${response.status}`);
  }
  return response.json();
}

