export type NavigationItemType = 'GROUP' | 'LINK' | 'EXTERNAL_LINK' | 'DIVIDER';

export interface NavigationNode {
  id: string;
  key: string;
  type: NavigationItemType;
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

export interface NavigationItemEntity {
  id: string;
  menuId: string;
  parentId: string | null;
  key: string;
  type: string;
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
  createdAt: Date;
  updatedAt: Date;
  translations?: NavigationTranslationEntity[];
}

export interface NavigationTranslationEntity {
  id: string;
  itemId: string;
  locale: string;
  label: string;
  description: string | null;
}

export interface NavigationMenuEntity {
  id: string;
  key: string;
  name: string;
  description: string | null;
  isActive: boolean;
  version: number;
  tenantId: string | null;
  createdAt: Date;
  updatedAt: Date;
  items?: NavigationItemEntity[];
}
