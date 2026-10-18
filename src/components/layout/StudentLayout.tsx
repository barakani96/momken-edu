import React from 'react';
import { Outlet } from 'react-router-dom';
import { PortalShell } from '../../ui/layout/PortalShell';

export function StudentLayout() {
  return (
    <PortalShell portalId="student">
      <Outlet />
    </PortalShell>
  );
}

export default StudentLayout;
