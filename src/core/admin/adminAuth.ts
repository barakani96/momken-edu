/**
 * EduCore Admin Console - Authorization & Permission Engine
 */

import { ADMIN_PERMISSIONS, SYSTEM_ROLE_PERMISSIONS } from './adminPermissions';
import { Role, ScopeLevel, TenantContext } from './adminTypes';

export interface EffectivePermissionNode {
  code: string;
  module: string;
  resource: string;
  action: string;
  description: string;
  grantedVia: Array<{
    roleId: string;
    roleName: string;
    groupId?: string;
    groupName?: string;
    scope: ScopeLevel;
  }>;
}

export class AdminAuthEngine {
  /**
   * Checks if user permissions or roles satisfy a specific permission code e.g. 'users.create'
   */
  static hasPermission(
    userPermissions: string[],
    requiredPermission: string,
    userRoles: string[] = []
  ): boolean {
    if (!requiredPermission) return true;

    // Superadmin / Admin role bypass
    if (
      userRoles.includes('admin') ||
      userRoles.includes('role_platform_admin') ||
      userRoles.includes('PLATFORM_SUPER_ADMIN')
    ) {
      return true;
    }

    // Direct check or global read/write wildcards
    if (
      userPermissions.includes(requiredPermission) ||
      userPermissions.includes('*') ||
      userPermissions.includes('read:*') ||
      userPermissions.includes('write:*')
    ) {
      return true;
    }

    // Check wildcard match e.g. 'users.*'
    const [reqResource, reqAction] = requiredPermission.split('.');
    if (userPermissions.includes(`${reqResource}.*`)) {
      return true;
    }

    return false;
  }

  /**
   * Calculates effective access lineage tree showing how user permissions were granted
   */
  static getEffectivePermissionsLineage(
    userRoleIds: string[],
    allRoles: Role[],
    userGroupIds: string[] = []
  ): EffectivePermissionNode[] {
    const permissionMap = new Map<string, EffectivePermissionNode>();

    // Map out roles
    userRoleIds.forEach((roleId) => {
      const role = allRoles.find((r) => r.id === roleId || r.code === roleId);
      if (!role) return;

      const rolePerms = role.permissions || SYSTEM_ROLE_PERMISSIONS[roleId] || [];
      rolePerms.forEach((permCode) => {
        const meta = ADMIN_PERMISSIONS.find((p) => p.code === permCode);
        const node = permissionMap.get(permCode) || {
          code: permCode,
          module: meta?.module || 'system',
          resource: meta?.resource || permCode.split('.')[0],
          action: meta?.action || permCode.split('.')[1] || 'manage',
          description: meta?.description || `Permission ${permCode}`,
          grantedVia: [],
        };

        node.grantedVia.push({
          roleId: role.id,
          roleName: role.name,
          scope: role.scope,
        });

        permissionMap.set(permCode, node);
      });
    });

    return Array.from(permissionMap.values());
  }

  /**
   * Verifies if action is valid within active tenant context scope
   */
  static isScopeAllowed(
    userScope: ScopeLevel,
    targetScope: ScopeLevel
  ): boolean {
    const hierarchy: Record<ScopeLevel, number> = {
      platform: 4,
      organization: 3,
      campus: 2,
      department: 1,
    };

    return hierarchy[userScope] >= hierarchy[targetScope];
  }
}
