/**
 * EduCore Admin Console - Admin Authorization Gate
 * Route guard wrapping all protected administrative routes under /admin.
 */

import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { InlineNotification, Button, Tile } from '@carbon/react';
import { Security, UserAdmin } from '@carbon/icons-react';
import { useAuth } from '../../auth/AuthProvider';
import { useAdminStore } from '../../core/admin/adminStore';

export interface AdminAuthorizationGateProps {
  children?: React.ReactNode;
}

export function AdminAuthorizationGate({ children }: AdminAuthorizationGateProps) {
  const { currentUser, isAuthenticated, login } = useAuth();
  const location = useLocation();
  const storeUsers = useAdminStore((s) => s.users);

  // If unauthenticated, redirect to login page
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Find store profile matching user email
  const storeUser = storeUsers.find((u) => u.email === currentUser.email || u.id === currentUser.id);

  const combinedRoles = [
    ...(currentUser.roles || []),
    ...(storeUser?.roles || []),
  ];

  const combinedPermissions = [
    ...(currentUser.permissions || []),
  ];

  // Validate admin permissions / roles
  const isAdminAuthorized =
    combinedRoles.some((r) =>
      ['admin', 'role_platform_admin', 'PLATFORM_SUPER_ADMIN', 'role_campus_admin', 'role_org_admin', 'superadmin'].includes(r)
    ) ||
    combinedPermissions.includes('*') ||
    combinedPermissions.some((p) => p.startsWith('users.') || p.startsWith('settings.') || p.startsWith('system.'));

  if (!isAdminAuthorized) {
    return (
      <div className="cds--grid" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div className="cds--row cds--justify-center">
          <div className="cds--col-md-6 cds--col-lg-8">
            <Tile style={{ padding: '2.5rem', textAlign: 'center' }}>
              <Security size={48} style={{ fill: 'var(--cds-support-error)', marginBottom: '1rem' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--cds-text-primary)', marginBottom: '0.5rem' }}>
                Access Restricted: Platform Admin Required
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                Your current account context (<strong>{currentUser.email}</strong>) does not have platform administrative privileges required to access the EduCore Admin Console.
              </p>
              
              <InlineNotification
                kind="error"
                title="Authorization Fault"
                subtitle="Missing permissions: platform_admin.manage or role_platform_admin membership."
                hideCloseButton
                style={{ marginBottom: '1.5rem', textAlign: 'left' }}
              />

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Button kind="primary" renderIcon={UserAdmin} onClick={() => login()}>
                  Authenticate as Admin
                </Button>
                <Button kind="secondary" href="/dashboard">
                  Return to Student Portal
                </Button>
              </div>
            </Tile>
          </div>
        </div>
      </div>
    );
  }

  return <>{children ? children : <Outlet />}</>;
}

export default AdminAuthorizationGate;
