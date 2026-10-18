/**
 * Admin Console Authorization Components (Can, Cannot, PermissionGate, RoleGate, ScopeGate)
 */

import React, { ReactNode } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import { AdminAuthEngine } from '../../core/admin/adminAuth';
import { useAdminStore } from '../../core/admin/adminStore';
import { ScopeLevel } from '../../core/admin/adminTypes';

interface PermissionGateProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Can({ permission, children, fallback = null }: PermissionGateProps) {
  const { currentUser } = useAuth();
  const roles = currentUser?.roles || ['role_platform_admin'];
  const permissions = currentUser?.permissions || ['*'];

  const allowed = AdminAuthEngine.hasPermission(permissions, permission, roles);

  return allowed ? <>{children}</> : <>{fallback}</>;
}

export function Cannot({ permission, children, fallback = null }: PermissionGateProps) {
  const { currentUser } = useAuth();
  const roles = currentUser?.roles || ['role_platform_admin'];
  const permissions = currentUser?.permissions || ['*'];

  const allowed = AdminAuthEngine.hasPermission(permissions, permission, roles);

  return !allowed ? <>{children}</> : <>{fallback}</>;
}

export function RoleGate({
  allowedRoles,
  children,
  fallback = null,
}: {
  allowedRoles: string[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { currentUser } = useAuth();
  const userRoles = currentUser?.roles || ['role_platform_admin'];

  const hasRole = userRoles.some((r) => allowedRoles.includes(r) || r === 'role_platform_admin');

  return hasRole ? <>{children}</> : <>{fallback}</>;
}

export function ScopeGate({
  requiredScope,
  children,
  fallback = null,
}: {
  requiredScope: ScopeLevel;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { tenantContext } = useAdminStore();
  const isAllowed = AdminAuthEngine.isScopeAllowed(tenantContext.scope, requiredScope);

  return isAllowed ? <>{children}</> : <>{fallback}</>;
}

export const PermissionGate = Can;
