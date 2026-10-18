import { NavigationRepository } from './navigation.repository';
import { NavigationAuditService } from './navigation.audit.service';
import { navigationCache } from './navigation.cache';
import { NavigationPolicy, PrincipalContext } from './navigation.policy';
import {
  NavigationMenuResponse,
  NavigationNode,
  NavigationItemType,
} from './navigation.types';
import {
  CreateMenuDto,
  UpdateMenuDto,
  CreateMenuItemDto,
  UpdateMenuItemDto,
  ReorderItemsDto,
  validateItemRoute,
  validateStableKey,
} from './navigation.dto';
import {
  NavigationNotFoundError,
  SelfParentingError,
  CyclicHierarchyError,
  ItemMenuMismatchError,
  InvalidHierarchyError,
} from './navigation.errors';

export class NavigationService {
  constructor(
    private readonly repository: NavigationRepository,
    private readonly auditService: NavigationAuditService
  ) {}

  /**
   * Retrieves a localized, authorized menu tree for client shells.
   * Enforces permissions, visibility, and translation fallback.
   */
  async getMenu(
    menuKey: string,
    locale = 'en',
    principal?: PrincipalContext | null
  ): Promise<NavigationMenuResponse> {
    const cacheKey = `menu:${menuKey}:${locale}:${principal?.roles?.join(',') || 'anon'}:${principal?.permissions?.slice(0, 5).join(',') || 'none'}`;
    const cached = navigationCache.get<NavigationMenuResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    const menu = await this.repository.findMenuByKey(menuKey, locale);
    if (!menu || !menu.isActive) {
      throw new NavigationNotFoundError(`Navigation menu '${menuKey}'`);
    }

    // Verify tenant authorization if menu is tenant-scoped
    if (menu.tenantId && !NavigationPolicy.isTenantAuthorized(menu.tenantId, principal?.tenantId)) {
      throw new NavigationNotFoundError(`Navigation menu '${menuKey}'`);
    }

    // Filter visible & enabled items that the principal has permissions for
    const visibleItems = menu.items.filter((item: any) => {
      if (!item.isVisible || !item.isEnabled) {
        return false;
      }
      return NavigationPolicy.isItemPermitted(item.permission, principal);
    });

    const visibleItemIds = new Set<string>(visibleItems.map((i: any) => i.id));
    const nodes = new Map<string, any>();

    for (const item of visibleItems) {
      const translation = item.translations?.[0];
      const translatedLabel = translation?.label?.trim() ? translation.label : item.label;

      let parsedMetadata = item.metadata;
      if (typeof item.metadata === 'string') {
        try {
          parsedMetadata = JSON.parse(item.metadata);
        } catch {
          parsedMetadata = item.metadata;
        }
      }

      nodes.set(item.id, {
        id: item.id,
        key: item.key,
        type: item.type as NavigationItemType,
        label: translatedLabel,
        path: item.path,
        icon: item.icon,
        permission: item.permission,
        moduleKey: item.moduleKey,
        openInNewTab: item.openInNewTab,
        metadata: parsedMetadata,
        sortOrder: item.sortOrder,
        children: [],
        parentId: item.parentId,
      });
    }

    const roots: any[] = [];

    for (const node of nodes.values()) {
      if (node.parentId) {
        const parent = nodes.get(node.parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          const parentInMenu = menu.items.find((i: any) => i.id === node.parentId);
          if (parentInMenu) {
            roots.push(node);
          } else {
            throw new InvalidHierarchyError(`Parent ${node.parentId} not found for item ${node.key}`);
          }
        }
      } else {
        roots.push(node);
      }
    }

    const sortNodes = (nodeList: any[]) => {
      nodeList.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      for (const node of nodeList) {
        if (node.children && node.children.length > 0) {
          sortNodes(node.children);
        }
      }
    };
    sortNodes(roots);

    const stripInternalFields = (node: any): NavigationNode => {
      const { parentId, ...publicNode } = node;
      return {
        ...publicNode,
        children: node.children.map(stripInternalFields),
      };
    };

    const response: NavigationMenuResponse = {
      key: menu.key,
      name: menu.name,
      version: menu.version,
      locale,
      items: roots.map(stripInternalFields),
    };

    navigationCache.set(cacheKey, response, 120);
    return response;
  }

