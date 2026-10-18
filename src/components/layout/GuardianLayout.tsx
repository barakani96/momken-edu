import React from 'react';
import { Outlet } from 'react-router-dom';
import { PortalShell } from '../../ui/layout/PortalShell';

export function GuardianLayout() {
  return (
    <PortalShell portalId="guardian">
      <Outlet />
    </PortalShell>
  );
}

export default GuardianLayout;
