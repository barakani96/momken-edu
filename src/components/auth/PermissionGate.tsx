/**
 * EduCore Admin Console - PermissionGate Component
 * Conditionally renders children controls based on user roles and permissions.
 */

import React from 'react';
import { useAuth } from '../../auth/AuthProvider';
import { AdminAuthEngine } from '../../core/admin/adminAuth';
import { useAdminStore } from '../../core/admin/adminStore';

export interface PermissionGateProps {
  /**
   * Required permission code(s) e.g. 'users.create' or ['roles.read', 'roles.manage']
   */
  permission?: string | string[];

  /**
   * Required role ID(s) or code(s) e.g. 'admin' or ['role_platform_admin', 'role_campus_admin']
   */
  role?: string | string[];

  /**
   * If true, user must satisfy ALL permissions/roles in list. If false, satisfying ANY is sufficient.
   */
  requireAll?: boolean;

  /**
   * Fallback element when permission check fails. Default is null.
   */
  fallback?: React.ReactNode;

  /**
   * Administrative controls to render when authorized.
   */
  children: React.ReactNode;
}

export function PermissionGate({
  permission,
  role,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { currentUser } = useAuth();
  const usersInStore = useAdminStore((s) => s.users);

  // Find detailed store profile if matching currentUser
  const storeUser = currentUser
    ? usersInStore.find((u) => u.email === currentUser.email || u.id === currentUser.id)
    : null;

  // Aggregate user permissions and roles
  const userRoles = [
    ...(currentUser?.roles || []),
    ...(storeUser?.roles || []),
  ];

  const userPermissions = [
    ...(currentUser?.permissions || []),
    ...(storeUser?.roles?.includes('role_platform_admin') ? ['*'] : []),
  ];

  // Superadmin bypass check
  const isSuperAdmin =
    userRoles.some((r) =>
      ['admin', 'role_platform_admin', 'PLATFORM_SUPER_ADMIN', 'superadmin'].includes(r)
    ) || userPermissions.includes('*');

  if (isSuperAdmin) {
    return <>{children}</>;
  }

  // 1. Role Verification
  let roleAllowed = true;
  if (role) {
    const requiredRoles = Array.isArray(role) ? role : [role];
    if (requireAll) {
      roleAllowed = requiredRoles.every((reqRole) => userRoles.includes(reqRole));
    } else {
      roleAllowed = requiredRoles.some((reqRole) => userRoles.includes(reqRole));
    }
  }

  // 2. Permission Verification
  let permissionAllowed = true;
  if (permission) {
    const requiredPermissions = Array.isArray(permission) ? permission : [permission];
    if (requireAll) {
      permissionAllowed = requiredPermissions.every((perm) =>
        AdminAuthEngine.hasPermission(userPermissions, perm, userRoles)
      );
    } else {
      permissionAllowed = requiredPermissions.some((perm) =>
        AdminAuthEngine.hasPermission(userPermissions, perm, userRoles)
      );
    }
  }

  const isAuthorized = roleAllowed && permissionAllowed;

  if (!isAuthorized) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export default PermissionGate;
