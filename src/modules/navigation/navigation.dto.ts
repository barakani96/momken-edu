import { NavigationItemType } from './navigation.types';
import { InvalidRouteForTypeError } from './navigation.errors';

export interface CreateMenuDto {
  key: string;
  name: string;
  description?: string;
  isActive?: boolean;
  tenantId?: string;
}

export interface UpdateMenuDto {
  name?: string;
  description?: string;
  isActive?: boolean;
  tenantId?: string;
}

export interface NavigationTranslationDto {
  locale: string;
  label: string;
  description?: string;
}

export interface CreateMenuItemDto {
  key: string;
  type: NavigationItemType;
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
  metadata?: any;
  translations?: NavigationTranslationDto[];
}

export interface UpdateMenuItemDto {
  key?: string;
  type?: NavigationItemType;
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
  metadata?: any;
  translations?: NavigationTranslationDto[];
}

export interface ReorderItemInput {
  id: string;
  sortOrder: number;
  parentId?: string | null;
}

export interface ReorderItemsDto {
  items: ReorderItemInput[];
}

/**
 * Validates route constraint according to NavigationItemType:
 * - GROUP & DIVIDER must have NO route (null or empty string).
 * - LINK & EXTERNAL_LINK must have a non-empty route.
 */
export function validateItemRoute(type: NavigationItemType, path?: string | null): void {
  const trimmed = path?.trim();
  if (type === 'GROUP' || type === 'DIVIDER') {
    if (trimmed && trimmed.length > 0) {
      throw new InvalidRouteForTypeError(
        type,
        `Items of type ${type} must not have a route. Received path '${trimmed}'.`
      );
    }
  } else if (type === 'LINK' || type === 'EXTERNAL_LINK') {
    if (!trimmed || trimmed.length === 0) {
      throw new InvalidRouteForTypeError(
        type,
        `Items of type ${type} must have a non-empty route.`
      );
    }
  }
}

/**
 * Validates stable key format (e.g. 'students', 'attendance', 'finance.invoices')
 */
export function validateStableKey(key: string): void {
  if (!key || typeof key !== 'string' || key.trim().length === 0) {
    throw new Error('Key must be a non-empty string');
  }
  const cleanKey = key.trim();
  const validPattern = /^[a-zA-Z0-9_\-\.]+$/;
  if (!validPattern.test(cleanKey)) {
    throw new Error(`Invalid key format: '${key}'. Use alphanumeric characters, dots, hyphens, or underscores.`);
  }
}
