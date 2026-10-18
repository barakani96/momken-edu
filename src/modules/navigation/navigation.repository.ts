import { PrismaClient } from '@prisma/client';
import {
  CreateMenuDto,
  UpdateMenuDto,
  CreateMenuItemDto,
  UpdateMenuItemDto,
  ReorderItemInput,
} from './navigation.dto';
import { NavigationMenuEntity, NavigationItemEntity } from './navigation.types';

export class NavigationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findMenuByKey(key: string, locale = 'en'): Promise<any | null> {
    return this.prisma.navigationMenu.findUnique({
      where: { key },
      include: {
        items: {
          orderBy: [{ sortOrder: 'asc' }, { key: 'asc' }],
          include: {
            translations: {
              where: { locale },
              take: 1,
            },
          },
        },
      },
    });
  }

  async findMenuById(id: string): Promise<any | null> {
    return this.prisma.navigationMenu.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: [{ sortOrder: 'asc' }, { key: 'asc' }],
          include: {
            translations: true,
          },
        },
      },
    });
  }

  async findAllMenus(tenantId?: string): Promise<any[]> {
    const where: any = {};
    if (tenantId) {
      where.OR = [{ tenantId }, { tenantId: null }];
    }
    return this.prisma.navigationMenu.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });
  }

  async createMenu(dto: CreateMenuDto): Promise<any> {
    return this.prisma.navigationMenu.create({
      data: {
        key: dto.key,
        name: dto.name,
        description: dto.description || null,
        isActive: dto.isActive ?? true,
        tenantId: dto.tenantId || null,
        version: 1,
      },
    });
  }

  async updateMenu(id: string, dto: UpdateMenuDto): Promise<any> {
    return this.prisma.navigationMenu.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.tenantId !== undefined ? { tenantId: dto.tenantId } : {}),
        version: { increment: 1 },
      },
    });
  }

  async deleteMenu(id: string): Promise<any> {
    return this.prisma.navigationMenu.delete({
      where: { id },
    });
  }

  async findItemById(id: string): Promise<any | null> {
    return this.prisma.navigationMenuItem.findUnique({
      where: { id },
      include: {
        translations: true,
        parent: true,
        children: true,
        menu: true,
      },
    });
  }

  async findItemsByMenuId(menuId: string): Promise<any[]> {
    return this.prisma.navigationMenuItem.findMany({
      where: { menuId },
      include: {
        translations: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { key: 'asc' }],
    });
  }

  async createItem(menuId: string, dto: CreateMenuItemDto): Promise<any> {
    const serializedMetadata =
      dto.metadata !== undefined && dto.metadata !== null
        ? typeof dto.metadata === 'string'
          ? dto.metadata
          : JSON.stringify(dto.metadata)
        : null;

    const created = await this.prisma.navigationMenuItem.create({
      data: {
        menuId,
        parentId: dto.parentId || null,
        key: dto.key,
        type: dto.type,
        label: dto.label,
        path: dto.path || null,
        icon: dto.icon || null,
        permission: dto.permission || null,
        moduleKey: dto.moduleKey || null,
        sortOrder: dto.sortOrder ?? 0,
        isVisible: dto.isVisible ?? true,
        isEnabled: dto.isEnabled ?? true,
        openInNewTab: dto.openInNewTab ?? false,
        metadata: serializedMetadata,
        translations: dto.translations && dto.translations.length > 0
          ? {
              create: dto.translations.map((tr) => ({
                locale: tr.locale,
                label: tr.label,
                description: tr.description || null,
              })),
            }
          : undefined,
      },
      include: {
        translations: true,
      },
    });

    // Increment menu version
    await this.prisma.navigationMenu.update({
      where: { id: menuId },
      data: { version: { increment: 1 } },
    });

    return created;
  }

  async updateItem(id: string, dto: UpdateMenuItemDto): Promise<any> {
    const existing = await this.prisma.navigationMenuItem.findUnique({
      where: { id },
      include: { translations: true, menu: true },
    });
    if (!existing) return null;

    const updateData: any = {};
    if (dto.key !== undefined) updateData.key = dto.key;
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.label !== undefined) updateData.label = dto.label;
    if (dto.path !== undefined) updateData.path = dto.path;
    if (dto.icon !== undefined) updateData.icon = dto.icon;
    if (dto.permission !== undefined) updateData.permission = dto.permission;
    if (dto.moduleKey !== undefined) updateData.moduleKey = dto.moduleKey;
    if (dto.sortOrder !== undefined) updateData.sortOrder = dto.sortOrder;
    if (dto.isVisible !== undefined) updateData.isVisible = dto.isVisible;
    if (dto.isEnabled !== undefined) updateData.isEnabled = dto.isEnabled;
    if (dto.openInNewTab !== undefined) updateData.openInNewTab = dto.openInNewTab;
    if (dto.parentId !== undefined) updateData.parentId = dto.parentId;
    if (dto.metadata !== undefined) {
      updateData.metadata =
        dto.metadata === null
          ? null
          : typeof dto.metadata === 'string'
          ? dto.metadata
          : JSON.stringify(dto.metadata);
    }

    const updated = await this.prisma.navigationMenuItem.update({
      where: { id },
      data: updateData,
      include: { translations: true },
    });

    // Update translations if provided
    if (dto.translations && dto.translations.length > 0) {
      for (const tr of dto.translations) {
        await this.prisma.navigationTranslation.upsert({
          where: {
            itemId_locale: {
              itemId: id,
              locale: tr.locale,
            },
          },
          create: {
            itemId: id,
            locale: tr.locale,
            label: tr.label,
            description: tr.description || null,
          },
          update: {
            label: tr.label,
            description: tr.description || null,
          },
        });
      }
    }

    // Increment menu version
    await this.prisma.navigationMenu.update({
      where: { id: existing.menuId },
      data: { version: { increment: 1 } },
    });

    return this.findItemById(id);
  }

  async deleteItem(id: string): Promise<any> {
    const existing = await this.prisma.navigationMenuItem.findUnique({
      where: { id },
      include: { children: true, menu: true },
    });
    if (!existing) return null;

    // Reparent direct children to parent of deleted item or null
    if (existing.children && existing.children.length > 0) {
      await this.prisma.navigationMenuItem.updateMany({
        where: { parentId: id },
        data: { parentId: existing.parentId },
      });
    }

    const deleted = await this.prisma.navigationMenuItem.delete({
      where: { id },
    });

    await this.prisma.navigationMenu.update({
      where: { id: existing.menuId },
      data: { version: { increment: 1 } },
    });

    return deleted;
  }

  /**
   * Transactional reordering of items within a menu.
   * Updates sortOrder and optional parentId for each item atomically.
   */
  async reorderItems(menuId: string, items: ReorderItemInput[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        const updatePayload: any = { sortOrder: item.sortOrder };
        if (item.parentId !== undefined) {
          updatePayload.parentId = item.parentId;
        }
        await tx.navigationMenuItem.update({
          where: { id: item.id },
          data: updatePayload,
        });
      }
      await tx.navigationMenu.update({
        where: { id: menuId },
        data: { version: { increment: 1 } },
      });
    });
  }

  /**
   * Retrieves all ancestor IDs for a given item ID (to detect cycles)
   */
  async getAncestorIds(targetItemId: string): Promise<string[]> {
    const ancestors: string[] = [];
    let currentId: string | null = targetItemId;

    while (currentId) {
      const item: any = await this.prisma.navigationMenuItem.findUnique({
        where: { id: currentId },
        select: { id: true, parentId: true },
      });
      if (!item || !item.parentId) {
        break;
      }
      ancestors.push(item.parentId);
      currentId = item.parentId;
      // Guard against infinite loop if cycle already existed in bad data
      if (ancestors.length > 50) break;
    }

    return ancestors;
  }
}
