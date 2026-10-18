import React from 'react';
import { Outlet } from 'react-router-dom';
import { PortalShell } from '../../ui/layout/PortalShell';

export function InstructorLayout() {
  return (
    <PortalShell portalId="instructor">
      <Outlet />
    </PortalShell>
  );
}

export default InstructorLayout;
