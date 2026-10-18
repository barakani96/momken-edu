import { defineAbility, Ability, AbilityBuilder } from '@casl/ability';
import { NavigationForbiddenError } from './navigation.errors';

export type Action = 'manage' | 'read' | 'create' | 'update' | 'delete';
export type Subject = 'NavigationMenu' | 'NavigationMenuItem' | 'all';

export interface PrincipalContext {
  id?: string;
  roles?: string[];
  permissions?: string[];
  tenantId?: string;
}

export type AppAbility = Ability<[Action, Subject]>;

export function defineAbilityFor(principal: PrincipalContext): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(Ability);

  const roles = principal.roles || [];
  const permissions = principal.permissions || [];

  const isAdmin = roles.some(role => 
    ['admin', 'superadmin', 'role_platform_admin', 'PLATFORM_SUPER_ADMIN'].includes(role)
  );

  if (isAdmin || permissions.includes('*')) {
    can('manage', 'all');
  } else {
    // Navigation management
    if (permissions.includes('navigation.manage') || permissions.includes('navigation.*') || permissions.includes('settings.manage')) {
      can('manage', 'NavigationMenu');
      can('manage', 'NavigationMenuItem');
    }
    
    // Read permissions
    can('read', 'NavigationMenu');
    can('read', 'NavigationMenuItem');
  }

  return build();
}

export class NavigationPolicy {
  static getAbility(principal?: PrincipalContext | null): AppAbility {
    return defineAbilityFor(principal || {});
  }

  static canManageNavigation(principal?: PrincipalContext | null): boolean {
    const ability = this.getAbility(principal);
    return ability.can('manage', 'NavigationMenu');
  }

  static assertCanManage(principal?: PrincipalContext | null): void {
    if (!this.canManageNavigation(principal)) {
      throw new NavigationForbiddenError('manage navigation menus and items');
    }
  }

  static isItemPermitted(
    requiredPermission?: string | null,
    principal?: PrincipalContext | null
  ): boolean {
    if (!requiredPermission || requiredPermission.trim().length === 0) {
      return true;
    }
    if (!principal) {
      return false;
    }

    const ability = this.getAbility(principal);
    // This allows passing a specific permission string as a check
    const permissions = principal.permissions || [];
    
    if (ability.can('manage', 'all') || permissions.includes(requiredPermission) || permissions.includes('*')) {
      return true;
    }

    const [reqResource] = requiredPermission.split('.');
    if (permissions.includes(`${reqResource}.*`)) {
      return true;
    }

    return false;
  }

  static isTenantAuthorized(menuTenantId?: string | null, principalTenantId?: string | null): boolean {
    if (!menuTenantId) return true; // Global menu
    if (!principalTenantId) return false;
    return menuTenantId === principalTenantId;
  }
}