  async listMenus(tenantId?: string): Promise<any[]> {
    return this.repository.findAllMenus(tenantId);
  }

  async getMenuById(id: string): Promise<any> {
    const menu = await this.repository.findMenuById(id);
    if (!menu) {
      throw new NavigationNotFoundError(`Menu with ID '${id}'`);
    }
    return menu;
  }

  async getAuditLogs(limit = 100, offset = 0, action?: string): Promise<any[]> {
    return this.auditService.getAuditLogs(limit, offset, action);
  }

  async createMenu(dto: CreateMenuDto, principal?: PrincipalContext | null): Promise<any> {
    NavigationPolicy.assertCanManage(principal);
    validateStableKey(dto.key);

    const created = await this.repository.createMenu(dto);
    navigationCache.invalidateAll();

    await this.auditService.logAction({
      action: 'CREATE_MENU',
      entityId: created.id,
      principal,
      details: { key: created.key, name: created.name },
    });

    return created;
  }

  async updateMenu(id: string, dto: UpdateMenuDto, principal?: PrincipalContext | null): Promise<any> {
    NavigationPolicy.assertCanManage(principal);
    const existing = await this.repository.findMenuById(id);
    if (!existing) {
      throw new NavigationNotFoundError(`Menu with ID '${id}'`);
    }

    const updated = await this.repository.updateMenu(id, dto);
    navigationCache.invalidateMenu(existing.key);

    await this.auditService.logAction({
      action: 'UPDATE_MENU',
      entityId: id,
      principal,
      details: dto,
    });

    return updated;
  }

  async deleteMenu(id: string, principal?: PrincipalContext | null): Promise<any> {
    NavigationPolicy.assertCanManage(principal);
    const existing = await this.repository.findMenuById(id);
    if (!existing) {
      throw new NavigationNotFoundError(`Menu with ID '${id}'`);
    }

    const deleted = await this.repository.deleteMenu(id);
    navigationCache.invalidateMenu(existing.key);

    await this.auditService.logAction({
      action: 'DELETE_MENU',
      entityId: id,
      principal,
      details: { key: existing.key, name: existing.name },
    });

    return deleted;
  }

  async addMenuItem(
    menuId: string,
    dto: CreateMenuItemDto,
    principal?: PrincipalContext | null
  ): Promise<any> {
    NavigationPolicy.assertCanManage(principal);
    validateStableKey(dto.key);
    validateItemRoute(dto.type, dto.path);

    const menu = await this.repository.findMenuById(menuId);
    if (!menu) {
      throw new NavigationNotFoundError(`Menu with ID '${menuId}'`);
    }

    if (dto.parentId) {
      const parent = await this.repository.findItemById(dto.parentId);
      if (!parent) {
        throw new NavigationNotFoundError(`Parent item '${dto.parentId}'`);
      }
      if (parent.menuId !== menuId) {
        throw new ItemMenuMismatchError(dto.parentId, menuId);
      }
    }

    const created = await this.repository.createItem(menuId, dto);
    navigationCache.invalidateMenu(menu.key);

    await this.auditService.logAction({
      action: 'CREATE_ITEM',
      entityId: created.id,
      principal,
      details: { menuKey: menu.key, itemKey: created.key, type: created.type, label: created.label },
    });

    return created;
  }

  async updateMenuItem(
    id: string,
    dto: UpdateMenuItemDto,
    principal?: PrincipalContext | null
  ): Promise<any> {
    NavigationPolicy.assertCanManage(principal);
    const existing = await this.repository.findItemById(id);
    if (!existing) {
      throw new NavigationNotFoundError(`Menu item with ID '${id}'`);
    }

    if (dto.key) {
      validateStableKey(dto.key);
    }

    const targetType = dto.type || existing.type;
    const targetPath = dto.path !== undefined ? dto.path : existing.path;
    validateItemRoute(targetType as NavigationItemType, targetPath);

    if (dto.parentId !== undefined && dto.parentId !== null) {
      if (dto.parentId === id) {
        throw new SelfParentingError(id);
      }

      const targetParent = await this.repository.findItemById(dto.parentId);
      if (!targetParent) {
        throw new NavigationNotFoundError(`Parent item '${dto.parentId}'`);
      }
      if (targetParent.menuId !== existing.menuId) {
        throw new ItemMenuMismatchError(dto.parentId, existing.menuId);
      }

      const ancestorIds = await this.repository.getAncestorIds(dto.parentId);
      if (ancestorIds.includes(id)) {
        throw new CyclicHierarchyError(existing.key, targetParent.key);
      }
    }

    const updated = await this.repository.updateItem(id, dto);
    navigationCache.invalidateAll();

    await this.auditService.logAction({
      action: 'UPDATE_ITEM',
      entityId: id,
      principal,
      details: dto,
    });

    return updated;
  }

  async deleteMenuItem(id: string, principal?: PrincipalContext | null): Promise<any> {
    NavigationPolicy.assertCanManage(principal);
    const existing = await this.repository.findItemById(id);
    if (!existing) {
      throw new NavigationNotFoundError(`Menu item with ID '${id}'`);
    }

    const deleted = await this.repository.deleteItem(id);
    navigationCache.invalidateAll();

    await this.auditService.logAction({
      action: 'DELETE_ITEM',
      entityId: id,
      principal,
      details: { itemKey: existing.key, label: existing.label },
    });

    return deleted;
  }

  async reorderMenuItems(
    menuId: string,
    dto: ReorderItemsDto,
    principal?: PrincipalContext | null
  ): Promise<void> {
    NavigationPolicy.assertCanManage(principal);
    const menu = await this.repository.findMenuById(menuId);
    if (!menu) {
      throw new NavigationNotFoundError(`Menu with ID '${menuId}'`);
    }

    const existingItems = await this.repository.findItemsByMenuId(menuId);
    const existingItemMap = new Map<string, any>(existingItems.map((i) => [i.id, i]));

    for (const itemInput of dto.items) {
      if (!existingItemMap.has(itemInput.id)) {
        throw new ItemMenuMismatchError(itemInput.id, menuId);
      }
      if (itemInput.parentId) {
        if (itemInput.parentId === itemInput.id) {
          throw new SelfParentingError(itemInput.id);
        }
        if (!existingItemMap.has(itemInput.parentId)) {
          throw new ItemMenuMismatchError(itemInput.parentId, menuId);
        }
      }
    }

    const proposedParent = new Map<string, string | null>();
    for (const i of existingItems) {
      proposedParent.set(i.id, i.parentId);
    }
    for (const itemInput of dto.items) {
      if (itemInput.parentId !== undefined) {
        proposedParent.set(itemInput.id, itemInput.parentId);
      }
    }

    for (const [itemId, parentId] of proposedParent.entries()) {
      let cur = parentId;
      const visited = new Set<string>([itemId]);
      while (cur) {
        if (visited.has(cur)) {
          const itemKey = existingItemMap.get(itemId)?.key || itemId;
          const parentKey = existingItemMap.get(cur)?.key || cur;
          throw new CyclicHierarchyError(itemKey, parentKey);
        }
        visited.add(cur);
        cur = proposedParent.get(cur) || null;
      }
    }

    await this.repository.reorderItems(menuId, dto.items);
    navigationCache.invalidateMenu(menu.key);

    await this.auditService.logAction({
      action: 'REORDER_ITEMS',
      entityId: menuId,
      principal,
      details: { count: dto.items.length },
    });
  }
}
